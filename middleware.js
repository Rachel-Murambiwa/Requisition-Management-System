import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();

  try {
    const supabase = createMiddlewareClient({ req, res });

    // 1. SAFE SESSION CHECK
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const path = req.nextUrl.pathname;

    // If no active session, restrict access to protected pages
    if (!session || sessionError) {
      if (path !== '/login') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      return res;
    }

    // 2. EXTRACT ROLE (Prioritize metadata stored directly on JWT token)
    let userRole = session.user?.user_metadata?.role;

    // Optional DB Fallback (Wrapped in isolated try/catch so DB issues NEVER cause a 500 error)
    if (!userRole) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.role) {
          userRole = profile.role;
        }
      } catch (dbError) {
        console.error("Edge DB lookup skipped:", dbError?.message);
      }
    }

    // Default to requester if role extraction completely fails
    if (!userRole) {
      userRole = 'requester';
    }

    // 3. LOGGED-IN REDIRECT FROM /login
    if (path === '/login') {
      const roleRedirects = {
        'requester': '/requester',
        'finance-officer': '/finance-officer',
        'head-of-operations': '/head-of-operations',
        'country-manager': '/country-manager',
        'admin': '/admin',
      };
      const targetPath = roleRedirects[userRole] || '/requester';
      return NextResponse.redirect(new URL(targetPath, req.url));
    }

    // 4. ROLE ISOLATION MATRIX
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

    return res;

  } catch (err) {
    // Graceful Fail-Safe: If Edge runtime encounters any critical error, pass through safely instead of returning 500
    console.error("Middleware Edge Execution Error:", err);
    return res;
  }
}

export const config = {
  matcher: [
    '/login',
    '/admin/:path*',
    '/country-manager/:path*',
    '/finance-officer/:path*',
    '/head-of-operations/:path*',
    '/requester/:path*',
    '/profile/:path*'
  ],
};