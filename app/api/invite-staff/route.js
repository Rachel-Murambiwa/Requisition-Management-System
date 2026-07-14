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
    
    // 🌐 Automatically resolves request domain or falls back to your live Vercel address
    const origin = request.headers.get('origin') || 'https://requisition-management-system-melp.vercel.app';

    // 🚀 STEP 1: Dispatch the email invitation targeting your custom password setup page
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      cleanEmail,
      {
        data: {
          name: name.toLowerCase().trim(),
          role: role,
          hub_name: hub_name
        },
        redirectTo: `${origin}/reset-password`
      }
    );

    // 🛡️ STEP 2: strict email error checking with no fallback password bypasses
    if (error) {
      if (error.message.includes('already registered') || error.status === 422) {
        return NextResponse.json({ success: false, error: 'this staff email has already been invited or registered' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, user: data.user });

  } catch (err) {
    console.error("Invite API Crash Log:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: `mail delivery failed: ${err.message}. verify your custom smtp settings.` 
    }, { status: 500 });
  }
}