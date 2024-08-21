"use client";

import { useEffect, useState, useRef } from "react";
import { useNDK } from "@/hooks/useNDK";
import { NDKEvent, NDKFilter, NDKKind } from "@nostr-dev-kit/ndk";
import { Box, Button, Card, CardContent, Typography, TextField, List, ListItem, Avatar, CircularProgress } from "@mui/material";
import { AttachFile, Send, GetApp, VisibilityOff, Visibility } from "@mui/icons-material";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

const ForumEvent = ({ event, author, comments, onCommentSubmit }) => {
    const rawEvent = event.rawEvent();
    const content = rawEvent.content;

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

    const [commentContent, setCommentContent] = useState<string>("");

    const handleCommentSubmit = () => {
        if (commentContent.trim()) {
            onCommentSubmit(event.id, commentContent);
            setCommentContent(""); // Clear the comment field after submission
        }
    };

    return (
        <Card sx={{ marginBottom: 2, maxWidth: '800px', width: '100%' }}>
            <CardContent>
                {author && (
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                        <Avatar src={author.image} alt={author.name} sx={{ marginRight: 2 }}>
                            {!author.image && author.name[0]}
                        </Avatar>
                        <Typography variant="h6">{author.name}</Typography>
                    </Box>
                )}
                <Typography variant="body1">{content}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                    {fileData && (
                        <>
                            <Button
                                variant="contained"
                                color="secondary"
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
                            maxWidth: '100%',
                        }}
                    />
                )}
                {fileType === "pdf" && isSheetVisible && (
                    <iframe
                        src={fileData}
                        width="100%"
                        height="1000px"
                        title="PDF"
                        style={{ marginTop: 10, maxWidth: '100%' }}
                    />
                )}

                <Box sx={{ marginTop: 3 }}>
                    <Typography variant="h6">Comments:</Typography>
                    <List>
                        {comments.map((comment) => (
                            <ListItem key={comment.id} sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Avatar src={comment.author?.image} alt={comment.author?.name} sx={{ marginRight: 2 }}>
                                        {!comment.author?.image && comment.author?.name[0]}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {comment.author?.name}
                                        </Typography>
                                        <Typography variant="body2">{comment.content}</Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                    <TextField
                        placeholder="Write a comment..."
                        variant="outlined"
                        fullWidth
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleCommentSubmit();
                            }
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

const Posts = () => {
    const [events, setEvents] = useState<NDKEvent[]>([]);
    const [userProfiles, setUserProfiles] = useState<{ [pubkey: string]: { name: string; image?: string } | null }>({});
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileData, setFileData] = useState<string | null>(null);
    const [newEventContent, setNewEventContent] = useState<string>("");
    const [comments, setComments] = useState<{ [eventId: string]: { id: string; content: string; author: { name: string; image?: string } | null }[] }>({});

    const { subscribeAndHandle, publishEvent, fetchUserProfile } = useNDK();

    useEffect(() => {
        const fetchData = async () => {
            const filter: NDKFilter = {
                kinds: [NDKKind.Text],
                "#t": ["music-relay-test"],
            };

            const handler = async (event: NDKEvent) => {
                const eventId = event.id;

                // Update events
                setEvents(prevEvents => {
                    const existingEvent = prevEvents.find(e => e.id === eventId);
                    if (existingEvent) {
                        return prevEvents.map(e => (e.id === eventId ? event : e));
                    } else {
                        return [...prevEvents, event];
                    }
                });

                // Fetch user profile for event author
                const npub = event.author?.npub;
                if (npub && !userProfiles[npub]) {
                    const userProfile = await fetchUserProfile(npub);
                    setUserProfiles(prevProfiles => ({
                        ...prevProfiles,
                        [npub]: userProfile,
                    }));
                }

                // Fetch comments for this event
                fetchCommentsForEvent(eventId);
            };

            subscribeAndHandle(filter, handler, { closeOnEose: true });
            setLoading(false);
        };

        fetchData();
    }, [userProfiles]);

    useEffect(() => {
        events.forEach(event => fetchCommentsForEvent(event.id));
    }, [events]);

    const fetchCommentsForEvent = (eventId: string) => {
        const filter: NDKFilter = {
            kinds: [NDKKind.Text],
            "#e": [eventId],  // Fetch comments linked to the event
        };

        subscribeAndHandle(filter, async (commentEvent) => {
            const commentAuthorNpub = commentEvent.author?.npub;
            const commentAuthorProfile = commentAuthorNpub ? await fetchUserProfile(commentAuthorNpub) : null;

            setComments(prevComments => {
                const existingComments = prevComments[eventId] || [];
                // Ensure no duplicate comments are added
                if (existingComments.some(c => c.id === commentEvent.id)) {
                    return prevComments; // No need to add duplicate comment
                }
                return { ...prevComments, [eventId]: [...existingComments, { id: commentEvent.id, content: commentEvent.content, author: commentAuthorProfile }] };
            });
        });
    };

    const attachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setFileData(reader.result as string);
            };

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
        setNewEventContent("");
        setSelectedFile(null);
    };

    const handleCommentSubmit = (eventId: string, content: string) => {
        const tags = [["e", eventId]];  // Tag comment with event ID
        publishEvent(NDKKind.Text, content, tags);
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
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List>
                            {events.slice().reverse().map((event, index) => (
                                <ListItem key={index} alignItems="flex-start">
                                    <ForumEvent
                                        event={event}
                                        author={userProfiles[event.author?.npub || ""]}
                                        comments={comments[event.id] || []} // Pass the comment list
                                        onCommentSubmit={handleCommentSubmit}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>
        </>
    );
};

export default Posts;
