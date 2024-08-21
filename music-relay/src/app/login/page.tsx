"use client";

import { useState, useEffect } from "react";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { Container, TextField, Button, Typography, Paper, Box, Snackbar, Alert } from "@mui/material";

export default function LoginPage() {
    const [privateKey, setPrivateKey] = useState<string>("");
    const [signer, setSigner] = useState<NDKPrivateKeySigner | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("info");

    useEffect(() => {
        // Load the private key from localStorage when the component mounts
        const storedPrivateKey = localStorage.getItem('privateKey');
        if (storedPrivateKey) {
            setPrivateKey(storedPrivateKey);
            console.log("Private key loaded from localStorage:", storedPrivateKey);
        } else {
            console.log("No private key found in localStorage.");
        }
    }, []);

    // Function to set up the signer
    const handleSetSigner = async () => {
        try {
            if (!privateKey) {
                setSnackbarMessage('Please provide a valid private key.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
                return;
            }

            // Check if the private key is already stored
            const storedPrivateKey = localStorage.getItem('privateKey');
            if (storedPrivateKey && storedPrivateKey === privateKey) {
                setSnackbarMessage('You are already connected with this private key.');
                setSnackbarSeverity('info');
                setOpenSnackbar(true);
                return;
            }

            // Create a new signer with the provided private key
            const newSigner = new NDKPrivateKeySigner(privateKey);
            setSigner(newSigner);

            // Save the private key to localStorage
            localStorage.setItem('privateKey', privateKey);

            // Retrieve the public key from the signer and store it
            const user = await newSigner.user(); // Fetch the user information which includes the public key
            localStorage.setItem('publicKey', user.npub); // Save the public key to localStorage

            console.log("Signer created:", newSigner);
            setSnackbarMessage('You are now connected.');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);

        } catch (error) {
            console.error("Error creating the signer:", error);
            setSnackbarMessage('An error occurred during login.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Paper elevation={6} sx={{ padding: '2rem', width: '100%', maxWidth: 400 }}>
                <Typography variant="h5" align="center" sx={{ marginBottom: '1rem' }}>Login</Typography>
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
                            style: { color: '#000000' } // Dark text
                        }}
                        InputLabelProps={{
                            style: { color: '#000000' } // Dark label
                        }}
                        sx={{ mb: 2 }} // Margin bottom for spacing
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleSetSigner}
                        sx={{ marginTop: '1rem', backgroundColor: '#000' }} // Black button
                    >
                        Connect
                    </Button>
                </Box>
            </Paper>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Position at bottom center
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}
