"use client";

import React from "react";
import NDK, {
  NDKEvent,
  NDKFilter,
  NDKKind,
  NDKSubscriptionOptions,
} from "@nostr-dev-kit/ndk";
import { getEventHash, signEvent } from "nostr-tools";

// Find relays at https://nostr.watch
const defaultRelays = ["wss://lunchbox.sandwich.farm"];

// Define the data that will be returned by useNDK();
type NDKContextType = {
  ndk: NDK;
  publishEvent: (
    kind: NDKKind | number,
    content: string,
    tags?: string[][]
  ) => void;
  subscribeAndHandle: (
    filter: NDKFilter,
    handler: (event: NDKEvent) => void,
    opts?: NDKSubscriptionOptions
  ) => void;
};

// define this outside of the below NDKProvider component so that it is in scope for useNDK()
let NDKContext: React.Context<NDKContextType>;

export const NDKProvider = ({ children }: { children: React.ReactNode }) => {
  const ndkLocal = new NDK({
    explicitRelayUrls: defaultRelays,
  });

  const ndk = React.useRef(ndkLocal);

  ndk.current
    .connect()
    .then(() => console.log("Connected to NDK"))
    .catch(() => console.log("Failed to connect to NDK"));

  const privateKey = "votre-clé-privée-ici";

  const subscribeAndHandle = (
    filter: NDKFilter,
    handler: (event: NDKEvent) => void,
    opts?: NDKSubscriptionOptions
  ) => {
    const sub = ndk.current.subscribe(filter, opts);
    sub.on("event", (e: NDKEvent) => handler(e));
  };

  const publishEvent = async (
    kind: NDKKind | number,
    content: string,
    tags: string[][] = []
  ) => {
    const ndkEvent = new NDKEvent(ndk.current);
    ndkEvent.kind = kind;
    ndkEvent.content = content;
    ndkEvent.tags = tags;

    // Créer un événement brut
    const rawEvent = {
      kind: ndkEvent.kind,
      content: ndkEvent.content,
      tags: ndkEvent.tags,
      pubkey: ndk.current.signer.getPublicKey(),
      created_at: Math.floor(Date.now() / 1000),
    };

    // Générer le hash de l'événement
    rawEvent.id = getEventHash(rawEvent);

    // Signer l'événement
    rawEvent.sig = signEvent(rawEvent, privateKey);

    ndkEvent.rawEvent = rawEvent; // Assigner l'événement signé

    ndkEvent.publish();

    console.log("Published event", ndkEvent);
  };

  const contextValue = {
    ndk: ndk.current,
    publishEvent,
    subscribeAndHandle,
  };

  NDKContext = React.createContext(contextValue);

  return (
    <NDKContext.Provider value={contextValue}>{children}</NDKContext.Provider>
  );
};

export const useNDK = () => React.useContext(NDKContext);
