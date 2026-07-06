export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req) {
  try {
    // 🛠️ MOVE INITIALIZATION INSIDE THE HANDLER TO PREVENT VERCEL BUILD-TIME CRASHES
    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const body = await req.json();
    
    // Catch the raw payload data frame emitted by the Supabase database insert webhook
    const notification = body.record || body.new;

    if (!notification) {
      return NextResponse.json({ error: 'no notice body parameters discovered' }, { status: 400 });
    }

    const { role, title, msg } = notification;

    // 1. Cross-examine the target permission layer against your database profiles to locate corresponding emails
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('role', role);

    if (profileError) throw profileError;

    // If no staff profiles match this system track role, exit gracefully
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: 'no communication channels registered for target role index' });
    }

    // Isolate unique email strings into a structured array list
    const recipientEmails = profiles.map(p => p.email).filter(Boolean);

    // 2. Execute transactional email transmission batch block
    await resend.emails.send({
      from: 'Uncommon RMS <onboarding@resend.dev>', 
      to: recipientEmails,
      subject: `[RMS ALERT] ${title.toLowerCase()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #111827; background-color: #F9FAFB; padding: 24px; border-radius: 12px; border: 1px solid #E5E7EB;">
          <div style="margin-bottom: 20px;">
            <span style="font-size: 20px; font-weight: 900; color: #0747A1; tracking-tight: -0.05em;">uncommon</span>
            <span style="font-size: 10px; background-color: #EFF6FF; color: #0747A1; font-weight: bold; padding: 2px 6px; border-radius: 4px; margin-left: 6px; text-transform: uppercase;">rms</span>
          </div>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin-bottom: 20px;" />
          <h3 style="color: #0A1628; margin-top: 0; text-transform: lowercase; font-size: 16px;">${title}</h3>
          <p style="font-size: 13px; color: #4B5563; line-height: 1.6; text-transform: lowercase;">${msg}</p>
          <div style="margin-top: 28px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/login" 
               style="background-color: #0A1628; color: #FFFFFF; font-size: 11px; font-weight: bold; text-decoration: none; padding: 10px 20px; border-radius: 6px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">
              open system terminal
            </a>
          </div>
          <p style="font-size: 10px; color: #9CA3AF; margin-top: 40px; line-height: 1.4;">
            internal security system transmission • confidential document warning notice<br />
            do not reply directly to this automated ledger mail block.
          </p>
        </div>
      `
    });

    return NextResponse.json({ success: true, targets: recipientEmails.length });
  } catch (err) {
    console.error('Email dispatch execution pipeline fault:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}