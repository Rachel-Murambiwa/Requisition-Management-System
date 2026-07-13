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
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // 🚀 STEP 1: Try sending the actual email invite
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      cleanEmail,
      {
        data: {
          name: name.toLowerCase().trim(),
          role: role,
          hub_name: hub_name
        },
        redirectTo: `${origin}/login`
      }
    );

    // 🛡️ STEP 2: If ANY error happens (rate limit, SMTP config down, etc.), catch it immediately
    if (error) {
      // Handle the case where they are already registered so we don't duplicate them
      if (error.message.includes('already registered') || error.status === 422) {
        return NextResponse.json({ success: false, error: 'this staff email has already been invited or registered' }, { status: 400 });
      }
      
      // For ANY other email/SMTP error, trigger the sandbox auto-confirm fallback immediately
      console.warn("SMTP failure detected. Triggering universal sandbox fallback account provisioning:", error.message);
      
      const { data: fallbackUser, error: fallbackError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: 'TemporaryPassword123!', 
        email_confirm: true,
        user_metadata: { 
          name: name.toLowerCase().trim(), 
          role: role, 
          hub_name: hub_name 
        }
      });

      if (fallbackError) throw fallbackError;

      return NextResponse.json({ 
        success: true, 
        user: fallbackUser.user,
        isFallbackMode: true,
        temporaryPassword: 'TemporaryPassword123!'
      });
    }

    return NextResponse.json({ success: true, user: data.user, isFallbackMode: false });

  } catch (err) {
    console.error("Invite API Crash:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}