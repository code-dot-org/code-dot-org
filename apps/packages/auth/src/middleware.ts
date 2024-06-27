import {auth} from '@cdo/app/auth';

export default auth((req) => {
  console.log('==========middleware');
  if (!req.auth && req.nextUrl.pathname !== '/login') {
    const newUrl = new URL('/login', req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
