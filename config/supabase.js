const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const getSupabaseClient = (authHeader) => {
  const options = {};

  if (authHeader) {
    options.global = {
      headers: {
        Authorization: authHeader,
      },
    };
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    options,
  );
};

const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
};

module.exports = { getSupabaseClient, getSupabaseAdmin };
