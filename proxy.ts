import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Routes that should be reachable while signed out.
// Add any other public marketing/reset-password routes here.
const isPublicRoute = createRouteMatcher(["/signin", "/signup", "/reset-password"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const authenticated = await convexAuth.isAuthenticated();

  // Signed-in users shouldn't see the sign-in/sign-up forms again.
  if (isPublicRoute(request) && authenticated) {
    return nextjsMiddlewareRedirect(request, "/");
  }

  // Everything else requires a session.
  if (!isPublicRoute(request) && !authenticated) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }
});

export const config = {
  // Run on everything except static assets / Next internals.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};