import { Button, Textarea, Tooltip } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { FaRegMessage } from "react-icons/fa6";

import reallyBigScrollValuePx from "../../constants/reallyBigScrollValue.js";
import randomChatPrompt from "../../utils/randomChatPrompt.js";

export default function Chat({ socketRef, messages, setMessages }) {
    const [message, setMessage] = useState("");
    const [chatPrompt, setPrompt] = useState(randomChatPrompt());
    const textInputIsFocused = useRef(false);
    const chatContainerRef = useRef(null);

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
        setMessages([...messages, { id: 1, author: "you", content: message }]);
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
