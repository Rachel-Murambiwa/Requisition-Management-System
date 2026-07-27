import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // 1. Create a base response
  let res = NextResponse.next();

  try {
    const path = req.nextUrl.pathname;

    // Explicit bypass for static assets, public paths, and auth callbacks
    if (
      path.startsWith('/reset-password') || 
      path.startsWith('/auth') || 
      path.startsWith('/api') ||
      path.includes('.')
    ) {
      return res;
    }

    // 2. Initialize Supabase client and sync cookies WITH the response object
    const supabase = createMiddlewareClient({ req, res });

    // CRITICAL: getSession refreshes session cookies and attaches updated headers to `res`
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // 3. Unauthenticated User Protection
    if (!session || sessionError) {
      if (path !== '/login') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      return res;
    }

    // 4. Extract Ground Truth Role (Check DB Profiles Table)
    let userRole = null;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.role) {
        userRole = profile.role;
      }
    } catch (dbErr) {
      console.error("Middleware DB lookup error:", dbErr?.message);
    }

    // Fallback to user_metadata if DB read returns null
    if (!userRole) {
      userRole = session.user?.user_metadata?.role || 'requester';
    }

    const cleanRole = userRole.toString().trim().toLowerCase();

    const roleRedirects = {
      'requester': '/requester',
      'finance-officer': '/finance-officer',
      'head-of-operations': '/head-of-operations',
      'country-manager': '/country-manager',
      'admin': '/admin',
    };

    const targetDashboard = roleRedirects[cleanRole] || '/requester';

    // 5. Logged-in redirect away from / or /login
    if (path === '/' || path === '/login') {
      return NextResponse.redirect(new URL(targetDashboard, req.url));
    }

    // 6. ISOLATION ROUTE MATRIX
    if (path.startsWith('/requester') && cleanRole !== 'requester') {
      return NextResponse.redirect(new URL('/unauthorised', req.url));
    }
    if (path.startsWith('/finance-officer') && cleanRole !== 'finance-officer') {
      return NextResponse.redirect(new URL('/unauthorised', req.url));
    }
    if (path.startsWith('/admin') && cleanRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorised', req.url));
    }
    if (path.startsWith('/head-of-operations') && cleanRole !== 'head-of-operations') {
      return NextResponse.redirect(new URL('/unauthorised', req.url));
    }
    if (path.startsWith('/country-manager') && cleanRole !== 'country-manager') {
      return NextResponse.redirect(new URL('/unauthorised', req.url));
    }

    return res;

  } catch (err) {
    console.error("Middleware Execution Error:", err);
    return res;
  }
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/reset-password',
    '/admin/:path*',
    '/country-manager/:path*',
    '/finance-officer/:path*',
    '/head-of-operations/:path*',
    '/requester/:path*',
    '/profile/:path*'
  ],
};