import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // 🛠️ LOCAL DEV BYPASS
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh and unwrap the active authentication token session parameters
  const { data: { session } } = await supabase.auth.getSession();
  
  const nextUrl = req.nextUrl.clone();
  const path = nextUrl.pathname;

  // 1. AUTHENTICATION PROTECTION GUARD: Boot unauthenticated requests out to login terminal
  if (!session) {
    if (path !== '/login') {
      nextUrl.pathname = '/login';
      return NextResponse.redirect(nextUrl);
    }
    return res;
  }

  // 2. FETCH ROLE WITH FALLBACKS TO PREVENT EDGE DROPS
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
    console.error("Middleware edge-db query bypassed:", e);
  }

  // If role lookup completely fails at the edge layer, allow client-side layout router to handle it
  if (!userRole) {
    return res;
  }

  // 3. ISOLATION ROUTE MATRIX (Matches your true app path groups)
  if (path.startsWith('/requester') && userRole !== 'requester') {
    nextUrl.pathname = '/unauthorised';
    return NextResponse.redirect(nextUrl);
  }

  if (path.startsWith('/finance-officer') && userRole !== 'finance-officer') {
    nextUrl.pathname = '/unauthorised';
    return NextResponse.redirect(nextUrl);
  }

  if (path.startsWith('/admin') && userRole !== 'admin') {
    nextUrl.pathname = '/unauthorised';
    return NextResponse.redirect(nextUrl);
  }

  if (path.startsWith('/head-of-operations') && userRole !== 'head-of-operations') {
    nextUrl.pathname = '/unauthorised';
    return NextResponse.redirect(nextUrl);
  }

  if (path.startsWith('/country-manager') && userRole !== 'country-manager') {
    nextUrl.pathname = '/unauthorised';
    return NextResponse.redirect(nextUrl);
  }

  return res;
}

// 🎯 TARGETED MATCHERS: Intercept dashboards only to protect authentication context
export const config = {
  matcher: [
    '/admin/:path*',
    '/country-manager/:path*',
    '/finance-officer/:path*',
    '/head-of-operations/:path*',
    '/requester/:path*',
    '/profile/:path*'
  ],
};