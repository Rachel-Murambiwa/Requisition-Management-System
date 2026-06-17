import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Explicitly export named function to match the import statement in your login page
export const createClient = () => createClientComponentClient();