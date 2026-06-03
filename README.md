# WanderWise — Complete System Documentation

> Travel Itinerary Platform | Built from SRS v1.0

---

## 1. System Overview

**WanderWise** is a web-based travel planning platform. It provides users with curated destination information (descriptions, image galleries, activity checklists, maps, and reviews), and allows registered users to save favorites, plan trips, and manage personal profiles. Administrators manage destination content and moderate user-generated content.

---

## 2. User Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Guest** | Unauthenticated visitor | Browse destinations, view details, read reviews |
| **Registered User** | Account holder | + Save favorites, write reviews, plan trips, manage profile |
| **Administrator** | Platform manager | + Add/edit/delete destinations, manage users, moderate reviews |

---

## 3. Functional Requirements → Implementation Map

| FR | Requirement | Implementation |
|----|-------------|----------------|
| FR-1 | User Registration | `POST /api/auth/register` → Register page form |
| FR-2 | User Authentication | `POST /api/auth/login` → JWT issued, stored in-memory |
| FR-3 | Destination Browsing | `GET /api/destinations` → Destinations page grid |
| FR-4 | Search, Filter, Sort | Query params: `?search=&category=&sort=` |
| FR-5 | Destination Details | `GET /api/destinations/:id` → Detail page |
| FR-6 | Favorites Management | `POST/DELETE /api/favorites` → Profile > Favorites tab |
| FR-7 | User Profile | `PUT /api/users/profile` → Profile page |
| FR-8 | Validation & Errors | Client-side + server-side validation on all inputs |

---

## 4. Website Structure (Sitemap)

```
WanderWise/
├── Home Page              (/)
│   ├── Hero + Search bar
│   ├── Featured Destinations
│   ├── How It Works
│   └── Stats Section
├── Destinations Page      (/destinations)
│   ├── Filter Sidebar     (Category checkboxes, Sort, Search)
│   └── Destination Cards  (Grid / List toggle)
├── Destination Detail     (/destinations/:id)
│   ├── Hero image + metadata
│   ├── Description
│   ├── Image Gallery
│   ├── Activity Checklist
│   ├── Location Map
│   ├── User Reviews
│   └── Action Sidebar     (Save Favorite, Plan Trip)
├── Login Page             (/login)
├── Register Page          (/register)
├── Profile Page           (/profile)  [Auth required]
│   ├── My Info tab        (Edit name, email, photo)
│   ├── Favorites tab
│   ├── Planned Trips tab
│   └── My Reviews tab
└── Admin Panel            (/admin)    [Admin only]
    ├── Dashboard          (Stats + activity log)
    ├── Manage Destinations (CRUD table)
    ├── User Management    (View + remove users)
    └── Review Moderation  (View + remove reviews)
```

---

## 5. API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### AUTH ENDPOINTS

#### `POST /auth/register`
Create a new user account.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName":  "Doe",
  "email":     "jane@example.com",
  "password":  "SecurePass123"
}
```

**Response `201`:**
```json
{ "message": "Account created successfully.", "userId": 3 }
```

**Error Responses:**
- `400` — Missing fields / invalid email / password too short
- `409` — Email already registered

---

#### `POST /auth/login`
Authenticate and receive a JWT.

**Request Body:**
```json
{ "email": "jane@example.com", "password": "SecurePass123" }
```

**Response `200`:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": 3,
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "role": "user",
    "profilePhoto": null
  }
}
```

**Error Responses:**
- `400` — Missing fields
- `401` — Invalid credentials

---

#### `GET /auth/me`
Get current authenticated user. **[Auth required]**

**Response `200`:**
```json
{
  "id": 3, "firstName": "Jane", "lastName": "Doe",
  "email": "jane@example.com", "role": "user",
  "profilePhoto": null, "dateCreated": "2024-02-01"
}
```

---

### DESTINATION ENDPOINTS

