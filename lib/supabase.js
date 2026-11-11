import { createClient } from '@supabase/supabase-js';

let client;

function getClient() {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
      );
    }

    client = createClient(supabaseUrl, supabaseKey);
  }
  return client;
}

/** @type {import('@supabase/supabase-js').SupabaseClient} */
export const supabase = new Proxy(
  /** @type {any} */ ({}),
  {
    get(_target, prop) {
      const c = getClient();
      const value = Reflect.get(c, prop, c);
      return typeof value === 'function' ? value.bind(c) : value;
    },
  }
);
