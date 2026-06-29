import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // 🛠️ LOCAL DEV BYPASS: Allows you to view any dashboard page freely on localhost
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  
  // Create an authenticated server-side context client matching Next.js middleware rules
  const supabase = createMiddlewareClient({ req, res });

  // Refresh and unwrap the active authentication token session parameters
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const userRole = user?.user_metadata?.role;

  const nextUrl = req.nextUrl.clone();
  const path = nextUrl.pathname;

  // 1. AUTHENTICATION PROTECTION GUARD: Boot unauthenticated requests out to login terminal
  if (!session) {
    nextUrl.pathname = '/login';
    return NextResponse.redirect(nextUrl);
  }

  // 2. ISOLATION ROUTE MATRIX: Cross-examine metadata role strings against target path groups
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

// 🎯 ROUTE MATCHER FILTER: Exclude internal static assets, icons, and public landing frames
export const config = {
  matcher: [
    /*
     * Match all corporate operational system dashboards except:
     * - login (auth entry screen)
     * - welcome / account activation views
     * - unauthorised (403 landing error block)
     * - static api assets or public files (_next/static, _next/image, favicon.ico)
     */
    '/((?!login|welcome|unauthorised|api/invite-staff|_next/static|_next/image|favicon.ico|fonts).*)',
  ],
};