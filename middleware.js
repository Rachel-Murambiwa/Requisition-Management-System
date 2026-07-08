import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // 🛠️ LOCAL DEV BYPASS: Allows you to view any dashboard page freely on localhost
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
    nextUrl.pathname = '/login';
    return NextResponse.redirect(nextUrl);
  }

  // 2. ✨ FIXED: Fetch the user profile role dynamically from the database profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const userRole = profile?.role;

  // 3. ISOLATION ROUTE MATRIX: Cross-examine database role strings against target path groups
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

// 🎯 ROUTE MATCHER FILTER
export const config = {
  matcher: [
    // Safe broad exclusion rule allowing the login, unauthorized fallback screens, and static configurations to pass through freely
    '/((?!login|welcome|unauthorised|api/invite-staff|_next/static|_next/image|favicon.ico|fonts).*)',
  ],
};