#### `GET /destinations`
List all destinations with optional filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Name or location keyword |
| `category` | string | Beach, Mountain, City, Cultural, Adventure, Nature |
| `sort` | string | `name` (default), `rating`, `newest` |

**Response `200`:**
```json
[
  {
    "id": 1, "name": "Santorini", "location": "Greece",
    "category": "Beach", "image_url": "https://...",
    "avg_rating": 4.8, "review_count": 24, "date_added": "2024-01-10"
  }
]
```

---

#### `GET /destinations/:id`
Get full destination details including activities, images, and reviews.

**Response `200`:**
```json
{
  "id": 1, "name": "Santorini", "location": "Greece",
  "description": "...", "category": "Beach",
  "image_url": "https://...", "avg_rating": 4.8,
  "activities": [
    { "id": 1, "destination_id": 1, "activity_name": "Sunset watching at Oia" }
  ],
  "images": [
    { "id": 1, "image_url": "https://...", "alt_text": "Caldera view" }
  ],
  "reviews": [
    {
      "id": 1, "rating": 5, "comment": "Magical!",
      "review_date": "2024-02-10",
      "first_name": "Jane", "last_name": "D."
    }
  ]
}
```

---

#### `POST /destinations` **[Admin only]**
Add a new destination.

**Request Body:**
```json
{
  "name": "New Destination",
  "description": "A wonderful place...",
  "location": "Country",
  "category": "Beach",
  "imageUrl": "https://...",
  "mapLink": "https://maps.google.com/...",
  "activities": ["Activity 1", "Activity 2"]
}
```

**Response `201`:** `{ "message": "Destination created.", "id": 11 }`

---

#### `PUT /destinations/:id` **[Admin only]**
Update an existing destination.

**Request Body:** Same as POST (without activities array)

**Response `200`:** `{ "message": "Destination updated." }`

---

#### `DELETE /destinations/:id` **[Admin only]**
Delete a destination and all associated data.

**Response `200`:** `{ "message": "Destination deleted." }`

---

### REVIEWS ENDPOINTS

#### `POST /reviews` **[Auth required]**
Submit a review. One review per user per destination.

**Request Body:**
```json
{
  "destinationId": 1,
  "rating": 5,
  "comment": "Absolutely stunning place!"
}
```

**Response `201`:** `{ "message": "Review submitted.", "id": 5 }`

**Error:** `409` if user has already reviewed this destination.

---

#### `DELETE /reviews/:id` **[Auth required — owner or admin]**

**Response `200`:** `{ "message": "Review deleted." }`

---

### FAVORITES ENDPOINTS

#### `GET /favorites` **[Auth required]**
Get current user's saved favorites.

**Response `200`:**
```json
[
  {
    "id": 1, "destination_id": 1, "name": "Santorini",
    "location": "Greece", "category": "Beach",
    "image_url": "https://...", "avg_rating": 4.8,
    "date_saved": "2024-02-05"
  }
]
```

---

#### `POST /favorites` **[Auth required]**
Add a destination to favorites.

**Request Body:** `{ "destinationId": 1 }`

**Response `201`:** `{ "message": "Added to favorites." }`

**Error:** `409` if already in favorites.

---

#### `DELETE /favorites/:destinationId` **[Auth required]**
Remove a destination from favorites.

**Response `200`:** `{ "message": "Removed from favorites." }`

---

### PLANNED TRIPS ENDPOINTS

#### `GET /trips` **[Auth required]**
Get all planned trips for current user.

**Response `200`:**
```json
[
  {
    "id": 1, "trip_name": "Summer Adventure",
    "destination_id": 1, "destination_name": "Santorini",
    "location": "Greece", "start_date": "2024-07-01",
    "end_date": "2024-07-10", "notes": "Book hotel early!"
  }
]
```

---

#### `POST /trips` **[Auth required]**
Create a planned trip.

**Request Body:**
```json
{
  "destinationId": 1,
  "tripName": "Summer Adventure",
  "startDate": "2024-07-01",
  "endDate": "2024-07-10",
  "notes": "Book hotel early!"
}
```

