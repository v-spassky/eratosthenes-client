import { Button, Textarea, Tooltip } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { FaRegMessage } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { Slide, toast } from "react-toastify";

import reallyBigScrollValuePx from "../../constants/reallyBigScrollValue.js";
import randomChatPrompt from "../../utils/randomChatPrompt.js";
import waitForSocketConnection from "../../utils/waitForSocketConnection.js";

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [chatPrompt, setPrompt] = useState(randomChatPrompt());
    const socketRef = useRef(null);
    const textInputIsFocused = useRef(false);
    const chatContainerRef = useRef(null);
    const { id } = useParams();
    const navigate = useNavigate();

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
            if (message.type !== "chatMessage") {
                return;
            }
            const newMessageSound = new Audio("new_message_notification.wav");
            newMessageSound.play();
            setMessages(
                messages => [...messages, { id: 1, author: message.payload.from, content: message.payload.content }]
            );
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
        }, 50);

        setTimeout(() => {
            if (chatContainerRef.current !== null) {
                chatContainerRef.current.scrollTop = reallyBigScrollValuePx;
            }
        }, 100);

        return () => {
            socketRef.current.close();
        };
    }, [navigate, id]);

    useEffect(() => {
        if (
            chatContainerRef.current !== null
            &&
            chatContainerRef.current.scrollHeight
            - chatContainerRef.current.scrollTop
            - chatContainerRef.current.clientHeight
            < 50
        ) {
            chatContainerRef.current.scrollTop = reallyBigScrollValuePx;
        }
    }, [messages]);

    const handleSendMessage = (event) => {
        event.preventDefault();
        if (message.trim() === "") {
            return;
        }
        const payload = {
            type: "chatMessage",
            payload: {
                from: localStorage.getItem("username"),
                content: message,
            },
        }
        socketRef.current.send(JSON.stringify(payload));
        setMessages([...messages, { id: 1, author: "you", content: message, dateTime: new Date().toISOString() }]);
        setMessage("");
        setPrompt(randomChatPrompt());
    };

    const handleKeyDown = (event) => {
        if (event.ctrlKey && event.key === "Enter" && textInputIsFocused.current && message.trim() !== "") {
            handleSendMessage(event);
        }
    };

    return (
        <div
            id="chat"
            style={{
                display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", padding: 10,
                paddingRight: 20, overflow: "hidden",
            }}
        >
            <div
                id="chat-container"
                ref={chatContainerRef}
                style={{ flex: "1 1 auto", overflowY: "auto" }}
            >
                {messages.map(message => (
                    <div key={message.id} style={{ marginBottom: 4, wordWrap: "break-word" }}>
                        <span style={{ fontWeight: "bold" }}>{message.author}:</span> {message.content}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage} style={{ position: "relative" }}>
                <Textarea
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={chatPrompt}
                    style={{ height: "100px" }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => (textInputIsFocused.current = true)}
                    onBlur={() => (textInputIsFocused.current = false)}
                />
                <Tooltip content="Отправить сообщение">
                    <Button
                        type="submit"
                        isIconOnly
                        color="primary"
                        aria-label="Send"
                        style={{ position: "absolute", bottom: "5px", right: "5px" }}
                    >
                        <FaRegMessage />
                    </Button>
                </Tooltip>
            </form>
            <p style={{ fontStyle: "italic", fontSize: "small", color: "gray" }}>
                Нажми Ctrl+Enter чтобы отправить сообщение
            </p>
        </div>
    );
}
