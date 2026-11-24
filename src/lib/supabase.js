import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// null when the keys haven't been added yet; the login screen explains what to do.
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;

export async function getAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// Turns Supabase's technical messages into plain ones.
export function friendlyAuthError(error) {
  const message = (error?.message || "").toLowerCase();
  const code = error?.code || "";

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "That email and password don't match. Check them and try again.";
  }
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Please confirm your email first — check your inbox for the link we sent.";
  }
  if (code === "user_already_exists" || message.includes("already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (code === "weak_password" || message.includes("password should")) {
    return "Please choose a stronger password: at least 8 characters with letters and numbers.";
  }
  if (code === "over_email_send_rate_limit" || message.includes("rate limit")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (code === "same_password") {
    return "Your new password must be different from your old one.";
  }
  if (message.includes("failed to fetch") || message.includes("network")) {
    return "Can't reach the sign-in service. Check your internet connection.";
  }
  return error?.message || "Something went wrong. Please try again.";
}
