import { canConnectToRoom, getMessagesOfRoom, getUsersOfRoom, revokeGuess, submitGuess, userIsHost } from "api/http.js";
import { getUsername } from "localStorage/storage.js";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useNavigate, useParams } from "react-router-dom";
import { Slide, toast } from "react-toastify";

import defaultStreetViewPosition from "../constants/defaultStreetViewPosition.js";
import mapMarkSvg from "../constants/mapMarkSvg.js";
import {
    playGameFinishedNotification, playGameStartedNotification, playNewMessageNotification,
    playUserConnectedNotification, playUserDisconnectedNotification,
} from "../utils/sounds.js";
import waitForSocketConnection from "../utils/waitForSocketConnection.js";
import SidePane from "./components/SidePane.js";
import StreetViewWindow from "./components/StreetViewWindow.js";

export default function PlayScreen({ prevApiKeyRef }) {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [showLastRoundScore, setShowLastRoundScore] = useState(false);
    const [roomStatus, setRoomStatus] = useState("waiting");
    const streetViewRef = useRef(null);
    const [streetViewPosition, setStreetViewPosition] = useState(defaultStreetViewPosition);
    const streetViewInitialized = useRef(false);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const userGuessRef = useRef(null);
    const [submittedGuess, setSubmittedGuess] = useState(false);
    const submittedGuessRef = useRef(false);
    const polyLinesRef = useRef([]);
    const roomStatusRef = useRef("waiting");
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);
    const [showStartGameButton, setShowStartGameButton] = useState(false);
    const socketRef = useRef(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [connectionIsOk, setConnectionIsOk] = useState(false);

    async function mustShowStartGameButton(roomId) {
        return (roomStatus === "waiting") && await userIsHost(roomId);
    }

    function handleTabClosing() {
        console.log("Tab is closing...");
        const payload = {
            type: "userDisconnected",
            payload: {
                username: localStorage.getItem("username"),
                avatarEmoji: localStorage.getItem("selectedEmoji") || "",
            },
        }
        socketRef.current.send(JSON.stringify(payload));
        console.log("Closing WebSocket connection...");
        socketRef.current.close();
    }

    useEffect(() => {
        window.addEventListener("beforeunload", handleTabClosing);
        const switchBtnVisibility = async () => {
            setShowStartGameButton(await mustShowStartGameButton(id));
        };
        switchBtnVisibility();
        if (localStorage.getItem("apiKeyStrategy") !== "useMyOwn") {
            return;
        }
        if (localStorage.getItem("apiKey") === null) {
            return;
        }
        if (localStorage.getItem("apiKey") === "") {
            return;
        }
        toast("Спасибо за использование собственного АПИ ключа! ❤️ ", {
            position: "bottom-left",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Slide,
        });
        return () => {
            // TODO: is this OK that we don't return this in guards?
            window.removeEventListener("unload", handleTabClosing);
        }
    }, []);

    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        const switchBtnVisibility = async () => {
            setShowStartGameButton(await mustShowStartGameButton(id));
        };
        switchBtnVisibility();
        if (mapRef.current) {
            markersRef.current.forEach((marker) => {
                marker.setMap(null);
            });
            polyLinesRef.current.forEach((polyLine) => {
                polyLine.setMap(null);
            });
            markersRef.current = [];
            polyLinesRef.current = [];
            const svgMarker = {
                path: mapMarkSvg,
                fillColor: "#0070F0",
                fillOpacity: 1,
                strokeWeight: 0,
                rotation: 0,
                scale: 2,
                anchor: new window.google.maps.Point(0, 19),
                labelOrigin: new window.google.maps.Point(0, 7),
            };
            if (roomStatus === "waiting") {
                users.forEach(user => {
                    if (user.lastGuess) {
                        markersRef.current.push(
                            new window.google.maps.Marker({
                                position: {
                                    lat: user.lastGuess.lat,
                                    lng: user.lastGuess.lng,
                                },
                                map: mapRef.current,
                                label: user.avatarEmoji || user.name.slice(0, 3),
                                icon: svgMarker,
                                username: user.name,
                            }))
                    }
                });
                if (userGuessRef.current !== null) {
                    userGuessRef.current.setMap(null);
                }
                userGuessRef.current = null;
                markersRef.current.push(
                    new window.google.maps.Marker({
                        position: streetViewPosition,
                        map: mapRef.current,
                        label: "🏠",
                        icon: svgMarker,
                        username: "host",
                    })
                );
                markersRef.current.forEach((marker) => {
                    polyLinesRef.current.push(
                        new window.google.maps.Polyline({
                            path: [streetViewPosition, marker.position],
                            geodesic: true,
                            strokeColor: "#0070F0",
                            strokeOpacity: 1.0,
                            strokeWeight: 2,
                            map: mapRef.current,
                        })
                    );
                });
            }
        }
    }, [users, roomStatus]);

    useEffect(() => {
        fetchUsers(20);
        if (mapRef.current) {
            mapRef.current.setCenter({ lat: 0.0, lng: 0.0 });
            mapRef.current.setZoom(1);
        }
    }, [roomStatus]);

    useEffect(() => {
        if (streetViewRef.current) {
            if (!streetViewInitialized.current) {
                const newPosition = new window.google.maps.LatLng(streetViewPosition);
                streetViewRef.current.setPosition(newPosition);
                streetViewInitialized.current = true;
                return;
            }
            if (roomStatus === "playing") {
                const newPosition = new window.google.maps.LatLng(streetViewPosition);
                streetViewRef.current.setPosition(newPosition);
            }
        }
    }, [streetViewPosition]);

    function handleStartGame() {
        if (roomStatus === "playing") {
            return;
        }
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
        }
        setSubmittedGuess(false);
        submittedGuessRef.current = false;
        setRoomStatus("playing");
        roomStatusRef.current = "playing";
        setProgress(100);
        const payload = { type: "gameStarted", payload: null };
        socketRef.current.send(JSON.stringify(payload));
        playGameStartedNotification();
        intervalRef.current = setInterval(() => {
            setProgress(prevProgress => {
                if (prevProgress === 1) {
                    if (userGuessRef.current !== null) {
                        const lat = userGuessRef.current.position.lat().toString();
                        const lng = userGuessRef.current.position.lng().toString();
                        submitGuess(lat, lng, id);
                    } else {
                        console.error("User marker not found.");
                        // TODO: show error
                    }
                }
                if (prevProgress === 0) {
                    clearInterval(intervalRef.current);
                    setRoomStatus("waiting");
                    roomStatusRef.current = "waiting";
                    // const payload = { type: "gameFinished", payload: null };
                    // socketRef.current.send(JSON.stringify(payload));
                    playGameFinishedNotification();
                    return 0;
                }
                return prevProgress - 1;
            });
        }, 1000);
    }

    const fetchUsers = async (retryCount) => {
        const usersResp = await getUsersOfRoom(id);
        // TODO: is it ok to compare by name? Maybe I should compare by some kind of public id?
        // At least I must ensure that the username is unique per room.
        const roomHasCurrentUser = usersResp.users.find(user => user.name === getUsername());
        if (roomHasCurrentUser) {
            setUsers(usersResp.users.map(user => ({
                name: user.name,
                avatarEmoji: user.avatarEmoji,
                score: user.score,
                isHost: user.isHost,
                description: user.description,
                lastGuess: user.lastGuess,
                submittedGuess: user.submittedGuess,
                lastRoundScore: user.lastRoundScore,
            })));
            if (usersResp.status.type === "playing") {
                setStreetViewPosition(usersResp.status.currentLocation);
                setRoomStatus("playing");
                roomStatusRef.current = "playing";
            } else if (usersResp.status.type === "waiting") {
                setStreetViewPosition(usersResp.status.previousLocation);
                setRoomStatus("waiting");
                roomStatusRef.current = "waiting";
            }
        } else if (retryCount > 0) {
            setTimeout(async () => await fetchUsers(retryCount - 1), 500);
        }
    };

    function connectToSocket(isReconnect) {
        socketRef.current = new WebSocket(`${process.env.REACT_APP_WS_SERVER_ORIGIN}/chat/${id}?user_id=${localStorage.getItem("userId")}`);
        socketRef.current.onopen = () => {
            console.log("WebSocket connection established.");
            setConnectionIsOk(true);
            if (isReconnect) {
                const payload = {
                    type: "userReConnected",
                    payload: {
                        username: localStorage.getItem("username"),
                        avatarEmoji: localStorage.getItem("selectedEmoji"),
                    },
                }
                socketRef.current.send(JSON.stringify(payload));
            }
        };
        socketRef.current.onclose = () => {
            console.log("WebSocket connection closed.");
            console.log("Current URL path:", window.location.pathname);
            setConnectionIsOk(false);
            if (window.location.pathname === `/room/${id}`) {
                console.log("Reconnecting to WebSocket in 1 second.");
                setTimeout(() => connectToSocket(true), 1000);
            }
        };
        socketRef.current.onerror = (error) => {
            console.error("WebSocket error: ", error);
            console.log("Closing WebSocket connection...");
            socketRef.current.close();
            setConnectionIsOk(false);
            if (window.location.pathname === `/room/${id}`) {
                console.log("Reconnecting to WebSocket in 1 second.");
                setTimeout(() => connectToSocket(true), 1000);
            }
        }
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
                    const usersResp = await getUsersOfRoom(id);
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
                    break;
                }
                case "userDisconnected": {
                    playUserDisconnectedNotification();
                    const usersResp = await getUsersOfRoom(id);
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
                    break;
                }
                case "gameStarted": {
                    setRoomStatus("playing");
                    roomStatusRef.current = "playing";
                    setSubmittedGuess(false);
                    submittedGuessRef.current = false;
                    setProgress(100);
                    playGameStartedNotification();
                    intervalRef.current = setInterval(() => {
                        setProgress(prevProgress => {
                            if (prevProgress === 1) {
                                if (userGuessRef.current !== null) {
                                    const lat = userGuessRef.current.position.lat().toString();
                                    const lng = userGuessRef.current.position.lng().toString();
                                    submitGuess(lat, lng, id);
                                } else {
                                    console.error("User marker not found.");
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
                    setSubmittedGuess(false);
                    submittedGuessRef.current = false;
                    setProgress(0);
                    playGameFinishedNotification();
                    fetchUsers(20);
                    setShowLastRoundScore(true);
                    setSubmittedGuess(false);
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
                            submitGuess(lat, lng, id);
                        } else {
                            console.error("User marker not found.");
                            // TODO: show error
                        }
                    }
                    break;
                case "guessSubmitted": {
                    const usersResp = await getUsersOfRoom(id);
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
                    break;
                }
                case "guessRevoked": {
                    const usersResp = await getUsersOfRoom(id);
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
                    break;
                }
                default:
                    console.error(`Unknown message type: ${message.type}`);
            }
        };
        return setInterval(() => {
            socketRef.current.send(JSON.stringify({ type: "ping", payload: null }));
        }, 5 * 1000);
    }

    useEffect(() => {
        const username = localStorage.getItem("username");
        if (!username) {
            navigate("/", { state: { roomId: id } });
            toast.error("Установи юзернейм чтобы подключиться к комнате", {
                position: "bottom-left",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Slide,
            });
            return;
        }
        const fetchData = async () => {
            const canConnectResp = await canConnectToRoom(id);
            if (!canConnectResp.canConnect) {
                let errMsg = "";
                switch (canConnectResp.reason) {
                    case "Room not found.":
                        errMsg = "Такая комната не найдена";
                        break;
                    case "Such user already in the room.":
                        errMsg = "Кто-то с таким именем уже есть в комнате";
                        break;
                    case "The username is too long.":
                        errMsg = "Говорят что твой юзернейм слишком длинный, попробуй покороче.";
                        break;
                    default:
                        errMsg = "Ой, почему-то не получилось подключиться к комнате";
                }
                navigate("/");
                toast.error(errMsg, {
                    position: "bottom-left",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Slide,
                });
            }
            const messagesResp = await getMessagesOfRoom(id);
            setMessages(messagesResp.messages.map(message => {
                return {
                    id: 1,
                    author: message.from === getUsername() ? "я" : message.from,
                    content: message.content,
                }
            }));
        };
        fetchData();

        const pingInterval = connectToSocket(false);

        setTimeout(() => {
            const payload = {
                type: "userConnected",
                payload: {
                    username: localStorage.getItem("username"),
                    avatarEmoji: localStorage.getItem("selectedEmoji") || "",
                },
            }
            waitForSocketConnection(socketRef.current, () => {
                socketRef.current.send(JSON.stringify(payload));
            });

            fetchUsers(20);
        }, 500);

        return () => {
            const payload = {
                type: "userDisconnected",
                payload: {
                    username: localStorage.getItem("username"),
                    avatarEmoji: localStorage.getItem("selectedEmoji") || "",
                },
            }
            socketRef.current.send(JSON.stringify(payload));
            console.log("Closing WebSocket connection...");
            socketRef.current.close();
            console.log("Clearing ping interval...");
            clearInterval(pingInterval);
        };
    }, [navigate, id]);

    function handleConfirmAnswer() {
        console.log("submittedGuess[handleConfirmAnswer]: ", submittedGuess);
        if (userGuessRef.current === null) {
            console.error("User marker not found.");
        }
        const lat = userGuessRef.current.position.lat().toString();
        const lng = userGuessRef.current.position.lng().toString();
        submitGuess(lat, lng, id);
        setSubmittedGuess(true);
        submittedGuessRef.current = true;
    }

    function handleRevokeAnswer() {
        console.log("submittedGuess[handleConfirmAnswer]: ", submittedGuess);
        revokeGuess(id);
        setSubmittedGuess(false);
        submittedGuessRef.current = false;
    }

    return (
        <div id="playScreen" style={{ height: "100vh", display: "flex", flexDirection: "row" }}>
            <PanelGroup autoSaveId="persistence" direction="horizontal">
                <Panel minSize={50}>
                    <StreetViewWindow
                        prevApiKeyRef={prevApiKeyRef}
                        showStartGameButton={showStartGameButton}
                        handleStartGame={handleStartGame}
                        progress={progress}
                        mapRef={mapRef}
                        roomStatusRef={roomStatusRef}
                        streetViewRef={streetViewRef}
                        userGuessRef={userGuessRef}
                        handleConfirmAnswer={handleConfirmAnswer}
                        handleRevokeAnswer={handleRevokeAnswer}
                        submittedGuessRef={submittedGuessRef}
                    />
                </Panel>
                <PanelResizeHandle style={{ width: "1px", backgroundColor: "gray" }} />
                <Panel defaultSize={30} minSize={10}>
                    <SidePane
                        socketRef={socketRef}
                        messages={messages}
                        setMessages={setMessages}
                        users={users}
                        connectionIsOk={connectionIsOk}
                        showLastRoundScore={showLastRoundScore}
                    />
                </Panel>
            </PanelGroup>
        </div >
    );
}
