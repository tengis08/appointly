"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SupabaseTestPage() {
  const [message, setMessage] = useState("Checking connection...");

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.from("non_existing_table").select("*").limit(1);

        if (error) {
          setMessage("Supabase is connected. Test query returned an expected error.");
          return;
        }

        setMessage("Supabase is connected.");
      } catch {
        setMessage("Could not connect to Supabase.");
      }
    }

    checkConnection();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="rounded-3xl border border-neutral-200 p-8 text-center">
        <h1 className="text-2xl font-bold">Supabase test</h1>
        <p className="mt-4 text-neutral-600">{message}</p>
      </div>
    </main>
  );
}