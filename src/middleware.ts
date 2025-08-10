// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth((req) => {
  // If our JWT-refresh‐helper set token.error, kick them back to sign-in
  const tokenError = req.nextauth.token?.error;
  if (tokenError === "RefreshAccessTokenError") {
    // Remove the stale session cookie(s)
    const res = NextResponse.redirect(new URL("/api/auth/signin", req.url));
    res.cookies.delete("next-auth.session-token");
    res.cookies.delete("__Secure-next-auth.session-token");
    return res;
  }
  // otherwise just continue
  return NextResponse.next();
});

// apply this middleware to all routes that require a session
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
