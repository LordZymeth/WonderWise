-- ═══════════════════════════════════════════════════════
--  WanderWise — MySQL Database Schema
--  Version: 1.0
--  Description: Complete schema for the WanderWise
--               Travel Itinerary Platform
-- ═══════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS wanderwise
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE wanderwise;

-- ───────────────────────────────────────────────────────
--  TABLE: admins
--  Stores administrator accounts separately
-- ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id           INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100)     NOT NULL,
  email        VARCHAR(255)     NOT NULL UNIQUE,
  password     VARCHAR(255)     NOT NULL,   -- bcrypt hash
  created_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_admins_email (email)
) ENGINE=InnoDB;

-- ───────────────────────────────────────────────────────
--  TABLE: users
--  Stores registered user accounts
-- ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  first_name      VARCHAR(50)     NOT NULL,
  last_name       VARCHAR(50)     NOT NULL,
  email           VARCHAR(100)    NOT NULL UNIQUE,
  password        VARCHAR(255)    NOT NULL,   -- bcrypt hash (min 12 rounds)
  profile_photo   MEDIUMTEXT      NULL,       -- base64 or file path
  role            ENUM('user','admin') NOT NULL DEFAULT 'user',
  date_created    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_users_email (email),
  INDEX idx_users_role  (role)
) ENGINE=InnoDB;

-- ───────────────────────────────────────────────────────
--  TABLE: destinations
--  Stores all travel destinations
-- ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS destinations (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  admin_id         INT UNSIGNED    NULL,                       -- who created it
  name             VARCHAR(100)    NOT NULL,
  description      TEXT            NOT NULL,
  location         VARCHAR(150)    NOT NULL,
  category         ENUM('Beach','Mountain','City','Cultural','Adventure','Nature') NOT NULL,
  image_url        VARCHAR(512)    NULL,
  map_link         VARCHAR(512)    NULL,
  default_rating   DECIMAL(2,1)    NOT NULL DEFAULT 4.5,       -- fallback until reviews exist
  date_added       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE SET NULL,
  INDEX idx_dest_category (category),
  INDEX idx_dest_location (location),
  FULLTEXT idx_dest_search (name, location, description)
) ENGINE=InnoDB;

-- ───────────────────────────────────────────────────────
--  TABLE: destination_images
--  Additional gallery images per destination
-- ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS destination_images (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  destination_id   INT UNSIGNED    NOT NULL,
  image_url        VARCHAR(512)    NOT NULL,
  alt_text         VARCHAR(255)    NULL,
  sort_order       TINYINT         NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE,
  INDEX idx_di_destination (destination_id)
) ENGINE=InnoDB;

