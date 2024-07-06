import { Textarea } from "@nextui-org/react";
import maxMessageLength from "constants/maxMessageLength.js";
import { getUsername } from "localStorage/storage.js";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { FaWifi } from "react-icons/fa6";
import randomChatPrompt from "utils/randomChatPrompt.js";

const scrollUpThreshold = 40;
const scrollBottomPadding = 4;

export default function Chat({ sendMessage, messages, setMessages, connectionIsOk }) {
    const [message, setMessage] = useState("");
    const [chatPrompt, setPrompt] = useState(randomChatPrompt());
    const textInputIsFocused = useRef(false);
    const chatContainerRef = useRef(null);
    const { theme, _setTheme } = useTheme();
    const statusBarText = connectionIsOk ? "Соединение работает нормально." : "Соединение потеряно.";
    const messageLengthIsValid = message.length <= maxMessageLength;

    useEffect(() => {
        if (chatContainerRef.current === null) {
            return;
        }
        const chat = chatContainerRef.current;
        const newMsgHeight = chat.lastElementChild?.offsetHeight || 0;
        // `scrollUp` represents the number of pixels the user has scrolled up in the chat.
        // A value of zero means the user is at the bottom of the chat, negative values indicate no scroll.
        const scrollUp = chat.scrollHeight - chat.clientHeight - chat.scrollTop - scrollBottomPadding - newMsgHeight;
        if (scrollUp > scrollUpThreshold) {
            // The user has scrolled up a significant amount. Avoid scrolling to the bottom when a new message arrives
            // to prevent disturbance.
            return;
        }
        chat.scrollTop = chat.scrollHeight - chat.clientHeight;
    }, [messages]);

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

    function handleSendMessage(event) {
        event.preventDefault();
        const payload = {
            type: "chatMessage",
            payload: {
                from: getUsername(),
                content: message.replace(/\n/g, "\\n"),
            },
        };
        sendMessage(payload);
        setMessages([...messages, { id: 1, author: "я", content: message }]);
        setMessage("");
        setPrompt(randomChatPrompt());
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" && textInputIsFocused.current && message.trim() !== "" && messageLengthIsValid) {
            handleSendMessage(event);
        }
    }

    const messageLengthErrorMsg =
        <div
            style={{
                height: messageLengthIsValid ? 0 : "20px",
                overflow: "hidden",
                transition: "height 0.3s ease",
                color: "red",
                fontSize: "12px",
                marginTop: "5px",
            }}
        >
            Сообщение слишком длинное.
        </div>;

    return (
        <div
            id="chat"
            style={{
                display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%",
                overflow: "hidden",
            }}
        >
            <div
                id="chat-container"
                ref={chatContainerRef}
                style={{ padding: "10px", flex: "1 1 auto", overflowY: "auto" }}
            >
                {messages.map(message => (
                    message.isFromBot
                        ? <div
                            key={message.id}
                            style={{ marginBottom: 4, wordWrap: "break-word", fontStyle: "italic" }}
                        >
                            {message.content}
                        </div>
                        : <div key={message.id} style={{ marginBottom: 4, wordWrap: "break-word" }}>
                            <span style={{ fontWeight: "bold" }}>{message.author}:</span> {message.content}
                        </div>
                ))}
            </div>
            <div style={{ padding: "10px", paddingTop: "0px", paddingBottom: "0px" }}>
                <Textarea
                    aria-label="Chat message text"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={chatPrompt}
                    style={{ height: "100px" }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => (textInputIsFocused.current = true)}
                    onBlur={() => (textInputIsFocused.current = false)}
                    isInvalid={!messageLengthIsValid}
                    errorMessage={messageLengthErrorMsg}
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
