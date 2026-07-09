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

    // ✨ SUBMISSION SAFE BYPASS: Use createUser instead of inviteUserByEmail to kill the Resend SMTP barrier
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: 'TemporaryPassword123!', // Simple fallback password your teammates can use to sign in
      email_confirm: true, // Auto-verifies the email instantly so no confirmation loop blocks them
      user_metadata: { 
        name: name.toLowerCase().trim(), 
        role: role, 
        hub_name: hub_name 
      }
    });

    if (error) throw error;

    return NextResponse.json({ success: true, user: data.user });

  } catch (err) {
    console.error("Invite API Crash:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}