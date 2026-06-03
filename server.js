// ═══════════════════════════════════════════════════════
//  WanderWise — Backend Server (Node.js + Express)
//  Stack: Node.js, Express, MySQL2, bcryptjs, JWT
// ═══════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'wanderwise_jwt_secret_change_in_production';

// ── Middleware ──────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5500', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Database Pool ───────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wanderwise',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ── Auth Middleware ─────────────────────────────────────
function authenticate(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'Authorization token required.' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required.' });
  next();
}

// Input sanitizer (basic XSS prevention)
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

// ═══════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ error: 'All fields are required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Invalid email format.' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ error: 'Email is already registered.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [sanitize(firstName), sanitize(lastName), email.toLowerCase(), hashedPassword, 'user']
    );

    res.status(201).json({ message: 'Account created successfully.', userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!users.length)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, role: user.role, profilePhoto: user.profile_photo }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/auth/me  — returns current user from token
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, first_name, last_name, email, role, profile_photo, date_created FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!users.length) return res.status(404).json({ error: 'User not found.' });
    const u = users[0];
    res.json({ id: u.id, firstName: u.first_name, lastName: u.last_name, email: u.email, role: u.role, profilePhoto: u.profile_photo, dateCreated: u.date_created });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════
//  DESTINATIONS ROUTES
// ═══════════════════════════════════════════════════════

