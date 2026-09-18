import { createClient } from "@supabase/supabase-js";

// Fallback memakai kredensial anon publik project ini agar deployment tetap
// terhubung ketika Environment Variables Vercel belum ikut tersalin.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://qzyygpqooxlvpexcezlg.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6eXlncHFvb3hsdnBleGNlemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODQzNjQsImV4cCI6MjEwNDM2MDM2NH0.7mMOYU-0FVQgCgohxawvon91qLjyH3YzDjNjET1cIqw";

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
