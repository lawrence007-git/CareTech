import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Routes reachable while signed out. "/" is the public marketing site
// (Header/Hero/Capabilities/Work/Approach/Contact/Footer) — it must stay
// public or logged-out visitors get bounced straight to /signin.
const isPublicRoute = createRouteMatcher(["/", "/signin", "/signup", "/reset-password"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const authenticated = await convexAuth.isAuthenticated();

  // Signed-in users shouldn't see the sign-in/sign-up forms again.
  // (Deliberately excludes "/" — being authenticated is fine on the landing page.)
  const isAuthOnlyPage = request.nextUrl.pathname === "/signin" || request.nextUrl.pathname === "/signup";
  if (isAuthOnlyPage && authenticated) {
    return nextjsMiddlewareRedirect(request, "/");
  }

  // Everything else (outside the public list) requires a session.
  if (!isPublicRoute(request) && !authenticated) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }
});

export const config = {
  // Run on everything except static assets / Next internals.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};