**Response `201`:** `{ "message": "Trip planned.", "id": 1 }`

---

#### `DELETE /trips/:id` **[Auth required — owner only]**

**Response `200`:** `{ "message": "Trip deleted." }`

---

### USER PROFILE ENDPOINTS

#### `PUT /users/profile` **[Auth required]**
Update user's personal information.

**Request Body:**
```json
{ "firstName": "Jane", "lastName": "Smith", "email": "new@email.com" }
```

**Response `200`:** `{ "message": "Profile updated." }`

---

#### `PUT /users/profile-photo` **[Auth required]**
Upload a profile photo (base64).

**Request Body:**
```json
{ "photoBase64": "data:image/jpeg;base64,/9j/4AAQ..." }
```

---

### ADMIN ENDPOINTS

#### `GET /admin/stats` **[Admin only]**
Dashboard statistics.

**Response `200`:**
```json
{ "destinations": 12, "users": 48, "reviews": 120, "favorites": 310 }
```

---

#### `GET /admin/users` **[Admin only]**
List all registered users.

---

#### `DELETE /admin/users/:id` **[Admin only]**
Remove a user account.

---

## 6. Database Schema Summary

### Entity Relationship

```
USERS ──< REVIEWS >── DESTINATIONS
USERS ──< FAVORITES >── DESTINATIONS
USERS ──< PLANNED_TRIPS >── DESTINATIONS
DESTINATIONS ──< ACTIVITY_CHECKLISTS
DESTINATIONS ──< DESTINATION_IMAGES
ADMINS ──< DESTINATIONS
```

### Table Summary

| Table | Primary Key | Foreign Keys | Description |
|-------|------------|--------------|-------------|
| `users` | `id` | — | Registered users |
| `admins` | `id` | — | Admin accounts |
| `destinations` | `id` | `admin_id → admins` | Travel destinations |
| `destination_images` | `id` | `destination_id → destinations` | Gallery images |
| `reviews` | `id` | `user_id`, `destination_id` | User reviews (1 per user/dest) |
| `favorites` | `id` | `user_id`, `destination_id` | Saved destinations |
| `planned_trips` | `id` | `user_id`, `destination_id` | User trip plans |
| `activity_checklists` | `id` | `destination_id` | Activities per destination |

---

## 7. Security Implementation

### Authentication Flow
1. User submits email + password
2. Server fetches user by email, compares bcrypt hash (12 rounds)
3. On match: issues JWT with `{ id, email, role }`, expiry 7 days
4. Client stores token in memory (not localStorage for XSS prevention)
5. Every protected request sends `Authorization: Bearer <token>`
6. Server middleware verifies & decodes token on each request

### Security Measures
| Attack | Mitigation |
|--------|-----------|
| SQL Injection | Parameterized queries via `mysql2` prepared statements |
| XSS | Input sanitization (`sanitize()` function), output encoding |
| CSRF | Token-based auth (stateless JWT) — no session cookies |
| Brute Force | *(Recommended: add rate limiting via `express-rate-limit`)* |
| Password Storage | `bcryptjs` with 12 salt rounds |
| Data Transport | HTTPS enforced in production |
| Authorization | Role checks (`requireAdmin`) + ownership checks before mutations |
| Mass Assignment | Explicit field extraction; no `req.body` passed directly |

---

## 8. User Flows

### Guest Browsing Flow
```
Home → Browse Destinations → Apply Filters → View Destination Detail
     → See Gallery, Activities, Reviews, Map → Prompt to Sign In for Favorites/Reviews
```

### Registration Flow
```
Register Page → Fill Form → Client Validation → POST /auth/register
→ Success: Redirect to Login → Login → JWT Issued → Home (authenticated)
```

### Save Favorite Flow
```
Any Destination Card → Click ♡ → [If not logged in: redirect to login]
→ POST /api/favorites → Heart turns filled ♥ → Appears in Profile > Favorites
```

