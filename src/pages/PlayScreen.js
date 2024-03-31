import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useNavigate, useParams } from "react-router-dom";
import { Slide, toast } from "react-toastify";

import userIsHost from "../api/userIsHost.js";
import defaultStreetViewPosition from "../constants/defaultStreetViewPosition.js";
import mapMarkSvg from "../constants/mapMarkSvg.js";
import waitForSocketConnection from "../utils/waitForSocketConnection.js";
import SidePane from "./components/SidePane.js";
import StreetViewWindow from "./components/StreetViewWindow.js";

export default function PlayScreen({ prevApiKeyRef }) {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [roomStatus, setRoomStatus] = useState("waiting");
    const streetViewRef = useRef(null);
    const [streetViewPosition, setStreetViewPosition] = useState(defaultStreetViewPosition);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const polyLinesRef = useRef([]);
    const roomStatusRef = useRef("waiting");
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);
    const [showStartGameButton, setShowStartGameButton] = useState(false);
    const socketRef = useRef(null);
    const { id } = useParams();
    const navigate = useNavigate();

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
            const svgMarker = {
                path: mapMarkSvg,
                fillColor: "#0070F0",
                fillOpacity: 1,
                strokeWeight: 0,
                rotation: 0,
                scale: 2,
                anchor: new window.google.maps.Point(0, 20),
                labelOrigin: new window.google.maps.Point(0, 7),
            };
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
            if (roomStatus === "waiting") {
                mapRef.current.setCenter({ lat: 0.0, lng: 0.0 });
                mapRef.current.setZoom(1);
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
    }, [roomStatus]);

    useEffect(() => {
        if (streetViewRef.current) {
            const newPosition = new window.google.maps.LatLng(streetViewPosition);
            streetViewRef.current.setPosition(newPosition);
        }
    }, [streetViewPosition]);

    function handleStartGame() {
        if (roomStatus === "playing") {
            return;
        }
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
        }
        setRoomStatus("playing");
        roomStatusRef.current = "playing";
        setProgress(100);
        const payload = { type: "gameStarted", payload: null };
        socketRef.current.send(JSON.stringify(payload));
        const gameStartedNotification = new Audio("game_started_notification.wav");
        gameStartedNotification.play();
        intervalRef.current = setInterval(() => {
            setProgress(prevProgress => {
                if (prevProgress === 1) {
                    const username = localStorage.getItem("username");
                    let found = false;
                    let markerToSubmit = null;
                    markersRef.current.forEach((marker) => {
                        if (marker.username === username) {
                            found = true;
                            markerToSubmit = marker;
                        }
                    });
                    if (found) {
                        const payload = {
                            username: username,
                            lat: markerToSubmit.position.lat().toString(),
                            lng: markerToSubmit.position.lng().toString(),
                        }
                        const submitGuess = async () => {
                            await fetch(
                                `${process.env.REACT_APP_SERVER_ORIGIN}/submit-guess/${id}`,
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload),
                                }
                            );
                        }
                        submitGuess();
                    } else {
                        console.error("User marker not found.");
                        // TODO: show error
                    }
                }
                if (prevProgress === 0) {
                    clearInterval(intervalRef.current);
                    setRoomStatus("waiting");
                    roomStatusRef.current = "waiting";
                    const payload = { type: "gameFinished", payload: null };
                    socketRef.current.send(JSON.stringify(payload));
                    const gameFinishedNotification = new Audio("game_finished_notification.wav");
                    gameFinishedNotification.play();
                    return 0;
                }
                return prevProgress - 1;
            });
        }, 1000);
    }

    const fetchUsers = (retryCount) => {
        fetch(`${process.env.REACT_APP_SERVER_ORIGIN}/users-of-room/${id}`)
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    const roomHasCurrentUser = data.users.find(user => user.name === localStorage.getItem("username"));
                    if (roomHasCurrentUser) {
                        setUsers(data.users.map(user => ({
                            name: user.name,
                            avatarEmoji: user.avatarEmoji,
                            score: user.score,
                            isHost: user.isHost,
                            description: user.description,
                            lastGuess: user.lastGuess,
                        })));
                        if (data.status.type === "playing") {
                            setStreetViewPosition(data.status.currentLocation);
                        }
                    } else if (retryCount > 0) {
                        setTimeout(() => fetchUsers(retryCount - 1), 500);
                    }
                }
            })
            .catch(error => {
                console.error("Error fetching users:", error);
            });
    };

    function connectToSocket(isReconnect) {
        socketRef.current = new WebSocket(`${process.env.REACT_APP_WS_SERVER_ORIGIN}/chat/${id}`);
        socketRef.current.onopen = () => {
            console.log("WebSocket connection established.");
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
            if (window.location.pathname === `/room/${id}`) {
                console.log("Reconnecting to WebSocket in 1 second.");
                setTimeout(() => connectToSocket(true), 1000);
            }
        };
        socketRef.current.onerror = (error) => {
            console.error("WebSocket error: ", error);
            console.log("Closing WebSocket connection...");
            socketRef.current.close();
            if (window.location.pathname === `/room/${id}`) {
                console.log("Reconnecting to WebSocket in 1 second.");
                setTimeout(() => connectToSocket(true), 1000);
            }
        }
        socketRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case "chatMessage": {
                    const newMessageSound = new Audio("new_message_notification.wav");
                    newMessageSound.play();
                    setMessages(
                        messages => [
                            ...messages, { id: 1, author: message.payload.from, content: message.payload.content }
                        ]
                    );
                    break;
                }
                case "userConnected": {
                    fetch(`${process.env.REACT_APP_SERVER_ORIGIN}/users-of-room/${id}`)
                        .then(response => response.json())
                        .then(data => {
                            if (!data.error) {
                                const userConnectedSound = new Audio("user_connected_notification.wav");
                                userConnectedSound.play();
                                setUsers(data.users.map(user => {
                                    return {
                                        name: user.name,
                                        avatarEmoji: user.avatarEmoji,
                                        score: user.score,
                                        isHost: user.isHost,
                                        description: user.description,
                                        lastGuess: user.lastGuess,
                                    };
                                }));
                                if (data.status.type === "playing") {
                                    setStreetViewPosition(data.status.currentLocation);
                                }
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching users:", error);
                        });
                    break;
                }
                case "userDisconnected": {
                    fetch(`${process.env.REACT_APP_SERVER_ORIGIN}/users-of-room/${id}`)
                        .then(response => response.json())
                        .then(data => {
                            if (!data.error) {
                                const userDisconnectedSound = new Audio("user_disconnected_notification.wav");
                                userDisconnectedSound.play();
                                setUsers(data.users.map(user => {
                                    return {
                                        name: user.name,
                                        avatarEmoji: user.avatarEmoji,
                                        score: user.score,
                                        isHost: user.isHost,
                                        description: user.description,
                                        lastGuess: user.lastGuess,
                                    };
                                }));
                                if (data.status.type === "playing") {
                                    setStreetViewPosition(data.status.currentLocation);
                                }
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching users:", error);
                        });
                    break;
                }
                case "gameStarted": {
                    setRoomStatus("playing");
                    roomStatusRef.current = "playing";
                    setProgress(100);
                    const gameStartedNotification = new Audio("game_started_notification.wav");
                    gameStartedNotification.play();
                    intervalRef.current = setInterval(() => {
                        setProgress(prevProgress => {
                            if (prevProgress === 1) {
                                const username = localStorage.getItem("username");
                                let found = false;
                                let markerToSubmit = null;
                                markersRef.current.forEach((marker) => {
                                    if (marker.username === username) {
                                        found = true;
                                        markerToSubmit = marker;
                                    }
                                });
                                if (found) {
                                    const payload = {
                                        username: username,
                                        lat: markerToSubmit.position.lat().toString(),
                                        lng: markerToSubmit.position.lng().toString(),
                                    }
                                    const submitGuess = async () => {
                                        await fetch(
                                            `${process.env.REACT_APP_SERVER_ORIGIN}/submit-guess/${id}`,
                                            {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify(payload),
                                            }
                                        );
                                    }
                                    submitGuess();
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
                    setProgress(0);
                    const gameFinishedNotification = new Audio("game_finished_notification.wav");
                    gameFinishedNotification.play();
                    fetchUsers(20);
                    break;
                }
                case "ping":
                    break;
                case "pong":
                    break;
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
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_SERVER_ORIGIN}/can-connect/${id}?username=${username}`,
                    { method: "GET" },
                );
                if (response.ok) {
                    const data = await response.json();
                    if (!data.canConnect) {
                        let errMsg = "";
                        switch (data.reason) {
                            case "Room not found.":
                                errMsg = "Такая комната не найдена";
                                break;
                            // TODO: be more precise here
                            default:
                                errMsg = "Кто-то с таким именем уже есть в комнате";
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
                        return;
                    }
                } else {
                    console.error("Failed to connect to room", response.statusText);
                }
            } catch (error) {
                console.error("Error connecting to room:", error.message);
            }
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
                        markersRef={markersRef}
                        roomStatusRef={roomStatusRef}
                        streetViewRef={streetViewRef}
                    />
                </Panel>
                <PanelResizeHandle style={{ width: "1px", backgroundColor: "gray" }} />
                <Panel defaultSize={30} minSize={10}>
                    <SidePane socketRef={socketRef} messages={messages} setMessages={setMessages} users={users} />
                </Panel>
            </PanelGroup>
        </div >
    );
}
