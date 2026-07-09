import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function createClient() {
  // Automatically wires up local storage token mirrors straight into Next.js cookie jars!
  return createClientComponentClient();
}