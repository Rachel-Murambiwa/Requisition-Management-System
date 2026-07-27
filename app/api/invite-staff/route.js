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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 📩 REAL EMAIL DISPATCH: Send invitation link via Supabase Auth Mailer
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      cleanEmail,
      {
        redirectTo: `${siteUrl}/reset-password`,
        data: {
          name: name.toLowerCase().trim(),
          role: role,
          hub_name: hub_name
        }
      }
    );

    if (error) {
      if (error.message.includes('already registered') || error.status === 422) {
        return NextResponse.json({ success: false, error: 'this staff email has already been invited or registered' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      user: data.user,
      message: `Invitation email sent successfully to ${cleanEmail}` 
    });

  } catch (err) {
    console.error("Invite API Crash Log:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: `Action halted: ${err.message}` 
    }, { status: 500 });
  }
}