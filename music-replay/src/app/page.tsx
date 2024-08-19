"use client";

import { useEffect, useState } from "react";
import { useNDK } from "@/hooks/useNDK";
import { NDKEvent, NDKFilter, NDKKind } from "@nostr-dev-kit/ndk";

export default function Home() {
  const [mostRecentEvent, setMostRecentEvent] = useState({});

  const { subscribeAndHandle, publishEvent } = useNDK();

  useEffect(() => {
    const filter: NDKFilter = {
      kinds: [NDKKind.Text],
    };

    const handler = (event: NDKEvent) => {
      setMostRecentEvent(event.rawEvent());
    };

    subscribeAndHandle(filter, handler, { closeOnEose: true });
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-1/2 mx-auto bg-gray-600 p-4 rounded-lg shadow-lg overflow-auto">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(mostRecentEvent, null, 2)}
        </pre>
      </div>
    </main>
  );
}