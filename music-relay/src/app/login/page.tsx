"use client";
import { useState } from "react";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

export default function Login() {
    const [privateKey, setPrivateKey] = useState<string>("");
    const [signer, setSigner] = useState<NDKPrivateKeySigner | null>(null);
    const [publicKey, setPublicKey] = useState<string>("");

    // Function to set up the signer
    const handleSetSigner = async () => {
        try {
            if (!privateKey) {
                alert("Veuillez fournir une clé privée valide.");
                return;
            }

            // Create a new signer with the provided private key
            const newSigner = new NDKPrivateKeySigner(privateKey);
            setSigner(newSigner);

            // Retrieve the public key from the signer
            const user = await newSigner.user(); // Fetch the user information which includes the public key
            setPublicKey(user.npub);

            console.log("Signer created:", newSigner);
            alert("Signer créé avec succès");

        } catch (error) {
            console.error("Erreur lors de la création du signer:", error);
            alert("Une erreur s'est produite lors de la création du signer");
        }
    };

    return (
        <div>
            <h2>Clé Privée :</h2>
            <input
                type="text"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Entrez votre clé privée"
                style={{ display: "block", marginBottom: "1rem", width: "100%" }}
            />
            <button onClick={handleSetSigner}>Créer le Signer</button>
            {publicKey && (
                <div>
                    <h3>Clé Publique:</h3>
                    <p>{publicKey}</p>
                </div>
            )}
        </div>
    );
}