/* ═══════════════════════════════════════════════════════
   Supabase Database Schema
   Run this in Supabase SQL Editor
═══════════════════════════════════════════════════════ */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════════════
-- PROFILES TABLE (linked to auth.users)
-- ══════════════════════════════════════════════════════
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- ══════════════════════════════════════════════════════
-- DESTINATIONS TABLE
-- ══════════════════════════════════════════════════════
CREATE TABLE public.destinations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Beach', 'Resort', 'City', 'Island', 'Adventure', 'Nature')),
  description TEXT NOT NULL,
  image_url TEXT,
  gallery JSONB DEFAULT '[]',
  activities JSONB DEFAULT '[]',
  average_rating NUMERIC(3, 1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_destinations_name ON public.destinations(name);
CREATE INDEX idx_destinations_category ON public.destinations(category);
CREATE INDEX idx_destinations_average_rating ON public.destinations(average_rating DESC);
CREATE INDEX idx_destinations_created_at ON public.destinations(created_at DESC);

-- ══════════════════════════════════════════════════════
-- FAVORITES TABLE
-- ══════════════════════════════════════════════════════
CREATE TABLE public.favorites (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination_id BIGINT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, destination_id)
);

CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_destination_id ON public.favorites(destination_id);
CREATE INDEX idx_favorites_created_at ON public.favorites(created_at DESC);

-- ══════════════════════════════════════════════════════
-- REVIEWS TABLE
-- ══════════════════════════════════════════════════════
CREATE TABLE public.reviews (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination_id BIGINT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_destination_id ON public.reviews(destination_id);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- ══════════════════════════════════════════════════════
-- TRIP PLANS TABLE
-- ══════════════════════════════════════════════════════
CREATE TABLE public.trip_plans (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination_id BIGINT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  travel_date DATE NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_plans_user_id ON public.trip_plans(user_id);
CREATE INDEX idx_trip_plans_destination_id ON public.trip_plans(destination_id);
CREATE INDEX idx_trip_plans_travel_date ON public.trip_plans(travel_date);
CREATE INDEX idx_trip_plans_created_at ON public.trip_plans(created_at DESC);

-- ══════════════════════════════════════════════════════
-- ACTIVITY CHECKLISTS TABLE
-- ══════════════════════════════════════════════════════
CREATE TABLE public.activity_checklists (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trip_id BIGINT NOT NULL REFERENCES public.trip_plans(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_checklists_trip_id ON public.activity_checklists(trip_id);
CREATE INDEX idx_activity_checklists_completed ON public.activity_checklists(completed);

-- ══════════════════════════════════════════════════════
-- ENABLE ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_checklists ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════
-- STORAGE BUCKET FOR AVATARS
-- ══════════════════════════════════════════════════════
-- Run in Supabase console: create storage bucket named 'avatars'
-- Then set:
-- - Public: false
-- - File size limit: 2MB
