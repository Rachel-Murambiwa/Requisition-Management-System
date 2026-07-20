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

    // 🚀 BYPASS SMTP: Create the user directly as "CONFIRMED" to skip email limits
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: 'InitialPassword123!', // Give them a temporary default password
      email_confirm: true,               // Marks them confirmed instantly!
      user_metadata: {
        name: name.toLowerCase().trim(),
        role: role,
        hub_name: hub_name
      }
    });

    if (error) {
      if (error.message.includes('already registered') || error.status === 422) {
        return NextResponse.json({ success: false, error: 'this staff email has already been invited or registered' }, { status: 400 });
      }
      throw error;
    }

    // Return success message instructing them on their auto-generated access credentials
    return NextResponse.json({ 
      success: true, 
      user: data.user,
      message: `Bypassed SMTP restrictions. Account active! Default password: InitialPassword123!` 
    });

  } catch (err) {
    console.error("Invite API Crash Log:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: `Action halted: ${err.message}` 
    }, { status: 500 });
  }
}