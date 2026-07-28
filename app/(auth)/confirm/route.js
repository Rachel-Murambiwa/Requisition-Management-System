import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// This route handles invite / password-recovery / magic-link emails.
// It verifies the token server-side using token_hash, which does NOT
// require a PKCE code verifier to be present in the browser's storage.
// This works regardless of which device/browser/tab opens the email link.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/reset-password';

  if (token_hash && type) {
    const supabase = createRouteHandlerClient({ cookies });
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // Session is now set via cookies by the auth-helpers client above.
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('Auth confirm verifyOtp error:', error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_or_expired_link`);
}