// GET /api/destinations  — list with optional ?search, ?category, ?sort
app.get('/api/destinations', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let sql = `
      SELECT d.*,
        IFNULL(AVG(r.rating), d.default_rating) AS avg_rating,
        COUNT(r.id) AS review_count
      FROM destinations d
      LEFT JOIN reviews r ON r.destination_id = d.id
      WHERE 1=1`;
    const params = [];

    if (search) { sql += ` AND (d.name LIKE ? OR d.location LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    if (category) { sql += ` AND d.category = ?`; params.push(category); }

    sql += ' GROUP BY d.id';
    if (sort === 'rating') sql += ' ORDER BY avg_rating DESC';
    else if (sort === 'newest') sql += ' ORDER BY d.date_added DESC';
    else sql += ' ORDER BY d.name ASC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/destinations/:id  — single destination with activities & reviews
app.get('/api/destinations/:id', async (req, res) => {
  try {
    const [dests] = await pool.query(
      `SELECT d.*, IFNULL(AVG(r.rating), d.default_rating) AS avg_rating, COUNT(r.id) AS review_count
       FROM destinations d LEFT JOIN reviews r ON r.destination_id = d.id
       WHERE d.id = ? GROUP BY d.id`,
      [req.params.id]
    );
    if (!dests.length) return res.status(404).json({ error: 'Destination not found.' });

    const [activities] = await pool.query('SELECT * FROM activity_checklists WHERE destination_id = ?', [req.params.id]);
    const [images] = await pool.query('SELECT * FROM destination_images WHERE destination_id = ?', [req.params.id]);
    const [reviews] = await pool.query(
      `SELECT rv.*, u.first_name, u.last_name FROM reviews rv
       JOIN users u ON u.id = rv.user_id
       WHERE rv.destination_id = ? ORDER BY rv.review_date DESC`,
      [req.params.id]
    );

    res.json({ ...dests[0], activities, images, reviews });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/destinations  — admin only
app.post('/api/destinations', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, location, category, imageUrl, mapLink, activities } = req.body;
    if (!name || !location || !category) return res.status(400).json({ error: 'Name, location, and category are required.' });

    const [result] = await pool.query(
      'INSERT INTO destinations (name, description, location, category, image_url, map_link, default_rating, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [sanitize(name), sanitize(description), sanitize(location), category, imageUrl, mapLink, 0, req.user.id]
    );
    const destId = result.insertId;

    if (activities?.length) {
      for (const act of activities) {
        await pool.query('INSERT INTO activity_checklists (destination_id, activity_name) VALUES (?, ?)', [destId, sanitize(act)]);
      }
    }
    res.status(201).json({ message: 'Destination created.', id: destId });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/destinations/:id  — admin only
app.put('/api/destinations/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, location, category, imageUrl, mapLink } = req.body;
    await pool.query(
      'UPDATE destinations SET name=?, description=?, location=?, category=?, image_url=?, map_link=? WHERE id=?',
      [sanitize(name), sanitize(description), sanitize(location), category, imageUrl, mapLink, req.params.id]
    );
    res.json({ message: 'Destination updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/destinations/:id  — admin only
app.delete('/api/destinations/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM destinations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Destination deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════
//  REVIEWS ROUTES
// ═══════════════════════════════════════════════════════

// POST /api/reviews
app.post('/api/reviews', authenticate, async (req, res) => {
  try {
    const { destinationId, rating, comment } = req.body;
    if (!destinationId || !rating || !comment)
      return res.status(400).json({ error: 'Destination, rating, and comment are required.' });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });

    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE user_id = ? AND destination_id = ?',
      [req.user.id, destinationId]
    );
    if (existing.length) return res.status(409).json({ error: 'You have already reviewed this destination.' });

    const [result] = await pool.query(
      'INSERT INTO reviews (user_id, destination_id, rating, comment) VALUES (?, ?, ?, ?)',
      [req.user.id, destinationId, rating, sanitize(comment)]
    );
    res.status(201).json({ message: 'Review submitted.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/reviews/:id  — owner or admin
app.delete('/api/reviews/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id FROM reviews WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Review not found.' });
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Unauthorized.' });
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════
//  FAVORITES ROUTES
// ═══════════════════════════════════════════════════════

// GET /api/favorites  — current user's favorites
app.get('/api/favorites', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.*, d.name, d.location, d.category, d.image_url,
              IFNULL(AVG(r.rating), d.default_rating) AS avg_rating
       FROM favorites f
       JOIN destinations d ON d.id = f.destination_id
       LEFT JOIN reviews r ON r.destination_id = d.id
       WHERE f.user_id = ?
       GROUP BY f.id`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/favorites
app.post('/api/favorites', authenticate, async (req, res) => {
  try {
    const { destinationId } = req.body;
    if (!destinationId) return res.status(400).json({ error: 'Destination ID required.' });
    const [existing] = await pool.query('SELECT id FROM favorites WHERE user_id = ? AND destination_id = ?', [req.user.id, destinationId]);
    if (existing.length) return res.status(409).json({ error: 'Already in favorites.' });
    await pool.query('INSERT INTO favorites (user_id, destination_id) VALUES (?, ?)', [req.user.id, destinationId]);
    res.status(201).json({ message: 'Added to favorites.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/favorites/:destinationId
app.delete('/api/favorites/:destinationId', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM favorites WHERE user_id = ? AND destination_id = ?', [req.user.id, req.params.destinationId]);
    res.json({ message: 'Removed from favorites.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════
//  PLANNED TRIPS ROUTES
// ═══════════════════════════════════════════════════════

// GET /api/trips
app.get('/api/trips', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT pt.*, d.name AS destination_name, d.location
       FROM planned_trips pt JOIN destinations d ON d.id = pt.destination_id
       WHERE pt.user_id = ? ORDER BY pt.start_date ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/trips
app.post('/api/trips', authenticate, async (req, res) => {
  try {
    const { destinationId, tripName, startDate, endDate, notes } = req.body;
    if (!destinationId || !tripName || !startDate || !endDate)
      return res.status(400).json({ error: 'All trip fields are required.' });
    if (new Date(endDate) < new Date(startDate))
      return res.status(400).json({ error: 'End date must be after start date.' });
    const [result] = await pool.query(
      'INSERT INTO planned_trips (user_id, destination_id, trip_name, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, destinationId, sanitize(tripName), startDate, endDate, sanitize(notes || '')]
    );
    res.status(201).json({ message: 'Trip planned.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/trips/:id
app.delete('/api/trips/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id FROM planned_trips WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Trip not found.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized.' });
    await pool.query('DELETE FROM planned_trips WHERE id = ?', [req.params.id]);
    res.json({ message: 'Trip deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════
//  USER PROFILE ROUTES
// ═══════════════════════════════════════════════════════

// PUT /api/users/profile
app.put('/api/users/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    if (!firstName || !lastName || !email) return res.status(400).json({ error: 'All fields required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email.' });
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
    if (existing.length) return res.status(409).json({ error: 'Email already in use.' });
    await pool.query('UPDATE users SET first_name=?, last_name=?, email=? WHERE id=?',
      [sanitize(firstName), sanitize(lastName), email.toLowerCase(), req.user.id]);
    res.json({ message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/users/profile-photo  — expects { photoBase64: "data:image/..." }
app.put('/api/users/profile-photo', authenticate, async (req, res) => {
  try {
    const { photoBase64 } = req.body;
    if (!photoBase64) return res.status(400).json({ error: 'Photo data required.' });
    await pool.query('UPDATE users SET profile_photo = ? WHERE id = ?', [photoBase64, req.user.id]);
    res.json({ message: 'Profile photo updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════
//  ADMIN ROUTES
// ═══════════════════════════════════════════════════════

// GET /api/admin/stats
app.get('/api/admin/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [[{ destCount }]] = await pool.query('SELECT COUNT(*) AS destCount FROM destinations');
    const [[{ userCount }]] = await pool.query("SELECT COUNT(*) AS userCount FROM users WHERE role='user'");
    const [[{ reviewCount }]] = await pool.query('SELECT COUNT(*) AS reviewCount FROM reviews');
    const [[{ favCount }]] = await pool.query('SELECT COUNT(*) AS favCount FROM favorites');
    res.json({ destinations: destCount, users: userCount, reviews: reviewCount, favorites: favCount });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, first_name, last_name, email, role, date_created FROM users ORDER BY date_created DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/admin/users/:id
app.delete('/api/admin/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id)
      return res.status(400).json({ error: 'Cannot delete your own account.' });
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── Health Check ────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── 404 Handler ─────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));

// ── Error Handler ───────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => console.log(`WanderWise API running on http://localhost:${PORT}`));
module.exports = app;
