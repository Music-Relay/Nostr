"use client";

import React, { useEffect, useState } from "react";
import NDK, {
  NDKEvent,
  NDKFilter,
  NDKKind,
  NDKSubscriptionOptions,
  NDKPrivateKeySigner,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";

// Find relays at https://nostr.watch
const defaultRelays = [
  "wss://relay.nostromo.social",
  "wss://relay.damus.io",
  "wss://relay.primal.net",
];

interface User {
  name: string;
  publicKey: string;
  privateKey?: string;
  about?: string;
  image?: string;
}

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
  fetchUserProfile?: (npub: string) => Promise<User | null>;
};

let NDKContext = React.createContext<NDKContextType>({} as NDKContextType);

export const NDKProvider = ({ children }: { children: React.ReactNode }) => {
  const ndkLocal = new NDK({ explicitRelayUrls: defaultRelays });
  const ndk = React.useRef(ndkLocal);

  useEffect(() => {
    ndk.current
      .connect()
      .then(() => console.log("Connected to NDK"))
      .catch(() => console.log("Failed to connect to NDK"));
  }, []);

  const getSigner = (): NDKPrivateKeySigner | null => {
    const privateKey = localStorage.getItem("privateKey");
    if (privateKey) {
      console.log("Private key found in localStorage.");
      return new NDKPrivateKeySigner(privateKey);
    } else {
      console.error("No private key found in localStorage.");
      return null;
    }
  };

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
    const signer = getSigner();
    if (!signer) {
      console.error("No signer available, event cannot be signed.");
      return;
    }
    

    const ndkEvent = new NDKEvent(ndk.current);
    ndkEvent.kind = kind;
    ndkEvent.content = content;
    ndkEvent.tags = tags;
    await ndkEvent.sign(signer);

    try {
      console.log("Event signed successfully:", ndkEvent);

      await ndkEvent.publish();
      console.log("Published event", ndkEvent);
    } catch (error) {
      console.error("Error signing or publishing event:", error);
    }
  };

  const fetchUserProfile = async (npub: string): Promise<User | null> => {

    await ndk.current.connect().catch((error) => {
        console.error("Error connecting to NDK", error);
    });

    const kind0Filter = (pubkey: string) => ({
        kinds: [0],
        authors: [pubkey],
    });

    const searchProfil = async (query: string) => {
        let filter = {};

        if (query.startsWith("npub")) {
            const decodedNpub = nip19.decode(query);
            const pubkey = decodedNpub.data as string;
            filter = kind0Filter(pubkey);
        }

        console.log("SEARCH FILTER", filter);
        return await ndk.current.fetchEvent(filter);
    };

    let profilNDK = await searchProfil(npub);
    if (profilNDK != undefined) {
        const parsed = JSON.parse(profilNDK.content);
        let user: User = {
            name: parsed.name,
            publicKey: npub,
            about: parsed.about,
            image: parsed.picture,
        };

        return user;
    } else {
        return null;
    }
};

  const contextValue = {
    ndk: ndk.current,
    publishEvent,
    subscribeAndHandle,
    fetchUserProfile,
  };

  return (
    <NDKContext.Provider value={contextValue}>{children}</NDKContext.Provider>
  );
};

export const useNDK = () => React.useContext(NDKContext);
