import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  );

  try {
    const { email, name, role, hub_name } = await request.json();

    if (!email || !name || !role || !hub_name) {
      return NextResponse.json({ success: false, error: 'missing parameters' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 🚀 FIXED: Swapped out silent provisioning for a live SMTP mail invitation dispatch link
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      cleanEmail,
      {
        // Passes the user details along as metadata inside the sign-up payload stream
        data: {
          name: name.toLowerCase().trim(),
          role: role,
          hub_name: hub_name
        },
        // 🔄 OPTIONAL: Redirects them straight back to your workspace login screen once they click the email link
        redirectTo: `${request.headers.get('origin') || 'http://localhost:3000'}/login`
      }
    );

    if (error) {
      // 🛡️ INTELLIGENT ERROR INTERCEPTION
      // If Supabase tells us they are already registered, return a clean 400 instead of a scary 500 crash log
      if (error.message.includes('already registered') || error.status === 422) {
        return NextResponse.json({ success: false, error: 'this staff email has already been invited or registered' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, user: data.user });

  } catch (err) {
    console.error("Invite API Crash:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}