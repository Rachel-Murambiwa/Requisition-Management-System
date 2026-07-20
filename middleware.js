import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // 1. AUTHENTICATION PROTECTION GUARD
  const { data: { session } } = await supabase.auth.getSession();
  const path = request.nextUrl.pathname;

  if (!session) {
    if (path !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // Prevent logged-in users from seeing the login screen again
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
    return NextResponse.redirect(new URL(roleRedirects[fallbackRole] || '/unauthorised', request.url));
  }

  // 2. FETCH ROLE
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

  if (!userRole) return response;

  // 3. ISOLATION ROUTE MATRIX
  if (path.startsWith('/requester') && userRole !== 'requester') {
    return NextResponse.redirect(new URL('/unauthorised', request.url));
  }
  if (path.startsWith('/finance-officer') && userRole !== 'finance-officer') {
    return NextResponse.redirect(new URL('/unauthorised', request.url));
  }
  if (path.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorised', request.url));
  }
  if (path.startsWith('/head-of-operations') && userRole !== 'head-of-operations') {
    return NextResponse.redirect(new URL('/unauthorised', request.url));
  }
  if (path.startsWith('/country-manager') && userRole !== 'country-manager') {
    return NextResponse.redirect(new URL('/unauthorised', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/login', // Explicitly intercept login to catch session bindings cleanly
    '/admin/:path*',
    '/country-manager/:path*',
    '/finance-officer/:path*',
    '/head-of-operations/:path*',
    '/requester/:path*',
    '/profile/:path*'
  ],
};