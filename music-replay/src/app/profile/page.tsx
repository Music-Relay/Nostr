"use client";

import React, { useEffect, useState } from 'react';
import { nip19 } from 'nostr-tools';
import NDK from '@nostr-dev-kit/ndk';
import { Container, Typography, Avatar, Button, Paper, Box, IconButton, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';

interface User {
    name: string;
    publicKey: string;
    privateKey?: string;
    about?: string;
    image?: string;
    followers?: number;
    following?: number;
}

const fetchUserProfile = async (npub: string): Promise<User | null> => {
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
            privateKey: localStorage.getItem('privateKey') || '',
            about: parsed.about,
            image: parsed.picture,
            followers: parsed.followers || 0,
            following: parsed.following || 0,
        };

        return user;
    } else {
        return null;
    }
};

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showFullPublicKey, setShowFullPublicKey] = useState<boolean>(false);
    const [showFullPrivateKey, setShowFullPrivateKey] = useState<boolean>(false);

    useEffect(() => {
        // Récupération de la clé publique depuis le localStorage
        const publicKey = localStorage.getItem('publicKey');

        if (publicKey) {
            const fetchUserProfileData = async () => {
                const profile = await fetchUserProfile(publicKey);
                setUser(profile);
                setLoading(false);

                // Log user profile details to console
                if (profile) {
                    console.log("User Profile:", profile);
                }
            };

            fetchUserProfileData();
        } else {
            console.error('Clé publique non trouvée dans le localStorage.');
            setLoading(false);
        }
    }, []);

    const togglePublicKeyVisibility = () => {
        setShowFullPublicKey(prevState => !prevState);
    };

    const togglePrivateKeyVisibility = () => {
        setShowFullPrivateKey(prevState => !prevState);
    };

    if (loading) {
        return <Typography variant="h6" align="center">Loading profile...</Typography>;
    }

    if (!user) {
        return <Typography variant="h6" align="center">User profile not found.</Typography>;
    }

    return (
        <Container
            component={Paper}
            elevation={3}
            sx={{
                padding: 3,
                maxWidth: 350, // Ajuste la largeur pour un cadre plus large
                margin: 'auto',
                marginTop: 4,
                bgcolor: '#ffffff', // Cadre blanc
                color: '#000000', // Texte noir
                borderRadius: 2, // Coins arrondis pour un meilleur style
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: 4
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    {user.image ? (
                        <Avatar
                            src={user.image}
                            alt={user.name}
                            sx={{
                                width: 100,
                                height: 100,
                                marginRight: 2
                            }}
                        />
                    ) : (
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                marginRight: 2
                            }}
                        >
                            {user.name ? user.name[0] : 'U'}
                        </Avatar>
                    )}
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{
                                marginBottom: 1
                            }}
                        >
                            {user.name}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {user.about}
                        </Typography>
                    </Box>
                </Box>
                <Box>
                    <IconButton>
                        <EditIcon />
                    </IconButton>
                    <IconButton>
                        <SettingsIcon />
                    </IconButton>
                </Box>
            </Box>
            <Divider sx={{ marginBottom: 2 }} />
            <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
                    <strong>Public Key:</strong>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {showFullPublicKey ? user.publicKey : `${user.publicKey.substring(0, 10)}...`}
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={togglePublicKeyVisibility}
                        >
                            {showFullPublicKey ? 'Hide' : 'Show'}
                        </Button>
                    </Box>
                </Typography>
                <Typography variant="subtitle1">
                    <strong>Private Key:</strong>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {showFullPrivateKey ? user.privateKey : `${user.privateKey?.substring(0, 10)}...`}
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={togglePrivateKeyVisibility}
                        >
                            {showFullPrivateKey ? 'Hide' : 'Show'}
                        </Button>
                    </Box>
                </Typography>
            </Box>
            <Divider sx={{ marginBottom: 2}} />
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between', // Aligns items side by side with space between
                    gap: 2, // Adds space between the items
                    marginBottom: 4
                }}
            >
                <Typography variant="subtitle1" sx={{ textAlign: 'center', flex: 1 }}>
                    <strong>Followers:</strong> {user.followers || 0}
                </Typography>
                <Typography variant="subtitle1" sx={{ textAlign: 'center', flex: 1 }}>
                    <strong>Following:</strong> {user.following || 0}
                </Typography>
            </Box>
            <Divider sx={{ marginBottom: 2}} />
        </Container>
    );
};

export default ProfilePage;
