"use client";

import { useEffect, useState, useRef } from "react";
import { useNDK } from "@/hooks/useNDK";
import { NDKEvent, NDKFilter, NDKKind } from "@nostr-dev-kit/ndk";
import { Box, Button, Card, CardContent, Typography, TextField, List, ListItem, ListItemText } from "@mui/material";
import { AttachFile, Send, Download, VisibilityOff, Visibility, GetApp } from "@mui/icons-material";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

interface ForumEventProps {
        event: NDKEvent;
}

const ForumEvent: React.FC<ForumEventProps> = ({ event }) => {
        const rawEvent = event.rawEvent();
        const content = rawEvent.content;

        // Extraire le fichier attaché s'il existe
        const fileTag = rawEvent.tags.find(tag => tag[0] === "musicxml" || tag[0] === "pdf");
        const fileData = fileTag ? fileTag[1] : null;
        const fileType = fileTag ? fileTag[0] : null;
        const osmdContainerRef = useRef<HTMLDivElement | null>(null);
        const [osmd, setOsmd] = useState<OpenSheetMusicDisplay | null>(null);
        const [isSheetVisible, setIsSheetVisible] = useState<boolean>(false);

        useEffect(() => {
                if (fileType === "musicxml" && fileData && isSheetVisible) {
                        const osmdInstance = new OpenSheetMusicDisplay(osmdContainerRef.current!, {
                                drawTitle: false,
                        });
                        setOsmd(osmdInstance);
                        osmdInstance.load(fileData).then(() => {
                                osmdInstance.render();
                        });
                }
        }, [fileData, fileType, isSheetVisible]);

        const toggleSheetVisibility = () => {
                setIsSheetVisible(!isSheetVisible);
        };

        return (
                <Card sx={{ marginBottom: 2 }}>
                    <CardContent>
                        <Typography variant="body1">{content}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                            {fileData && (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{ marginRight: 1 }}
                                        startIcon={<GetApp />}
                                        href={fileData}
                                        download={`file.${fileType}`}
                                    >
                                        Download
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{ marginRight: 1 }}
                                        startIcon={isSheetVisible ? <VisibilityOff /> : <Visibility />}
                                        onClick={toggleSheetVisibility}
                                    >
                                        {isSheetVisible ? 'Hide file' : 'Show file'}
                                    </Button>
                                </>
                            )}
                        </Box>

                        {fileType === "musicxml" && isSheetVisible && (
                                <Box
                                        ref={osmdContainerRef}
                                        sx={{
                                        marginTop: 2,
                                        border: '1px solid #ccc',
                                        borderRadius: '5px',
                                        padding: 1,
                                        overflowX: 'auto',
                                        maxHeight: '1000px',
                                        }}
                                />
                        )}
                        {fileType === "pdf" && isSheetVisible && (
                                <iframe
                                        src={fileData}
                                        width="100%"
                                        height="1000px"
                                        title="PDF"
                                        style={{ marginTop: 10 }}
                                />
                        )}
                    </CardContent>
                </Card>
            );
};

export default function Posts() {
    const [events, setEvents] = useState<NDKEvent[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileData, setFileData] = useState<string | null>(null);
    const [newEventContent, setNewEventContent] = useState<string>("");

    const { subscribeAndHandle, publishEvent } = useNDK();

    useEffect(() => {
        const filter: NDKFilter = {
            kinds: [NDKKind.Text],
            "#t": ["music-relay-test"],
        };

        const handler = (event: NDKEvent) => {
            setEvents(prevEvents => [...prevEvents, event]);
        };

        subscribeAndHandle(filter, handler, { closeOnEose: true });
    }, []);

    const attachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setFileData(reader.result as string);
            };
            
            // Si c'est un fichier PDF, le lire comme Data URL
            if (file.type === "application/pdf") {
                reader.readAsDataURL(file); 
            } else {
                reader.readAsText(file); 
            }
        }
    };

    const createEvent = () => {
        const tags = [["t", "music-relay-test"]];
        if (fileData) {
            if (selectedFile?.type === "application/pdf") {
                tags.push(["pdf", fileData]);
            } else {
                tags.push(["musicxml", fileData]);
            }
        }
        publishEvent(NDKKind.Text, newEventContent, tags);
        setNewEventContent(""); // Clear the text field after posting
        setSelectedFile(null); // Clear the selected file
    };

    return (
        <>
            <Typography variant="h3" textAlign="center" marginTop={5}>Forum</Typography>

            <Box sx={{ margin: 10 }}>
                <Typography variant="h4">Create Event</Typography>
                <TextField
                    id="newEvent"
                    multiline
                    rows={5}
                    placeholder="Write something here"
                    variant="filled"
                    value={newEventContent}
                    onChange={(e) => setNewEventContent(e.target.value)}
                    sx={{ backgroundColor: "#fff", borderRadius: "5px", width: "100%", marginBottom: 5 }}
                />
                <input
                    accept=".xml,.musicxml,.pdf"
                    type="file"
                    onChange={attachFile}
                    style={{ display: 'none' }}
                    id="attach-file"
                />
                <Box display="flex" alignItems="center" marginBottom={2}>
                    <label htmlFor="attach-file">
                        <Button
                            variant="contained"
                            component="span"
                            startIcon={<AttachFile />}
                            sx={{
                                backgroundColor: "#1976d2",
                                color: "#fff",
                                borderRadius: "5px",
                                "&:hover": { backgroundColor: "#1565c0", color: "#fff" },
                                marginRight: 2
                            }}
                        >
                            {selectedFile ? selectedFile.name : "Attach File"}
                        </Button>
                    </label>
                    <Button
                        onClick={createEvent}
                        variant="contained"
                        color="primary"
                        startIcon={<Send />}
                        sx={{
                            borderRadius: "5px",
                            "&:hover": { backgroundColor: "#1565c0", color: "#fff" },
                        }}
                    >
                        Post
                    </Button>
                </Box>

                <Box sx={{ marginTop: 15 }}>
                    <Typography variant="h5" gutterBottom>Most Recent Events</Typography>
                    <List>
                        {events.slice().reverse().map((event, index) => (
                            <ListItem key={index} alignItems="flex-start">
                                <ListItemText
                                    primary={<ForumEvent event={event} />}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Box>
        </>
    );
}
