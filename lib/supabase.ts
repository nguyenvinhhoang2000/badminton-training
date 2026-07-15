import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public (browser-safe) credentials. Row Level Security protects the data,
// so the anon key is meant to ship to the client.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Shared Supabase client, or `null` when the project isn't configured.
 * When null the app runs in offline mode (localStorage only), so every caller
 * must guard against it.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseEnabled = supabase !== null;

// Table that stores one row per user: their progress + history blobs.
export const USER_STATE_TABLE = "user_state";
