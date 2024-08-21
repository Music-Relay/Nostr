import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
//import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
//import ResponsiveAppBar from "@/components/NavBar/NavBar";
import theme from "@/utils/theme";
import { Box, ThemeProvider } from "@mui/material";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Music Relay",
    description: "Connect, share, and collaborate with musicians worldwide on a secure, decentralized platform. Your music, your control—powered by NOSTR. Join us and let every note make an impact.",
    manifest: "/manifest.json",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">
        <body className={inter.className}>
            <ThemeProvider theme={theme}>
                    <Box
                        display={"flex"}
                        flexDirection={"column"}
                        minHeight={"100vh"}
                    >
                        <Box flexGrow={1}>
                            {children}
                        </Box>
                    </Box>
            </ThemeProvider>
        </body>
        </html>
    );
}