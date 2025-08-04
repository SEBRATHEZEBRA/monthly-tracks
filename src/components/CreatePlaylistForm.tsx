"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export const CreatePlaylistForm = () => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/monthly-playlist", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create playlist");
      }

      setSuccess(`Created playlist “${data.playlistName}”`);
      // optionally: clear inputs
      setMonth("");
      setYear("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col items-center justify-center gap-4'
    >
      <div className='flex gap-2'>
        <Input
          placeholder='Month'
          value={month}
          onChange={(e) => setMonth(e.currentTarget.value)}
        />
        <Input
          placeholder='Year'
          value={year}
          onChange={(e) => setYear(e.currentTarget.value)}
        />
      </div>

      <Button type='submit' disabled={loading}>
        {loading ? "Creating…" : "Create Monthly Playlist"}
      </Button>

      {error && <p className='text-red-500'>{error}</p>}
      {success && <p className='text-green-500'>{success}</p>}
    </form>
  );
};
