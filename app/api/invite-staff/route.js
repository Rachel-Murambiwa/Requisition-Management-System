import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // 🔒 Safe: hidden in environment variables
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  );

  try {
    const { email, name, role, hub_name } = await request.json();

    if (!email || !name || !role || !hub_name) {
      return NextResponse.json({ success: false, error: 'missing parameters' }, { status: 400 });
    }

    // 🌐 DYNAMIC ORIGIN CATCH: Falls back to live production domain to prevent localhost traps
    const { origin } = new URL(request.url);
    const targetRedirectUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://requisition-management-system-3oyyro6ac.vercel.app';

    // 🚀 EMAIL DISPATCH: Tells Supabase to route an official confirmation message through Resend SMTP
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.trim(),
      {
        data: { 
          name: name.toLowerCase().trim(), 
          role: role, 
          hub_name: hub_name 
        },
        redirectTo: `${targetRedirectUrl}/welcome` 
      }
    );

    if (error) throw error;

    return NextResponse.json({ success: true, user: data.user });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}