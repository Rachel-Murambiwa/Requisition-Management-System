import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // Create a base response stream so cookie headers are preserved
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh and validate the active authentication session tokens
  const { data: { session } } = await supabase.auth.getSession();
  
  const path = req.nextUrl.pathname;

  // 1. AUTHENTICATION PROTECTION GUARD
  if (!session) {
    if (path !== '/login') {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    return res;
  }

  // Prevent logged-in users from hitting the login page again
  if (path === '/login') {
    let fallbackRole = session?.user?.user_metadata?.role || 'requester';
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (profile?.role) fallbackRole = profile.role;
    } catch (e) {}

    const roleRedirects = {
      'requester': '/requester',
      'finance-officer': '/finance-officer',
      'head-of-operations': '/head-of-operations',
      'country-manager': '/country-manager',
      'admin': '/admin',
    };
    return NextResponse.redirect(new URL(roleRedirects[fallbackRole] || '/unauthorised', req.url));
  }

  // 2. FETCH ROLE WITH USER METADATA FALLBACK
  let userRole = session?.user?.user_metadata?.role;

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile && !error) {
      userRole = profile.role;
    }
  } catch (e) {
    console.error("Middleware DB profile bypass:", e);
  }

  // If role lookup completely fails, fallback to client-side layout router handlers
  if (!userRole) {
    return res;
  }

  // 3. ISOLATION ROUTE MATRIX
  if (path.startsWith('/requester') && userRole !== 'requester') {
    return NextResponse.redirect(new URL('/unauthorised', req.url));
  }

  if (path.startsWith('/finance-officer') && userRole !== 'finance-officer') {
    return NextResponse.redirect(new URL('/unauthorised', req.url));
  }

  if (path.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorised', req.url));
  }

  if (path.startsWith('/head-of-operations') && userRole !== 'head-of-operations') {
    return NextResponse.redirect(new URL('/unauthorised', req.url));
  }

  if (path.startsWith('/country-manager') && userRole !== 'country-manager') {
    return NextResponse.redirect(new URL('/unauthorised', req.url));
  }

  // Return the original response stream containing the refreshed cookie tokens
  return res;
}

export const config = {
  matcher: [
    '/login', // Added to intercept the session lifecycle check cleanly
    '/admin/:path*',
    '/country-manager/:path*',
    '/finance-officer/:path*',
    '/head-of-operations/:path*',
    '/requester/:path*',
    '/profile/:path*'
  ],
};