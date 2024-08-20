"use client";

import { useEffect, useState } from "react";
import { useNDK } from "@/hooks/useNDK";
import { NDKEvent, NDKFilter, NDKKind } from "@nostr-dev-kit/ndk";
import { Button } from "@mui/material";

export default function Home() {
  const [events, setEvents] = useState<NDKEvent[]>([]);

  const { subscribeAndHandle, publishEvent } = useNDK();

  useEffect(() => {
    const filter: NDKFilter = {
      kinds: [NDKKind.Text],
      "#t": ["music-relay"], // Filtrer les événements avec la tag "music-relay"
    };

    const handler = (event: NDKEvent) => {
      setEvents(prevEvents => [...prevEvents, event.rawEvent()]);
    };

    subscribeAndHandle(filter, handler, { closeOnEose: true });
  }, []);

  const createEvent = () => {
    const tags = [["t", "music-relay"]];
    publishEvent(NDKKind.Text, "Hello, World!", tags);
  };
  

  return (
    <>
      <h1 className="text-4xl font-bold">Music Relay</h1>

      <Button onClick={createEvent}>Create Event</Button>

      <div>
        <h2 className="text-2xl font-bold">Most Recent Events</h2>
        <ul>
          {events.map((event, index) => (
            <li key={index}>{JSON.stringify(event)}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
