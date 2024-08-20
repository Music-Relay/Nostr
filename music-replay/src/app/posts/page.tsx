"use client";

import React, { useEffect, useState } from 'react';
import { nip19 } from 'nostr-tools';
import NDK from '@nostr-dev-kit/ndk';

interface User {
    name: string;
    publicKey: string;
    about?: string;
    image?: string;
}

async function getProfil(npub: string): Promise<User | null> {
    const defaultRelays = [
        "wss://relay.nostromo.social",
        "wss://relay.damus.io",
        "wss://relay.primal.net",
    ];

    const ndk = new NDK({ explicitRelayUrls: defaultRelays });

    await ndk.connect().catch((error) => {
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
        return await ndk.fetchEvent(filter);
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
}

const PostPage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Vous pouvez obtenir npub de diverses manières, ici il est codé en dur
    const npub = 'npub1l4z7409vt0x3ma3kctf3gwhquv2jxxyr9l8zph35pylmy4y40qvqklr7sh';

    useEffect(() => {
        const fetchUserProfile = async () => {
            const profile = await getProfil(npub);
            setUser(profile);
            setLoading(false);
        };

        fetchUserProfile();
    }, [npub]);

    if (loading) {
        return <p>Loading profile...</p>;
    }

    if (!user) {
        return <p>User profile not found.</p>;
    }

    return (
        <div className="post-page">
            <h1>Post Page</h1>
            <div className="user-profile">
                {user.image && <img src={user.image} alt={user.name} className="user-profile__image" />}
                <h2 className="user-profile__name">{user.name}</h2>
            </div>
            {/* Vous pouvez ajouter plus de contenu ici pour la page de post */}
        </div>
    );
};

export default PostPage;
