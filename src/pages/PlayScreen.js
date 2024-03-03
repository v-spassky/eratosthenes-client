
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useNavigate, useParams } from "react-router-dom";
import { Slide, toast } from "react-toastify";

import waitForSocketConnection from "../utils/waitForSocketConnection.js";
import SidePane from "./components/SidePane.js";
import StreetViewWindow from "./components/StreetViewWindow.js";

export default function PlayScreen({ prevApiKeyRef }) {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const socketRef = useRef(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
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
    }, []);

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

        socketRef.current = new WebSocket(`${process.env.REACT_APP_WS_SERVER_ORIGIN}/chat/${id}`);
        socketRef.current.onopen = () => {
            console.log("WebSocket connection established.");
        };
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
                                    };
                                }));
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
                                    };
                                }));
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching users:", error);
                        });
                    break;
                }
                default:
                    console.error(`Unknown message type: ${message.type}`);
            }
        };
        setTimeout(() => {
            const payload = {
                type: "userConnected",
                payload: {
                    username: localStorage.getItem("username"),
                    avatarEmoji: localStorage.getItem("selectedEmoji"),
                },
            }
            waitForSocketConnection(socketRef.current, () => {
                socketRef.current.send(JSON.stringify(payload));
            });

            setTimeout(() => {
                fetch(`${process.env.REACT_APP_SERVER_ORIGIN}/users-of-room/${id}`)
                    .then(response => response.json())
                    .then(data => {
                        if (!data.error) {
                            setUsers(data.users.map(user => {
                                return {
                                    name: user.name,
                                    avatarEmoji: user.avatarEmoji,
                                    score: user.score,
                                    isHost: user.isHost,
                                    description: user.description,
                                };
                            }));
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching users:", error);
                    });
            }, 100);
        }, 50);

        return () => {
            const payload = {
                type: "userDisconnected",
                payload: {
                    username: localStorage.getItem("username"),
                    avatarEmoji: localStorage.getItem("selectedEmoji"),
                },
            }
            socketRef.current.send(JSON.stringify(payload));
            console.log("WebSocket connection closed.");
            socketRef.current.close();
        };
    }, [navigate, id]);

    return (
        <div id="playScreen" style={{ height: "100vh", display: "flex", flexDirection: "row" }}>
            <PanelGroup autoSaveId="persistence" direction="horizontal">
                <Panel minSize={50}>
                    <StreetViewWindow prevApiKeyRef={prevApiKeyRef} />
                </Panel>
                <PanelResizeHandle style={{ width: "1px", backgroundColor: "gray" }} />
                <Panel defaultSize={30} minSize={10}>
                    <SidePane socketRef={socketRef} messages={messages} setMessages={setMessages} users={users} />
                </Panel>
            </PanelGroup>
        </div >
    );
}
