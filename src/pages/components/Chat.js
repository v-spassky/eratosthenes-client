import { Textarea } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { FaWifi } from "react-icons/fa6";

import reallyBigScrollValuePx from "../../constants/reallyBigScrollValue.js";
import randomChatPrompt from "../../utils/randomChatPrompt.js";

export default function Chat({ socketRef, messages, setMessages, connectionIsOk }) {
    const [message, setMessage] = useState("");
    const [chatPrompt, setPrompt] = useState(randomChatPrompt());
    const textInputIsFocused = useRef(false);
    const chatContainerRef = useRef(null);
    const { theme, _setTheme } = useTheme();

    const statusBarText = connectionIsOk ? "Соединение работает нормально." : "Соединение потеряно.";

    function statusBarBgColor() {
        let statusBarColor;
        if (!connectionIsOk && theme === "light") {
            statusBarColor = "rgb(252, 165, 165)";
        } else if (!connectionIsOk && theme === "dark") {
            statusBarColor = "rgb(220, 38, 38)";
        } else if (connectionIsOk && theme === "light") {
            statusBarColor = "#F4F4F5";
        } else if (connectionIsOk && theme === "dark") {
            statusBarColor = "#27272A";
        }
        return statusBarColor;
    }

    useEffect(() => {
        setTimeout(() => {
            if (chatContainerRef.current !== null) {
                chatContainerRef.current.scrollTop = reallyBigScrollValuePx;
            }
        }, 100);
    }, []);

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
        setMessages([...messages, { id: 1, author: "я", content: message }]);
        setMessage("");
        setPrompt(randomChatPrompt());
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && textInputIsFocused.current && message.trim() !== "") {
            handleSendMessage(event);
        }
    };

    return (
        <div
            id="chat"
            style={{
                display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%",
                overflow: "hidden",
            }}
        >
            <div style={{ padding: 10 }}>
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
            </div>
            <div
                style={{
                    height: "14px", backgroundColor: statusBarBgColor(), display: "flex", flexDirection: "row",
                    alignItems: "center", justifyContent: "center", gap: "4px",
                }}
            >
                <FaWifi style={{ height: "10px" }} />
                <span style={{ fontSize: "10px" }}>{statusBarText}</span>
            </div>
        </div>
    );
}
