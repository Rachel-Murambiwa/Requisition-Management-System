import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 1. TEMPORARY: Fake a logged-in user session so we can preview pages locally
  const session = { user: { email: 'test@uncommon.org' } };

  /* 
   * (We will uncomment this real database check later when we connect live logins)
   * const { data: { session } } = await supabase.auth.getSession();
   */

  const url = req.nextUrl.clone();
  const { pathname } = url;

  // 2. Define your public authentication routes
  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/forgot-password') || 
                     pathname.startsWith('/reset-password');

  // 3. Apply routing protection rules
  if (!session) {
    // If the user is logged out and trying to access a protected dashboard, kick them to login
    if (!isAuthPage && pathname !== '/' && !pathname.startsWith('/api')) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } else {
    // If the user is already logged in and tries to access auth pages, redirect them to the requester dashboard
    if (isAuthPage) {
      url.pathname = '/requester';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

// 4. Configure matcher rules to prevent middleware from running on static media assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};