-- ───────────────────────────────────────────────────────
--  TABLE: reviews
--  User reviews and ratings for destinations
-- ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id          INT UNSIGNED    NOT NULL,
  destination_id   INT UNSIGNED    NOT NULL,
  rating           TINYINT         NOT NULL,         -- 1–5
  comment          TEXT            NOT NULL,
  review_date      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_dest_review (user_id, destination_id),   -- one review per user per destination
  FOREIGN KEY (user_id)        REFERENCES users        (id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE,
  INDEX idx_reviews_dest    (destination_id),
  INDEX idx_reviews_user    (user_id),
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- ───────────────────────────────────────────────────────
--  TABLE: favorites
--  Destinations saved by registered users
-- ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id          INT UNSIGNED    NOT NULL,
  destination_id   INT UNSIGNED    NOT NULL,
  date_saved       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_dest_fav (user_id, destination_id),   -- no duplicates
  FOREIGN KEY (user_id)        REFERENCES users        (id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE,
  INDEX idx_favs_user (user_id)
) ENGINE=InnoDB;

-- ───────────────────────────────────────────────────────
--  TABLE: planned_trips
--  Travel plans created by registered users
-- ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planned_trips (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id          INT UNSIGNED    NOT NULL,
  destination_id   INT UNSIGNED    NOT NULL,
  trip_name        VARCHAR(150)    NOT NULL,
  start_date       DATE            NOT NULL,
  end_date         DATE            NOT NULL,
  notes            TEXT            NULL,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id)        REFERENCES users        (id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE,
  INDEX idx_trips_user (user_id),
  CONSTRAINT chk_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB;

-- ───────────────────────────────────────────────────────
--  TABLE: activity_checklists
--  Recommended activities linked to destinations
-- ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_checklists (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  destination_id   INT UNSIGNED    NOT NULL,
  activity_name    VARCHAR(255)    NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE,
  INDEX idx_act_destination (destination_id)
) ENGINE=InnoDB;

-- ═══════════════════════════════════════════════════════
--  SEED DATA
-- ═══════════════════════════════════════════════════════

-- Default admin account  (password: admin123 → bcrypt hash shown below)
-- NOTE: replace hash with actual bcrypt output in production
INSERT INTO users (first_name, last_name, email, password, role) VALUES
  ('Admin', 'WanderWise', 'admin@wanderwise.com',
   '$2a$12$exampleHashForAdmin123PleaseReplaceThisInProduction', 'admin');

-- Sample destinations
INSERT INTO destinations (name, description, location, category, image_url, default_rating) VALUES
  ('Santorini',
   'Santorini is a breathtaking volcanic island in the Aegean Sea, celebrated for its iconic white-washed buildings with vivid blue domes and stunning sunsets.',
   'Greece', 'Beach',
   'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80', 4.8),

  ('Kyoto',
   'Kyoto served as Japan''s imperial capital for over a millennium and remains the country''s cultural heart, home to thousands of temples, shrines, and traditional wooden townhouses.',
   'Japan', 'Cultural',
   'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80', 4.9),

  ('Patagonia',
   'Patagonia is a sparsely populated region at the southern end of South America offering some of the world''s most dramatic and pristine wilderness.',
   'Argentina / Chile', 'Adventure',
   'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80', 4.7),

  ('Marrakech',
   'Marrakech is a major imperial city in Morocco. A maze of winding alleyways and vibrant souks, its Medina is a UNESCO World Heritage Site.',
   'Morocco', 'Cultural',
   'https://images.unsplash.com/photo-1597212720158-0a64adb2bcbf?w=800&q=80', 4.5),

  ('Banff National Park',
   'Canada''s first national park, Banff offers spectacular mountain scenery, turquoise glacial lakes, and abundant wildlife across 6,641 km².',
   'Canada', 'Nature',
   'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80', 4.8),

  ('Amalfi Coast',
   'A UNESCO World Heritage stretch of coastline on the Tyrrhenian Sea, characterized by steep cliffs, colorful fishing villages, and crystal-clear Mediterranean waters.',
   'Italy', 'Beach',
   'https://images.unsplash.com/photo-1612096012971-95f03ee5b6a5?w=800&q=80', 4.7),

  ('Machu Picchu',
   'A 15th-century Inca citadel set high in the Andes Mountains above the Urubamba River valley, renowned for its sophisticated dry-stone construction.',
   'Peru', 'Adventure',
   'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=800&q=80', 4.9),

  ('Bali',
   'An Indonesian island known for forested volcanic mountains, iconic rice paddies, beaches, coral reefs, elaborate rituals, and vibrant cultural heritage.',
   'Indonesia', 'Nature',
   'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', 4.6),

  ('Swiss Alps',
   'World-class mountain scenery with iconic peaks like the Matterhorn and Jungfrau rising above picturesque valleys and charming villages.',
   'Switzerland', 'Mountain',
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 4.8),

  ('Cappadocia',
   'A historical region in central Turkey known for fairy chimneys, cave dwellings, underground cities, and world-famous hot-air balloon flights at sunrise.',
   'Turkey', 'Adventure',
   'https://images.unsplash.com/photo-1565018054866-968e244671af?w=800&q=80', 4.8);

-- Activity checklists for Santorini (destination_id = 1)
INSERT INTO activity_checklists (destination_id, activity_name) VALUES
  (1,'Sunset watching at Oia'),
  (1,'Wine tasting tour'),
  (1,'Caldera boat cruise'),
  (1,'Beach hopping'),
  (1,'Akrotiri archaeological site'),
  (1,'Photography walks');

-- Activity checklists for Kyoto (destination_id = 2)
INSERT INTO activity_checklists (destination_id, activity_name) VALUES
  (2,'Visit Fushimi Inari Shrine'),
  (2,'Arashiyama Bamboo Grove'),
  (2,'Tea ceremony experience'),
  (2,'Geisha district walk'),
  (2,'Nijo Castle tour'),
  (2,'Zen garden meditation');

-- Activity checklists for Patagonia (destination_id = 3)
INSERT INTO activity_checklists (destination_id, activity_name) VALUES
  (3,'Torres del Paine trekking'),
  (3,'Glacier Perito Moreno visit'),
  (3,'Kayaking fjords'),
  (3,'Wildlife photography'),
  (3,'Rock climbing'),
  (3,'Stargazing tours');
