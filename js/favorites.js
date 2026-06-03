/* ═══════════════════════════════════════════════════════
   Favorites Management
═══════════════════════════════════════════════════════ */

import { supabase, currentUser } from './auth.js';

export async function addFavorite(destinationId) {
  if (!currentUser) return { error: 'Not authenticated' };

  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: currentUser.id,
        destination_id: destinationId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { favorite: data, error: null };
  } catch (err) {
    console.error('Error adding favorite:', err);
    return { favorite: null, error: err.message };
  }
}

export async function removeFavorite(destinationId) {
  if (!currentUser) return { error: 'Not authenticated' };

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('destination_id', destinationId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Error removing favorite:', err);
    return { error: err.message };
  }
}

export async function getFavorites() {
  if (!currentUser) return { favorites: [], error: null };

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('destination_id, destinations(*)')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { favorites: data || [], error: null };
  } catch (err) {
    console.error('Error fetching favorites:', err);
    return { favorites: [], error: err.message };
  }
}

export async function isFavorite(destinationId) {
  if (!currentUser) return false;

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('destination_id', destinationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (err) {
    console.error('Error checking favorite:', err);
    return false;
  }
}

export async function getFavoriteCount() {
  if (!currentUser) return 0;

  try {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('Error fetching favorite count:', err);
    return 0;
  }
}
