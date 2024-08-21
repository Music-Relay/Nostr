"use client";
import { createTheme } from "@mui/material/styles";
import { Roboto } from "next/font/google";

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
});

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#fcfcff',
            light: '#000000',
            dark: '#000000',
        },
        secondary: {
            main: '#ffffff',
        },
        background: {
            default: '#000000',
            paper: '#ffffff',
        },
        error: {
            main: '#dc2121',
            dark: '#c30606',
            light: '#dcb2b2',
        },
        divider: 'rgba(255,255,255,0.12)',
    },
    typography: {
        fontFamily: '"league spartam", "Helvetica", "Arial", sans-serif',
    },
});

export default theme;