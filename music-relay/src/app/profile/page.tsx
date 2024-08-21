"use client";

import React, { useEffect, useState } from 'react';
import { nip19 } from 'nostr-tools';
import NDK from '@nostr-dev-kit/ndk';
import { Container, Typography, Avatar, Button, Paper, Box, Divider, Stack, CircularProgress, ThemeProvider } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import theme from '@/utils/theme';

interface User {
    name: string;
    publicKey: string;
    privateKey?: string;
    about?: string;
    image?: string;
}

export const fetchUserProfile = async (npub: string): Promise<User | null> => {
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
        const publicKey = localStorage.getItem('publicKey');

        if (publicKey) {
            const fetchUserProfileData = async () => {
                const profile = await fetchUserProfile(publicKey);
                setUser(profile);
                setLoading(false);

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

    const handleLogout = () => {
        localStorage.clear(); // Efface le localStorage
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                bgcolor={theme.palette.background.default}
            >
                <CircularProgress size={60} color="primary" />
            </Box>
        );
    }

    if (!user) {
        return <Typography variant="h6" align="center">User profile not found.</Typography>;
    }

    return (
        <ThemeProvider theme={theme}>
            <Container
                component={Paper}
                elevation={8}
                sx={{
                    padding: 4,
                    maxWidth: 500,
                    margin: 'auto',
                    marginTop: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: 4,
                        textAlign: 'center'
                    }}
                >
                    <Avatar
                        src={user.image}
                        alt={user.name}
                        sx={{
                            width: 150,
                            height: 150,
                            mb: 3,
                            border: '5px solid',
                            borderColor: theme.palette.primary.main,
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        {!user.image && user.name ? user.name[0] : 'U'}
                    </Avatar>
                    <Typography
                        variant="h4"
                        sx={{ mb: 1, fontWeight: 'bold' }}
                    >
                        {user.name}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ maxWidth: 400 }}
                    >
                        {user.about || 'No description available.'}
                    </Typography>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Stack spacing={3} sx={{ width: '100%', textAlign: 'center' }}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            <strong>Public Key:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                {showFullPublicKey ? user.publicKey : `${user.publicKey.substring(0, 10)}...`}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={togglePublicKeyVisibility}
                                sx={{
                                    bgcolor: theme.palette.primary.dark,
                                    color: theme.palette.background.paper,
                                    '&:hover': {
                                        bgcolor: theme.palette.primary.light,
                                    },
                                }}
                            >
                                {showFullPublicKey ? 'Hide' : 'Show'}
                            </Button>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            <strong>Private Key:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                {showFullPrivateKey ? user.privateKey : `${user.privateKey?.substring(0, 10)}...`}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={togglePrivateKeyVisibility}
                                sx={{
                                    bgcolor: theme.palette.primary.dark,
                                    color: theme.palette.background.paper,
                                    '&:hover': {
                                        bgcolor: theme.palette.primary.light,
                                    },
                                }}
                            >
                                {showFullPrivateKey ? 'Hide' : 'Show'}
                            </Button>
                        </Box>
                    </Box>
                </Stack>
                <Divider sx={{ my: 3 }} />
                <Button
                    variant="contained"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    component="a"
                    href="/login"
                    sx={{
                        mt: 2,
                        width: '100%',
                        padding: 1.5,
                        bgcolor: theme.palette.primary.dark,
                        color: theme.palette.background.paper,
                        fontWeight: 'bold',
                        '&:hover': {
                            bgcolor: theme.palette.primary.light,
                        },
                    }}
                >
                    Log out
                </Button>
            </Container>
        </ThemeProvider>
    );
};

export default ProfilePage;