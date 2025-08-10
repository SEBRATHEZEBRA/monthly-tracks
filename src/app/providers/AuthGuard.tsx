// app/providers/AuthGuard.tsx
"use client";

import { Session } from "next-auth";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

import { ReactNode } from "react";

type AuthGuardProps = {
  children: ReactNode;
  session?: Session;
};

export function AuthGuard({ children, session }: AuthGuardProps) {
  return (
    <SessionProvider session={session}>
      <InnerGuard>{children}</InnerGuard>
    </SessionProvider>
  );
}

function InnerGuard({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.error === "RefreshAccessTokenError"
    ) {
      // clear the bad session cookie automatically
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/";
      document.cookie =
        "__Secure-next-auth.session-token=; Max-Age=0; path=/; secure";
      // bounce into the sign-in flow
      signIn("spotify", { callbackUrl: window.location.href });
    }
  }, [status, session]);

  // you can also show a loading state while you kick out
  if (session?.error === "RefreshAccessTokenError") {
    return <p>Redirecting to sign in…</p>;
  }
  return <>{children}</>;
}
