/* ═══════════════════════════════════════════════════════
   Authentication Management with Supabase Auth
═══════════════════════════════════════════════════════ */

import { supabase } from './supabase.js';

export let currentUser = null;
export let currentSession = null;

export async function initAuth() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (data.session) {
      currentSession = data.session;
      const profile = await getProfile(data.session.user.id);
      currentUser = { ...data.session.user, profile };
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      currentSession = session;
      if (session) {
        currentUser = { ...session.user };
      } else {
        currentUser = null;
      }
      window.dispatchEvent(new Event('authChange'));
    });

    return { user: currentUser, error: null };
  } catch (err) {
    console.error('Auth init error:', err);
    return { user: null, error: err.message };
  }
}

export async function signUp(email, password, firstName, lastName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName }
      }
    });

    if (error) throw error;

    // Create profile
    if (data.user) {
      await createProfile(data.user.id, email, firstName, lastName);
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('Sign up error:', err);
    return { user: null, error: err.message };
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    currentSession = data.session;
    const profile = await getProfile(data.user.id);
    currentUser = { ...data.user, profile };

    return { user: currentUser, error: null };
  } catch (err) {
    console.error('Sign in error:', err);
    return { user: null, error: err.message };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    currentUser = null;
    currentSession = null;
    return { error: null };
  } catch (err) {
    console.error('Sign out error:', err);
    return { error: err.message };
  }
}

export async function createProfile(userId, email, firstName, lastName) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'user',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { profile: data, error: null };
  } catch (err) {
    console.error('Error creating profile:', err);
    return { profile: null, error: err.message };
  }
}

export async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching profile:', err);
    return null;
  }
}

export async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    if (currentUser) {
      currentUser.profile = data;
    }

    return { profile: data, error: null };
  } catch (err) {
    console.error('Error updating profile:', err);
    return { profile: null, error: err.message };
  }
}

export async function resetPassword(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Password reset error:', err);
    return { error: err.message };
  }
}

export function getCurrentUser() {
  return currentUser;
}

export function isAuthenticated() {
  return !!currentUser && !!currentSession;
}

export function isAdmin() {
  return currentUser?.profile?.role === 'admin';
}
