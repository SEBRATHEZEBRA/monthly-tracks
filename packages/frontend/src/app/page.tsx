"use client";
import BasicButton from '@/components/buttons/BasicButton';
import { useState } from 'react';

export default function Home() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");


  const handleCreatePlaylist = async(): Promise<void> => {
    console.log("button has been clicked");
    const playlistName = await fetch(process.env.NEXT_PUBLIC_API_URL ?? "", {
      method: "POST",
      body: JSON.stringify({ "userId": "seb-browser", "month": month, "year": year }),
    });
    console.log(`Outcome: ${playlistName}`);
    setMonth("");
    setYear("");
  };

  return (
    <main className="bg-black flex min-h-screen flex-col items-center p-24">
      <h1 className="text-white">monthly playlist maker</h1>
      <div className="flex items-center">
        <input 
          className={`text-black rounded m-1 p-2`} 
          placeholder={"month"}
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />
        <input 
          className={`text-black rounded m-1 p-2`} 
          placeholder={"year"}
          value={year}
          onChange={(event) => setYear(event.target.value)}
        />
      </div>
      <BasicButton text="create playlist" onClick={handleCreatePlaylist} />
    </main>
  );
}
