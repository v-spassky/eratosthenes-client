import { Button, Modal, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { canConnectToRoom, getMessagesOfRoom, getUsersOfRoom, revokeGuess, submitGuess, userIsHost } from "api/http.js";
import useRoomSocket from "api/ws.js";
import defaultStreetViewPosition from "constants/defaultStreetViewPosition.js";
import mapMarkSvg from "constants/mapMarkSvg.js";
import { getApiKey, getApiKeyStrategy, getSelectedEmoji, getUsername } from "localStorage/storage.js";
import {
    showFailedRoomConnectionNotification, showThanksForUsingOwnApiKeyNotification, showUnsetUsernameErrorNotification,
} from "notifications/all.js";
import SidePane from "pages/playScreen/components/SidePane.js";
import StreetViewWindow from "pages/playScreen/components/StreetViewWindow.js";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useNavigate, useParams } from "react-router-dom";
import { playRoundFinishedNotification, playRoundStartedNotification } from "utils/sounds.js";

export default function PlayScreen({ prevApiKeyRef }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const gameFinishedModal = useDisclosure();

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [iAmHost, setIAmHost] = useState(false);

    const [roomStatus, setRoomStatus] = useState("waiting");
    const roomStatusRef = useRef("waiting");

    const [showLastRoundScore, setShowLastRoundScore] = useState(false);

    const streetViewRef = useRef(null);
    const [streetViewPosition, setStreetViewPosition] = useState(defaultStreetViewPosition);
    const streetViewInitialized = useRef(false);
    const mapRef = useRef(null);

    const markersRef = useRef([]);
    const userGuessRef = useRef(null);
    const submittedGuessRef = useRef(false);
    const polyLinesRef = useRef([]);

    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);
    const [showStartGameButton, setShowStartGameButton] = useState(false);

    async function refreshRoomUsersAndStatus(retryCount) {
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
                isMuted: user.isMuted,
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
            setTimeout(async () => await refreshRoomUsersAndStatus(retryCount - 1), 500);
        }
    }

    const { connectionIsOk, sendMessage, closeSocket } = useRoomSocket({
        roomId: id, refreshRoomUsersAndStatus, setMessages, setUsers, setRoomStatus, setProgress,
        setShowLastRoundScore, userGuessRef, roomStatusRef, submittedGuessRef, intervalRef,
        openGameFinishedModal: gameFinishedModal.onOpen,
    });

    async function mustShowStartGameButton(roomId) {
        const currentUserIsHost = await userIsHost(roomId);
        setIAmHost(currentUserIsHost);
        return (roomStatus === "waiting") && await userIsHost(roomId);
    }

    function handleTabClosing() {
        console.log("[navigation]: tab is closing...");
        const payload = {
            type: "userDisconnected",
            payload: {
                username: getUsername(),
                avatarEmoji: getSelectedEmoji() || "",
            },
        };
        sendMessage(payload);
        closeSocket();
    }

    useEffect(() => {
        window.addEventListener("beforeunload", handleTabClosing);
        if (getApiKeyStrategy() !== "useMyOwn") {
            return;
        }
        if (getApiKey() === null) {
            return;
        }
        if (getApiKey() === "") {
            return;
        }
        showThanksForUsingOwnApiKeyNotification();
        return () => {
            // TODO: is this OK that we don't return this in guards?
            window.removeEventListener("unload", handleTabClosing);
            clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        const switchBtnVisibility = async () => { setShowStartGameButton(await mustShowStartGameButton(id)); };
        switchBtnVisibility();
        if (mapRef.current) {
            markersRef.current.forEach((marker) => { marker.setMap(null); });
            polyLinesRef.current.forEach((polyLine) => { polyLine.setMap(null); });
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
                            }));
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
        if (!getUsername()) {
            showUnsetUsernameErrorNotification();
            navigate("/", { state: { roomId: id } });
            return;
        }
        const checkIfCanConnect = async () => {
            const canConnectResp = await canConnectToRoom(id);
            if (!canConnectResp.canConnect) {
                showFailedRoomConnectionNotification(canConnectResp.reason);
                navigate("/");
                return;
            }
        };
        checkIfCanConnect();
        refreshRoomUsersAndStatus(20);
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
        submittedGuessRef.current = false;
        setRoomStatus("playing");
        roomStatusRef.current = "playing";
        setProgress(100);
        const payload = { type: "roundStarted", payload: null };
        sendMessage(payload);
        playRoundStartedNotification();
        intervalRef.current = setInterval(() => {
            setProgress(prevProgress => {
                if (prevProgress === 1) {
                    if (userGuessRef.current !== null) {
                        const lat = userGuessRef.current.position.lat().toString();
                        const lng = userGuessRef.current.position.lng().toString();
                        submitGuess(lat, lng, id);
                    } else {
                        console.error("[map]: user marker not found.");
                        // TODO: show error
                    }
                }
                if (prevProgress === 0) {
                    clearInterval(intervalRef.current);
                    setRoomStatus("waiting");
                    roomStatusRef.current = "waiting";
                    playRoundFinishedNotification();
                    return 0;
                }
                return prevProgress - 1;
            });
        }, 1000);
    }

    useEffect(() => {
        if (!getUsername()) {
            showUnsetUsernameErrorNotification();
            navigate("/", { state: { roomId: id } });
            return;
        }
        const fetchData = async () => {
            const canConnectResp = await canConnectToRoom(id);
            if (!canConnectResp.canConnect) {
                showFailedRoomConnectionNotification(canConnectResp.reason);
                navigate("/");
                return;
            }
            const messagesResp = await getMessagesOfRoom(id);
            setMessages(messagesResp.messages.map(message => {
                return {
                    id: 1,
                    author: message.from === getUsername() ? "я" : message.from,
                    content: message.content,
                    isFromBot: message.isFromBot,
                };
            }));
        };
        fetchData();
    }, [navigate, id]);

    function handleConfirmAnswer() {
        if (userGuessRef.current === null) {
            console.error("[map]: user marker not found.");
        }
        const lat = userGuessRef.current.position.lat().toString();
        const lng = userGuessRef.current.position.lng().toString();
        submitGuess(lat, lng, id);
        submittedGuessRef.current = true;
    }

    function handleRevokeAnswer() {
        revokeGuess(id);
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
                        sendMessage={sendMessage}
                        messages={messages}
                        setMessages={setMessages}
                        users={users}
                        connectionIsOk={connectionIsOk}
                        showLastRoundScore={showLastRoundScore}
                        iAmHost={iAmHost}
                    />
                </Panel>
            </PanelGroup>
            <Modal size={"md"} isOpen={gameFinishedModal.isOpen} onOpenChange={gameFinishedModal.onOpenChange}>
                <ModalContent style={{ padding: "24px" }}>
                    {(onClose) => (
                        <>
                            <ModalHeader style={{ padding: "0px", paddingBottom: "12px" }}>
                                Игра завершена! Победитель это...
                            </ModalHeader>
                                <div style={{ textAlign: "center" }}>
                                    <p style={{ fontSize: "80px" }}>{users[0].avatarEmoji}</p>
                                    <p style={{ fontSize: "24px" }}>{users[0].name}</p>
                                </div>
                            <ModalFooter style={{ padding: "0px", paddingTop: "12px" }}>
                                <Button color="primary" onPress={onClose}>Круто!</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div >
    );
}
