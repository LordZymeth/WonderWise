/* ═══════════════════════════════════════════════════════
   Reviews & Ratings Management
═══════════════════════════════════════════════════════ */

import { supabase, currentUser } from './auth.js';
import { updateDestinationRating } from './destinations.js';

export async function createReview(destinationId, rating, comment) {
  if (!currentUser) return { error: 'Not authenticated' };

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        user_id: currentUser.id,
        destination_id: destinationId,
        rating,
        comment,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Update destination average rating
    await updateDestinationRating(destinationId);

    return { review: data, error: null };
  } catch (err) {
    console.error('Error creating review:', err);
    return { review: null, error: err.message };
  }
}

export async function updateReview(reviewId, updates) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;

    // Update destination rating
    if (data) {
      await updateDestinationRating(data.destination_id);
    }

    return { review: data, error: null };
  } catch (err) {
    console.error('Error updating review:', err);
    return { review: null, error: err.message };
  }
}

export async function deleteReview(reviewId, destinationId) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    // Update destination rating
    await updateDestinationRating(destinationId);

    return { error: null };
  } catch (err) {
    console.error('Error deleting review:', err);
    return { error: err.message };
  }
}

export async function getDestinationReviews(destinationId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(first_name, last_name)')
      .eq('destination_id', destinationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { reviews: data || [], error: null };
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return { reviews: [], error: err.message };
  }
}

export async function getUserReviews(userId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, destinations(name), profiles(first_name, last_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { reviews: data || [], error: null };
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    return { reviews: [], error: err.message };
  }
}

export async function checkUserReviewExists(destinationId) {
  if (!currentUser) return false;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('destination_id', destinationId)
      .eq('user_id', currentUser.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (err) {
    console.error('Error checking review:', err);
    return false;
  }
}

export async function getAllReviews() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, destinations(name), profiles(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { reviews: data || [], error: null };
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return { reviews: [], error: err.message };
  }
}
