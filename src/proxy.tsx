import createMiddleware from 'next-intl/middleware';
import { NextResponse } from "next/server";
import { auth } from "~/libs/auth";
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const response = intlMiddleware(req);
  
  const locale = req.cookies.get('NEXT_LOCALE')?.value || routing.defaultLocale;
  if (response) {
    try {
      response.headers.set('accept-language', locale);
    } catch {}
  }

  const pathnameWithoutLocale = pathname.replace(/^\/(id|en)/, '') || '/';

  // Redirect authenticated users away from the login page
  if (req.auth && pathnameWithoutLocale === "/login") {
    const dashboardPath = pathname.startsWith(`/${locale}`) && locale !== routing.defaultLocale
      ? `/${locale}/dashboard`
      : '/dashboard';
    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  // Redirect root path to dashboard for authenticated users, or login for unauthenticated users
  // if (pathname === "/") {
  //   if (req.auth) {
  //     return NextResponse.redirect(new URL("/dashboard", req.url));
  //   } else {
  //     return NextResponse.redirect(new URL("/login", req.url));
  //   }
  // }
  if (pathnameWithoutLocale === '/') {
    const targetPath = req.auth ? '/dashboard' : '/login';
    const pathWithLocale = pathname.startsWith(`/${locale}`) && locale !== routing.defaultLocale
      ? `/${locale}${targetPath}`
      : targetPath;
    return NextResponse.redirect(new URL(pathWithLocale, req.url));
  }

  // Protect all admin routes (any route that's not login, api, or public assets)
  const isAdminRoute = !pathnameWithoutLocale.startsWith("/login") && 
                      !pathnameWithoutLocale.startsWith("/api") && 
                      !pathnameWithoutLocale.startsWith("/_next") && 
                      !pathnameWithoutLocale.startsWith("/favicon");
  
  // if (!req.auth && isAdminRoute) {
  //   const callbackUrl = pathname;
  //   return NextResponse.redirect(new URL("/login?callbackUrl="+callbackUrl, req.url));
  // }
  
  // if (!req.auth && req.nextUrl.pathname !== "/login") {
  //   const newUrl = new URL("/login", req.nextUrl.origin)
  //   return Response.redirect(newUrl)
  // }
  if (!req.auth && isAdminRoute) {
    const callbackUrl = pathname + (search || '');
    const loginPath = pathname.startsWith(`/${locale}`) && locale !== routing.defaultLocale
      ? `/${locale}/login`
      : '/login';
    return NextResponse.redirect(new URL(`${loginPath}?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url));
  }
  
  if (response) {
    return response;
  }

  // Allow other requests to proceed
  const nextResponse = NextResponse.next();
  nextResponse.headers.set('accept-language', locale);
  return nextResponse;
});


export const config = {
  // matcher: [
  //   /*
  //    * Match all request paths except for the ones starting with:
  //    * - api (API routes)
  //    * - _next/static (static files)
  //    * - _next/image (image optimization files)
  //    * - favicon.ico (favicon file)
  //    */
  //   '/((?!api|_next/static|_next/image|favicon.ico).*)',
  // ],
  matcher: ['/', '/(id|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};