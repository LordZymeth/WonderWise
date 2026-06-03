/* ═══════════════════════════════════════════════════════
   Profile Management
═══════════════════════════════════════════════════════ */

import { supabase, currentUser, updateProfile } from './auth.js';
import { getFavorites, getFavoriteCount } from './favorites.js';
import { getUserReviews } from './reviews.js';
import { getUserTrips } from './trips.js';

export async function uploadAvatar(file) {
  if (!currentUser) return { error: 'Not authenticated' };

  try {
    if (file.size > 2 * 1024 * 1024) {
      return { error: 'File too large. Max 2MB.' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const avatarUrl = data.publicUrl;

    const { error: updateError } = await updateProfile(currentUser.id, {
      avatar_url: avatarUrl
    });

    if (updateError) throw updateError;

    return { avatarUrl, error: null };
  } catch (err) {
    console.error('Error uploading avatar:', err);
    return { avatarUrl: null, error: err.message };
  }
}

export async function getProfileStats() {
  if (!currentUser) return { stats: {}, error: null };

  try {
    const favs = await getFavorites();
    const reviews = await getUserReviews(currentUser.id);
    const trips = await getUserTrips();

    return {
      stats: {
        favorites: favs.favorites?.length || 0,
        reviews: reviews.reviews?.length || 0,
        trips: trips.trips?.length || 0
      },
      error: null
    };
  } catch (err) {
    console.error('Error fetching profile stats:', err);
    return { stats: {}, error: err.message };
  }
}
