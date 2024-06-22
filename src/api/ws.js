import { getUsersOfRoom, submitGuess } from "api/http.js";
import socketConnWaitRetryPeriodMs from "constants/socketConnWaitRetryPeriod.js";
import { useEffect, useRef, useState } from "react";
import {
    playGameFinishedNotification, playGameStartedNotification, playNewMessageNotification,
    playUserConnectedNotification, playUserDisconnectedNotification,
} from "utils/sounds.js";


function waitForSocketConnection(socket, callback) {
    setTimeout(() => {
        if (socket.readyState === 1) {
            if (callback != null) {
                callback();
            }
        } else {
            waitForSocketConnection(socket, callback);
        }
    }, socketConnWaitRetryPeriodMs);
}

export default function useRoomSocket(
    {
        roomId, refreshRoomUsersAndStatus, setMessages, setUsers, setRoomStatus, setProgress, setShowLastRoundScore,
        userGuessRef, roomStatusRef, submittedGuessRef, intervalRef,
    }
) {
    const socketRef = useRef(null);
    const [connectionIsOk, setConnectionIsOk] = useState(false);

    async function fetchAndSetUsers(roomId) {
        const usersResp = await getUsersOfRoom(roomId);
        setUsers(usersResp.users.map(user => {
            return {
                name: user.name,
                avatarEmoji: user.avatarEmoji,
                score: user.score,
                isHost: user.isHost,
                description: user.description,
                lastGuess: user.lastGuess,
                submittedGuess: user.submittedGuess,
                lastRoundScore: user.lastRoundScore,
            };
        }));
    }

    useEffect(() => {
        const pingInterval = connectToSocket(false);

        setTimeout(() => {
            const payload = {
                type: "userConnected",
                payload: {
                    username: localStorage.getItem("username"),
                    avatarEmoji: localStorage.getItem("selectedEmoji") || "",
                },
            };
            waitForSocketConnection(socketRef.current, () => { sendMessage(payload); });
            refreshRoomUsersAndStatus(20);
        }, 500);

        return () => {
            const payload = {
                type: "userDisconnected",
                payload: {
                    username: localStorage.getItem("username"),
                    avatarEmoji: localStorage.getItem("selectedEmoji") || "",
                },
            };
            sendMessage(payload);
            closeSocket();
            console.log("[WS]: clearing ping interval...");
            clearInterval(pingInterval);
        };
    }, []);

    function connectToSocket(isReconnect) {
        socketRef.current = new WebSocket(
            `${process.env.REACT_APP_WS_SERVER_ORIGIN}/chat/${roomId}?user_id=${localStorage.getItem("userId")}`
        );
        socketRef.current.onopen = () => {
            console.log("[WS]: websocket connection established.");
            setConnectionIsOk(true);
            if (isReconnect) {
                const payload = {
                    type: "userReConnected",
                    payload: {
                        username: localStorage.getItem("username"),
                        avatarEmoji: localStorage.getItem("selectedEmoji"),
                    },
                };
                sendMessage(payload);
            }
        };
        socketRef.current.onclose = () => {
            console.log("[WS]: websocket connection closed.");
            console.log(`[navigation]: current URL path: ${window.location.pathname}`);
            setConnectionIsOk(false);
            if (window.location.pathname === `/room/${roomId}`) {
                console.log("[WS]: reconnecting websocket in 1 second.");
                setTimeout(() => connectToSocket(true), 1000);
            }
        };
        socketRef.current.onerror = (error) => {
            console.error(`[WS]: websocket error: ${JSON.stringify(error)}`);
            console.log("[WS]: closing websocket connection...");
            closeSocket();
            setConnectionIsOk(false);
            if (window.location.pathname === `/room/${roomId}`) {
                console.log("[WS]: reconnecting websocket in 1 second.");
                setTimeout(() => connectToSocket(true), 1000);
            }
        };
        socketRef.current.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case "chatMessage": {
                    playNewMessageNotification();
                    setMessages(
                        messages => [
                            ...messages, { id: 1, author: message.payload.from, content: message.payload.content }
                        ]
                    );
                    break;
                }
                case "userConnected": {
                    playUserConnectedNotification();
                    await fetchAndSetUsers(roomId);
                    break;
                }
                case "userDisconnected": {
                    playUserDisconnectedNotification();
                    await fetchAndSetUsers(roomId);
                    break;
                }
                case "gameStarted": {
                    setRoomStatus("playing");
                    roomStatusRef.current = "playing";
                    submittedGuessRef.current = false;
                    setProgress(100);
                    playGameStartedNotification();
                    intervalRef.current = setInterval(() => {
                        setProgress(prevProgress => {
                            if (prevProgress === 1) {
                                if (userGuessRef.current !== null) {
                                    const lat = userGuessRef.current.position.lat().toString();
                                    const lng = userGuessRef.current.position.lng().toString();
                                    submitGuess(lat, lng, roomId);
                                } else {
                                    console.error("[map]: user marker not found.");
                                    // TODO: show error
                                }
                            }
                            if (prevProgress === 0) {
                                clearInterval(intervalRef.current);
                                setRoomStatus("waiting");
                                roomStatusRef.current = "waiting";
                                return 0;
                            }
                            return prevProgress - 1;
                        });
                    }, 1000);
                    break;
                }
                case "gameFinished": {
                    clearInterval(intervalRef.current);
                    setRoomStatus("waiting");
                    roomStatusRef.current = "waiting";
                    submittedGuessRef.current = false;
                    setProgress(0);
                    playGameFinishedNotification();
                    refreshRoomUsersAndStatus(20);
                    setShowLastRoundScore(true);
                    setTimeout(() => setShowLastRoundScore(false), 10000);
                    break;
                }
                case "ping":
                    break;
                case "pong":
                    break;
                case "tick":
                    setProgress(message.payload);
                    if (message.payload === 1) {
                        if (userGuessRef.current !== null) {
                            const lat = userGuessRef.current.position.lat().toString();
                            const lng = userGuessRef.current.position.lng().toString();
                            submitGuess(lat, lng, roomId);
                        } else {
                            console.error("[map]: user marker not found.");
                            // TODO: show error
                        }
                    }
                    break;
                case "guessSubmitted": {
                    await fetchAndSetUsers(roomId);
                    break;
                }
                case "guessRevoked": {
                    await fetchAndSetUsers(roomId);
                    break;
                }
                default:
                    console.error(`[WS]: unknown message type: ${message.type}`);
            }
        };
        return setInterval(() => { sendMessage({ type: "ping", payload: null }); }, 5 * 1000);
    }

    function sendMessage(message) {
        if (socketRef.current === null) {
            console.error(`[WS]: tried to send message ${message} while socketRef.current === null`);
            return;
        }
        if (socketRef.current.readyState !== 1) {
            console.error(`[WS]: tried to send message ${message} while socketRef.current.readyState !== 1`);
            return;
        }
        socketRef.current.send(JSON.stringify(message));
    }

    function closeSocket() {
        if (socketRef.current === null) {
            console.error("[WS]: tried to close the socket while socketRef.current === null");
            return;
        }
        console.log("[WS]: closing websocket connection...");
        socketRef.current.close();
    }

    return { connectionIsOk, sendMessage, closeSocket };
}