### Plan Trip Flow
```
Destination Detail → "Plan a Trip" → Trip Modal → Fill name/dates/notes
→ POST /api/trips → Confirmation Toast → Appears in Profile > Planned Trips
```

### Admin Content Flow
```
Admin Panel → Destinations Tab → "+ Add Destination" → Fill Modal Form
→ POST /api/destinations → Table Refreshed → New card appears on Destinations page
```

---

## 9. Folder Structure

```
wanderwise/
├── frontend/
│   ├── index.html          ← Single-page app (all pages)
│   ├── style.css           ← Complete stylesheet
│   └── app.js              ← All frontend logic
│
├── backend/
│   ├── server.js           ← Express REST API
│   ├── package.json        ← Dependencies
│   └── .env.example        ← Environment template
│
├── database/
│   └── schema.sql          ← MySQL schema + seed data
│
└── docs/
    └── README.md           ← This documentation
```

---

## 10. Setup Instructions

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8
- A modern web browser (Chrome, Firefox, Edge, Safari)

### Step 1 — Database Setup
```bash
# Log in to MySQL
mysql -u root -p

# Run the schema script
SOURCE /path/to/wanderwise/database/schema.sql;
EXIT;
```

### Step 2 — Backend Setup
```bash
cd wanderwise/backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env: set DB_PASSWORD and JWT_SECRET

# Hash the admin password (run once)
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 12).then(h => console.log(h));"
# Paste the output into the schema.sql INSERT or run UPDATE:
# UPDATE users SET password='<hash>' WHERE email='admin@wanderwise.com';

# Start the server
npm run dev       # development (nodemon)
npm start         # production
```

### Step 3 — Frontend Setup
```bash
# Option A: Open directly
open wanderwise/frontend/index.html

# Option B: Serve with a local server (recommended for API calls)
cd wanderwise/frontend
npx live-server --port=5500

# Option C: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

> **Note:** The frontend demo runs entirely in-memory with mock data. To connect it to the real backend, replace the `DB` object in `app.js` with `fetch()` calls to the API endpoints documented above.

### Step 4 — Demo Credentials (Frontend Mock)
| Role | Email | Password |
|------|-------|----------|
| User | user@demo.com | password123 |
| Admin | admin@demo.com | admin123 |

---

## 11. Deployment

### Recommended Stack
| Layer | Service |
|-------|---------|
| Frontend | Netlify / Vercel (static hosting) |
| Backend API | Railway / Render / DigitalOcean App Platform |
| Database | PlanetScale (MySQL) / Railway MySQL / AWS RDS |

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Generate a strong `JWT_SECRET` (64+ random bytes)
- [ ] Enable HTTPS (SSL certificate via Let's Encrypt)
- [ ] Set `CLIENT_URL` to your deployed frontend domain
- [ ] Configure database with strong password + restricted user
- [ ] Add `express-rate-limit` for brute-force protection
- [ ] Set up database backups (daily recommended)
- [ ] Review CORS origins to only allow your frontend domain

---

## 12. Non-Functional Requirements Status

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| Page load time | < 3 seconds | Optimized images (Unsplash CDN), minimal JS |
| Search/filter speed | < 2 seconds | Client-side filtering (instant); DB uses FULLTEXT index |
| Availability | 99% uptime | Managed hosting platforms guarantee this |
| Password encryption | bcrypt | 12 rounds (industry standard) |
| HTTPS | Required | Enforced via hosting platform |
| Responsive design | Mobile/tablet/desktop | CSS Grid + media queries at 480/768/1024px |
| Browser support | Chrome, Firefox, Edge, Safari | Standard HTML5/CSS3/ES6+ |
| Input validation | All forms | Client-side + server-side both implemented |
| Session management | JWT expiry 7 days | Auto-logout on token expiry |

---

*WanderWise SRS Documentation © 2025 — System designed and implemented from SRS v1.0*
