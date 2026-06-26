import { NextResponse } from 'next/server';

export async function middleware(req) {
  // 🔓 TOTAL BYPASS: Allows you to review any page freely without restrictions!
  return NextResponse.next();
}

// Keep the matcher active so Next.js doesn't waste energy processing static image assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};