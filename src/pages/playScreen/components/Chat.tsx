import { useLingui } from "@lingui/react"
import { Card, Textarea } from "@nextui-org/react"
import { ClientSentSocketMessage, ClientSentSocketMessageType } from "api/messageTypes"
import { RoomSocketContext } from "api/ws"
import maxMessageLength from "constants/maxMessageLength"
import { SupportedLocale } from "localization/all"
import { getUsername } from "localStorage/storage"
import { BotMessagePayload, BotMessagePayloadType, ChatMessageType } from "models/all"
import { useTheme } from "next-themes"
import React, { KeyboardEvent, ReactElement, useContext, useEffect, useRef, useState } from "react"
import { FaWifi } from "react-icons/fa6"
import { MessagesActionType, MessagesContext, MessagesDispatchContext } from "state/messages"
import { UsersContext } from "state/users"
import getCaretCoordinates from "textarea-caret"
import randomChatPrompt from "utils/randomChatPrompt"

const scrollUpThreshold = 40
const scrollBottomPadding = 4

export default function Chat(): ReactElement {
    const { theme } = useTheme()
    const strings = useLingui()
    const messages = useContext(MessagesContext)
    const users = useContext(UsersContext)
    const dispatchMessagesAction = useContext(MessagesDispatchContext)
    const { connectionIsOk, sendMessage } = useContext(RoomSocketContext)!
    const [message, setMessage] = useState("")
    const [chatPrompt, setPrompt] = useState("")
    const textInputIsFocused = useRef(false)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const [showDropdown, setShowDropdown] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [dropdownHeight, setDropdownHeight] = useState(0)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)

    const statusBarText = connectionIsOk ? strings.i18n._("connectionWorksWell") : strings.i18n._("connectionLost")
    const messageLengthIsValid = message.length <= maxMessageLength
    const userMentionBackgroundColor = theme === "light" ? "rgb(214, 216, 217)" : "rgb(52, 62, 75)"
    const myMentionBackground =
        theme === "light" ? "linear-gradient(to left, #ede574, #e1f5c4)" : "linear-gradient(to left, #4776e6, #8e54e9)"
    const dropdownSelectionBackground = theme === "light" ? "rgb(242, 244, 245)" : "rgb(75 85 99)"

    useEffect(() => {
        if (chatContainerRef.current === null) {
            return
        }
        const chat = chatContainerRef.current
        const newMsgHeight = (chat.lastElementChild as HTMLElement | null)?.offsetHeight || 0
        // `scrollUp` represents the number of pixels the user has scrolled up in the chat.
        // A value of zero means the user is at the bottom of the chat, negative values indicate no scroll.
        const scrollUp = chat.scrollHeight - chat.clientHeight - chat.scrollTop - scrollBottomPadding - newMsgHeight
        if (scrollUp > scrollUpThreshold) {
            // The user has scrolled up a significant amount. Avoid scrolling to the bottom when a new message arrives
            // to prevent disturbance.
            return
        }
        chat.scrollTop = chat.scrollHeight - chat.clientHeight
    }, [messages])

    useEffect(() => {
        if (showDropdown && dropdownRef.current) {
            setDropdownHeight(dropdownRef.current.offsetHeight)
        }
        const dropdownRightEdgeLeftCoord =
            textAreaRef.current!.getBoundingClientRect().left +
            dropdownPosition.left +
            dropdownRef.current!.clientWidth!
        const dropdownOverflow = dropdownRightEdgeLeftCoord - window.innerWidth
        if (dropdownOverflow >= 0) {
            setDropdownPosition((prevPos) => ({ ...prevPos, left: prevPos.left - dropdownOverflow }))
        }
    }, [showDropdown])

    useEffect(() => {
        setDropdownHeight(users.length * 32)
        setDropdownPosition((prevPos) => ({ ...prevPos, top: prevPos.top + dropdownHeight - users.length * 32 }))
    }, [users])

    useEffect(() => {
        setPrompt(randomChatPrompt(strings))
        dispatchMessagesAction({ type: MessagesActionType.TranslateMeInMessages, strings })
    }, [strings.i18n.locale])

    function statusBarBgColor(): string {
        let statusBarColor
        if (!connectionIsOk && theme === "light") {
            statusBarColor = "rgb(252, 165, 165)"
        } else if (!connectionIsOk && theme === "dark") {
            statusBarColor = "rgb(220, 38, 38)"
        } else if (connectionIsOk && theme === "light") {
            statusBarColor = "#F4F4F5"
        } else if (connectionIsOk && theme === "dark") {
            statusBarColor = "#27272A"
        } else {
            console.error("[chat]: could not figure out the correct `statusBarColor`")
            statusBarColor = "#F4F4F5"
        }
        return statusBarColor
    }

    function handleSendMessage(event: KeyboardEvent<HTMLInputElement>): void {
        event.preventDefault()
        const username = getUsername()
        if (username === null) {
            return
        }
        const payload: ClientSentSocketMessage = {
            type: ClientSentSocketMessageType.ChatMessage,
            payload: { from: username, content: message.replace(/\n/g, "\\n") },
        }
        sendMessage(payload)
        dispatchMessagesAction({
            type: MessagesActionType.AddMessage,
            message: {
                type: ChatMessageType.FromPlayerChatMessage,
                id: 1,
                authorName: strings.i18n._("me"),
                content: message,
            },
        })
        setMessage("")
        setPrompt(randomChatPrompt(strings))
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
        if (dropdownHeight === 0 && dropdownRef.current !== null) {
            setDropdownHeight(dropdownRef.current.offsetHeight)
        }
        if (showDropdown) {
            if (event.key === "ArrowDown") {
                event.preventDefault()
                setHighlightedIndex((prevIndex) => (prevIndex + 1) % users.length)
            } else if (event.key === "ArrowUp") {
                event.preventDefault()
                setHighlightedIndex((prevIndex) => (prevIndex - 1 + users.length) % users.length)
            } else if (event.key === "Enter" && highlightedIndex >= 0) {
                event.preventDefault()
                selectUser(users[highlightedIndex].name)
            } else if (event.key === "Escape") {
                setShowDropdown(false)
                setHighlightedIndex(-1)
            }
        } else if (
            event.key === "Enter" &&
            textInputIsFocused.current &&
            message.trim() !== "" &&
            messageLengthIsValid
        ) {
            handleSendMessage(event)
        }
    }

    function selectUser(username: string): void {
        setMessage((prevMessage) => prevMessage + username + " ")
        setShowDropdown(false)
        setHighlightedIndex(-1)
    }

    function handleTextareaChange(event: React.ChangeEvent<HTMLInputElement>): void {
        setMessage(event.target.value)
        const caretPos = getCaretCoordinates(event.target, event.target.selectionEnd!)
        if (event.target.value[event.target.selectionStart! - 1] === "@") {
            const cursorCoord = {
                top: caretPos.top + 25 - dropdownHeight,
                left: caretPos.left + 25,
            }
            setDropdownPosition(cursorCoord)
            setShowDropdown(true)
        } else {
            setShowDropdown(false)
            setHighlightedIndex(-1)
        }
    }

    function formatBotMessage(botMessage: BotMessagePayload): string {
        switch (strings.i18n.locale as SupportedLocale) {
            case "en": {
                switch (botMessage.type) {
                    case BotMessagePayloadType.RoundStartedBotMsg: {
                        return `Round ${botMessage.payload.round_number}/${botMessage.payload.rounds_per_game} has started.`
                    }
                    case BotMessagePayloadType.RoundEndedBotMsg: {
                        return `Round ${botMessage.payload.round_number}/${botMessage.payload.rounds_per_game} has ended.`
                    }
                    case BotMessagePayloadType.UserConnectedBotMsg: {
                        return `${botMessage.payload.username} has joined us!`
                    }
                    case BotMessagePayloadType.UserDisconnectedBotMsg: {
                        return `${botMessage.payload.username} has disconnected.`
                    }
                }
                break
            }
            case "ru": {
                switch (botMessage.type) {
                    case BotMessagePayloadType.RoundStartedBotMsg: {
                        return `Раунд ${botMessage.payload.round_number}/${botMessage.payload.rounds_per_game} начался.`
                    }
                    case BotMessagePayloadType.RoundEndedBotMsg: {
                        return `Раунд ${botMessage.payload.round_number}/${botMessage.payload.rounds_per_game} закончился.`
                    }
                    case BotMessagePayloadType.UserConnectedBotMsg: {
                        return `К нам присоединился ${botMessage.payload.username}!`
                    }
                    case BotMessagePayloadType.UserDisconnectedBotMsg: {
                        return `${botMessage.payload.username} отключился.`
                    }
                }
                break
            }
        }
    }

    function highlightTags(text: string): ReactElement {
        const parts = text.split(/(@[\w\u0400-\u04FF]+(?:\s[\w\u0400-\u04FF]+)*)/gu)
        return (
            <>
                {parts.map((part, index) => {
                    if (part.startsWith("@")) {
                        const mentionedUser = users.find((user) => `@${user.name}` === part)
                        const iAmMentionedUser = mentionedUser?.name === getUsername()!
                        if (mentionedUser) {
                            const userSpecificMentionStyles = iAmMentionedUser
                                ? { background: myMentionBackground }
                                : { backgroundColor: userMentionBackgroundColor }
                            return (
                                <span
                                    key={index}
                                    style={{
                                        borderRadius: "999px",
                                        padding: "0.5px",
                                        paddingLeft: "4px",
                                        paddingRight: "4px",
                                        ...userSpecificMentionStyles,
                                    }}
                                >
                                    {part}
                                </span>
                            )
                        }
                    }
                    return part
                })}
            </>
        )
    }

    const messageLengthErrorMsg = (
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
        </div>
    )

    return (
        <div
            id="chat"
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                height: "100%",
                overflow: "hidden",
            }}
        >
            <div
                id="chat-container"
                ref={chatContainerRef}
                style={{ padding: "10px", flex: "1 1 auto", overflowY: "auto" }}
            >
                {messages.map((message) =>
                    message.type === ChatMessageType.FromBotChatMessage ? (
                        <div key={message.id} style={{ marginBottom: 4, wordWrap: "break-word", fontStyle: "italic" }}>
                            {highlightTags(formatBotMessage(message.content))}
                        </div>
                    ) : (
                        <div key={message.id} style={{ marginBottom: 4, wordWrap: "break-word" }}>
                            <span style={{ fontWeight: "bold" }}>{message.authorName}:</span>{" "}
                            {highlightTags(message.content)}
                        </div>
                    )
                )}
            </div>
            <div style={{ position: "relative", padding: "10px", paddingTop: "0px", paddingBottom: "0px" }}>
                <Textarea
                    ref={textAreaRef}
                    aria-label="Chat message text"
                    name="message"
                    value={message}
                    onChange={handleTextareaChange}
                    placeholder={chatPrompt}
                    style={{ height: "100px" }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => (textInputIsFocused.current = true)}
                    onBlur={() => (textInputIsFocused.current = false)}
                    isInvalid={!messageLengthIsValid}
                    errorMessage={messageLengthErrorMsg}
                />
                <Card
                    ref={dropdownRef}
                    style={{
                        position: "absolute",
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        borderRadius: "8px",
                        zIndex: 10,
                        display: showDropdown ? "inherit" : "none",
                        whiteSpace: "nowrap",
                    }}
                >
                    {users.map((user, idx) => (
                        <div
                            key={user.publicId}
                            style={{
                                padding: "4px",
                                backgroundColor: highlightedIndex === idx ? dropdownSelectionBackground : "inherit",
                                cursor: "pointer",
                            }}
                            onMouseDown={() => selectUser(user.name)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                            <span style={{ display: "inline-block", width: "16px" }}>{user.avatarEmoji || ""}</span>{" "}
                            {user.name}
                        </div>
                    ))}
                </Card>
            </div>
            <div
                style={{
                    height: "14px",
                    backgroundColor: statusBarBgColor(),
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                }}
            >
                <FaWifi style={{ height: "10px" }} />
                <span style={{ fontSize: "10px" }}>{statusBarText}</span>
            </div>
        </div>
    )
}
