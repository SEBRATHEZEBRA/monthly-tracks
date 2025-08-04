"use client";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { CreatePlaylistForm } from "@/components/CreatePlaylistForm";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className='flex flex-col min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      {/* 1) header at the top */}
      <header className='flex justify-center'>
        <h1 className='text-4xl font-bold'>Monthly Tracks</h1>
      </header>

      {/* 2) middle area grows & centers its contents */}
      <main className='flex flex-1 items-center justify-center'>
        {session === null ? (
          <Button onClick={() => signIn("spotify")}>
            Sign in with Spotify
          </Button>
        ) : (
          <CreatePlaylistForm />
        )}
      </main>

      {/* 3) footer stuck to bottom */}
      <footer className='flex justify-center'>
        <Footer />
      </footer>
    </div>
  );
}
