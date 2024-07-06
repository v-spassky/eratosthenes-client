import { getUsersOfRoom, submitGuess } from "api/http.js";
import socketConnWaitRetryPeriodMs from "constants/socketConnWaitRetryPeriod.js";
import { getSelectedEmoji, getUserId, getUsername } from "localStorage/storage.js";
import { showBannedFromRoomNotification } from "notifications/all.js";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    playNewMessageNotification, playRoundFinishedNotification, playRoundStartedNotification,
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
        userGuessRef, roomStatusRef, submittedGuessRef, intervalRef, openGameFinishedModal,
    }
) {
    const socketRef = useRef(null);
    const [connectionIsOk, setConnectionIsOk] = useState(false);
    const navigate = useNavigate();

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
                isMuted: user.isMuted,
            };
        }));
    }

    useEffect(() => {
        const pingInterval = connectToSocket(false);

        setTimeout(() => {
            const payload = {
                type: "userConnected",
                payload: { username: getUsername(), avatarEmoji: getSelectedEmoji() || "" },
            };
            waitForSocketConnection(socketRef.current, () => { sendMessage(payload); });
            refreshRoomUsersAndStatus(20);
        }, 500);

        return () => {
            const payload = {
                type: "userDisconnected",
                payload: { username: getUsername(), avatarEmoji: getSelectedEmoji() || "" },
            };
            sendMessage(payload);
            closeSocket();
            console.log("[WS]: clearing ping interval...");
            clearInterval(pingInterval);
        };
    }, []);

    function connectToSocket(isReconnect) {
        socketRef.current = new WebSocket(
            `${process.env.REACT_APP_WS_SERVER_ORIGIN}/chat/${roomId}?user_id=${getUserId()}`
        );
        socketRef.current.onopen = () => {
            console.log("[WS]: websocket connection established.");
            setConnectionIsOk(true);
            if (isReconnect) {
                const payload = {
                    type: "userReConnected",
                    payload: { username: getUsername(), avatarEmoji: getSelectedEmoji() },
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
                    if (!message.payload.isFromBot) {
                        playNewMessageNotification();
                    }
                    setMessages(
                        messages => [
                            ...messages,
                            {
                                id: 1,
                                author: message.payload.from,
                                content: message.payload.content,
                                isFromBot: message.payload.isFromBot,
                            },
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
                case "roundStarted": {
                    setRoomStatus("playing");
                    roomStatusRef.current = "playing";
                    submittedGuessRef.current = false;
                    setProgress(100);
                    playRoundStartedNotification();
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
                    openGameFinishedModal();
                }
                // `gameFinished` event is the same as `roundFinished` event plus some extra logic
                // eslint-disable-next-line no-fallthrough
                case "roundFinished": {
                    clearInterval(intervalRef.current);
                    setRoomStatus("waiting");
                    roomStatusRef.current = "waiting";
                    submittedGuessRef.current = false;
                    setProgress(0);
                    playRoundFinishedNotification();
                    refreshRoomUsersAndStatus(20);
                    setShowLastRoundScore(true);
                    setTimeout(() => setShowLastRoundScore(false), 10000);
                    break;
                }
                case "guessSubmitted": {
                    await fetchAndSetUsers(roomId);
                    break;
                }
                case "guessRevoked": {
                    await fetchAndSetUsers(roomId);
                    break;
                }
                case "userMuted": {
                    await fetchAndSetUsers(roomId);
                    break;
                }
                case "userUnmuted": {
                    await fetchAndSetUsers(roomId);
                    break;
                }
                case "userBanned": {
                    if (message.payload.username === getUsername()) {
                        showBannedFromRoomNotification();
                        navigate("/");
                    }
                    await fetchAndSetUsers(roomId);
                    break;
                }
                case "userScoreChanged": {
                    await fetchAndSetUsers(roomId);
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
                default:
                    console.error(`[WS]: unknown message type: ${message.type}`);
            }
        };
        return setInterval(() => { sendMessage({ type: "ping", payload: null }); }, 5 * 1000);
    }

    function sendMessage(message) {
        const messageAsStr = JSON.stringify(message);
        if (socketRef.current === null) {
            console.error(`[WS]: tried to send message ${messageAsStr} while socketRef.current === null`);
            return;
        }
        if (socketRef.current.readyState !== 1) {
            console.error(`[WS]: tried to send message ${messageAsStr} while socketRef.current.readyState !== 1`);
            return;
        }
        socketRef.current.send(messageAsStr);
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
