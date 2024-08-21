"use client";

import { useState, useEffect } from "react";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { Container, TextField, Button, Typography, Paper, Box, Snackbar, Alert, CircularProgress } from "@mui/material";
import theme from '@/utils/theme'; // Assurez-vous que le chemin est correct

export default function LoginPage() {
    const [privateKey, setPrivateKey] = useState<string>("");
    const [signer, setSigner] = useState<NDKPrivateKeySigner | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("info");
    const [loading, setLoading] = useState<boolean>(false); // État de chargement

    useEffect(() => {
        const storedPrivateKey = localStorage.getItem('privateKey');
        if (storedPrivateKey) {
            setPrivateKey(storedPrivateKey);
        }
    }, []);

    const handleSetSigner = async () => {
        try {
            setLoading(true); // Début du chargement
            if (!privateKey) {
                setSnackbarMessage('Please provide a valid private key.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
                setLoading(false); // Fin du chargement
                return;
            }

            const storedPrivateKey = localStorage.getItem('privateKey');
            if (storedPrivateKey && storedPrivateKey === privateKey) {
                setSnackbarMessage('You are already connected with this private key.');
                setSnackbarSeverity('info');
                setOpenSnackbar(true);
                setLoading(false); // Fin du chargement
                return;
            }

            const newSigner = new NDKPrivateKeySigner(privateKey);
            setSigner(newSigner);
            localStorage.setItem('privateKey', privateKey);
            const user = await newSigner.user();
            localStorage.setItem('publicKey', user.npub);

            setSnackbarMessage('You are now connected.');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);

            window.location.href = '/posts'; // Redirection après connexion réussie
        } catch (error) {
            setSnackbarMessage('An error occurred during login.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setLoading(false); // Fin du chargement
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: theme.palette.background.default }}>
            <Paper elevation={6} sx={{ padding: '2rem', width: '100%', maxWidth: 400, bgcolor: theme.palette.background.paper }}>
                {loading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight="100vh"
                        bgcolor={theme.palette.background.default}
                    >
                        <CircularProgress size={60} color="primary" />
                    </Box>
                ) : (
                    <>
                        <Typography variant="h5" align="center" sx={{ marginBottom: '1rem', color: theme.palette.text.primary }}>Login</Typography>
                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Private Key"
                                type="text"
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                                placeholder="Enter your private key"
                                variant="outlined"
                                InputProps={{
                                    style: { color: theme.palette.text.primary }
                                }}
                                InputLabelProps={{
                                    style: { color: theme.palette.text.primary }
                                }}
                                sx={{ mb: 2 }}
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSetSigner}
                                sx={{
                                    marginTop: '1rem',
                                    bgcolor: theme.palette.primary.dark,
                                    color: theme.palette.background.paper,
                                    '&:hover': {
                                        bgcolor: theme.palette.primary.light,
                                        color: theme.palette.text.primary,
                                    },
                                }}
                            >
                                Connect
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}
