"use client";

import React from 'react';
import { Box, Typography, Container, Paper, ThemeProvider } from '@mui/material';
import Image from 'next/image';
import theme from '@/utils/theme';
import logo from '../../../public/logo.png';
import home from '../../../public/home.webp'; // Assurez-vous que le chemin est correct

const HomePage: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
                {/* Partie supérieure avec l'image */}
                <Box
                    sx={{
                        height: '80vh',
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    <Image
                        src={home} // Utilisation de l'import de l'image
                        alt="Home Banner"
                        layout="fill"
                        objectFit="cover"
                        quality={100}
                    />
                    {/* Logo au milieu pour séparer les deux parties */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            height: '300px',
                            width: '300px', // Ajustez la hauteur selon la taille de votre logo
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1, // Assure que le logo est au-dessus de l'image
                            borderBottom: 1,
                        }}
                    >
                        <Image
                            src={logo} // Utilisation de l'import du logo
                            alt="Site Logo"
                            height={100} // Ajustez la taille du logo selon vos besoins
                            width={100}
                        />
                    </Box>
                </Box>

                {/* Partie inférieure avec la description */}
                <Box
                    sx={{
                        minHeight: '30vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 4,
                        textAlign: 'center',
                        backgroundColor: theme.palette.background.default,
                    }}
                >
                    <Container component={Paper} elevation={4} sx={{ padding: 4 }}>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Welcome to Our Site!
                        </Typography>
                        <Typography variant="body1">
                            Connect, share, and collaborate with musicians worldwide on a secure, decentralized platform. Your music, your control—powered by NOSTR. Join us and let every note make an impact.
                        </Typography>
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default HomePage;
