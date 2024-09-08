import { useLingui } from "@lingui/react"
import { canConnectToRoom, getUsersOfRoom, saveGuess, submitGuess } from "api/http"
import {
    ClientSentSocketMessage,
    ClientSentSocketMessageType,
    ServerSentSocketMessage,
    ServerSentSocketMessageType,
} from "api/messageTypes"
import socketConnWaitRetryPeriodMs from "constants/socketConnWaitRetryPeriod"
import { getPasscode, getPublicUserId, getSelectedEmoji, getUsername } from "localStorage/storage"
import { ChatMessageType, RoomStatusType } from "models/all"
import { showBannedFromRoomNotification } from "notifications/all"
import { showFailedRoomConnectionNotification, showUnsetUsernameErrorNotification } from "notifications/all"
import { useContext, useEffect, useRef, useState } from "react"
import { createContext } from "react"
import { useNavigate } from "react-router-dom"
import { RoomStatusRefContext, SubmittedGuessRefContext, UserGuessRefContext } from "state/map"
import { MessagesActionType, MessagesDispatchContext } from "state/messages"
import { RoomMetaInfoActionType, RoomMetaInfoDispatchContext } from "state/roomMetaInfo"
import { UsersActionType, UsersDispatchContext } from "state/users"
import {
    playNewMessageNotification,
    playRoundFinishedNotification,
    playRoundStartedNotification,
    playUserConnectedNotification,
    playUserDisconnectedNotification,
} from "utils/sounds"

interface RoomSocketProps {
    roomId: string
    refreshRoomUsersAndStatus: (retryCount: number) => void
    openGameFinishedModal: () => void
}

interface RoomSocketControl {
    connectionIsOk: boolean
    sendMessage: (message: ClientSentSocketMessage) => void
    closeSocket: () => void
}

function waitForSocketConnection(socket: WebSocket | null, onSuccessfulConnection: () => void): void {
    setTimeout(() => {
        if (socket !== null && socket.readyState === 1) {
            onSuccessfulConnection()
        } else {
            waitForSocketConnection(socket, onSuccessfulConnection)
        }
    }, socketConnWaitRetryPeriodMs)
}

export default function useRoomSocket({
    roomId,
    refreshRoomUsersAndStatus,
    openGameFinishedModal,
}: RoomSocketProps): RoomSocketControl {
    const strings = useLingui()
    const socketRef = useRef<WebSocket | null>(null)
    const [connectionIsOk, setConnectionIsOk] = useState(false)
    const navigate = useNavigate()
    const dispatchUsersAction = useContext(UsersDispatchContext)
    const dispatchMessagesAction = useContext(MessagesDispatchContext)
    const dispatchRoomMetaInfoAction = useContext(RoomMetaInfoDispatchContext)
    const roomStatusRef = useContext(RoomStatusRefContext)!
    const submittedGuessRef = useContext(SubmittedGuessRefContext)!
    const userGuessRef = useContext(UserGuessRefContext)!

    async function fetchAndSetUsers(roomId: string): Promise<void> {
        const usersResp = await getUsersOfRoom(roomId)
        if (usersResp.error) {
            console.error("[HTTP]: failed to load users of the room")
            return
        }
        dispatchUsersAction({ type: UsersActionType.SetUsers, users: usersResp.users })
    }

    useEffect(() => {
        if (!getUsername()) {
            showUnsetUsernameErrorNotification(strings)
            navigate("/", { state: { roomId: roomId } })
            return
        }
        const checkIfCanConnect = async (): Promise<void> => {
            const canConnectResp = await canConnectToRoom(roomId)
            if (!canConnectResp.canConnect) {
                showFailedRoomConnectionNotification(strings, canConnectResp.errorCode)
                navigate("/")
                return
            }
        }
        checkIfCanConnect()

        const pingInterval = connectToSocket(false)

        setTimeout(() => {
            const username = getUsername()
            if (username === null) {
                console.error("[storage]: could't get username from local storage")
                return
            }
            const payload: ClientSentSocketMessage = {
                type: ClientSentSocketMessageType.UserConnected,
                payload: { username, avatarEmoji: getSelectedEmoji() || "" },
            }
            waitForSocketConnection(socketRef.current, () => {
                sendMessage(payload)
            })
            refreshRoomUsersAndStatus(20)
        }, 500)

        return (): void => {
            const username = getUsername()
            if (username === null) {
                console.error("[storage]: could't get username from local storage")
                return
            }
            const payload: ClientSentSocketMessage = {
                type: ClientSentSocketMessageType.UserDisconnected,
                payload: { username, avatarEmoji: getSelectedEmoji() || "" },
            }
            sendMessage(payload)
            closeSocket()
            console.log("[WS]: clearing ping interval...")
            clearInterval(pingInterval)
        }
    }, [])

    function connectToSocket(isReconnect: boolean): NodeJS.Timeout {
        socketRef.current = new WebSocket(
            `${process.env.REACT_APP_WS_SERVER_ORIGIN}/rooms/${roomId}?passcode=${getPasscode()}`
        )
        socketRef.current.onopen = (): void => {
            console.log("[WS]: websocket connection established.")
            setConnectionIsOk(true)
            if (isReconnect) {
                const username = getUsername()
                if (username === null) {
                    console.error("[storage]: could't get username from local storage")
                    return
                }
                const payload: ClientSentSocketMessage = {
                    type: ClientSentSocketMessageType.UserReConnected,
                    payload: { username, avatarEmoji: getSelectedEmoji() || "" },
                }
                sendMessage(payload)
            }
        }
        socketRef.current.onclose = (): void => {
            console.log("[WS]: websocket connection closed.")
            console.log(`[navigation]: current URL path: ${window.location.pathname}`)
            setConnectionIsOk(false)
            if (window.location.pathname === `/room/${roomId}`) {
                console.log("[WS]: reconnecting websocket in 1 second.")
                setTimeout(() => connectToSocket(true), 1000)
            }
        }
        socketRef.current.onerror = (error): void => {
            console.error(`[WS]: websocket error: ${JSON.stringify(error)}`)
            console.log("[WS]: closing websocket connection...")
            closeSocket()
            setConnectionIsOk(false)
            if (window.location.pathname === `/room/${roomId}`) {
                console.log("[WS]: reconnecting websocket in 1 second.")
                setTimeout(() => connectToSocket(true), 1000)
            }
        }
        socketRef.current.onmessage = async (event): Promise<void> => {
            const message: ServerSentSocketMessage = JSON.parse(event.data)
            switch (message.type) {
                case ServerSentSocketMessageType.ChatMessage: {
                    playNewMessageNotification()
                    dispatchMessagesAction({
                        type: MessagesActionType.AddMessage,
                        message: {
                            type: ChatMessageType.FromPlayerChatMessage,
                            id: message.payload.id,
                            authorName: message.payload.from,
                            content: message.payload.content,
                        },
                    })
                    break
                }
                case ServerSentSocketMessageType.BotMessage: {
                    dispatchMessagesAction({
                        type: MessagesActionType.AddMessage,
                        message: {
                            type: ChatMessageType.FromBotChatMessage,
                            id: message.id,
                            content: message.payload,
                        },
                    })
                    break
                }
                case ServerSentSocketMessageType.UserConnected: {
                    playUserConnectedNotification()
                    await fetchAndSetUsers(roomId)
                    break
                }
                case ServerSentSocketMessageType.UserDisconnected: {
                    playUserDisconnectedNotification()
                    await fetchAndSetUsers(roomId)
                    break
                }
                case ServerSentSocketMessageType.RoundStarted: {
                    dispatchRoomMetaInfoAction({
                        type: RoomMetaInfoActionType.SetRoomStatus,
                        status: RoomStatusType.Playing,
                    })
                    roomStatusRef.current = RoomStatusType.Playing
                    submittedGuessRef.current = false
                    dispatchRoomMetaInfoAction({ type: RoomMetaInfoActionType.SetProgressToMax })
                    playRoundStartedNotification()
                    break
                }
                case ServerSentSocketMessageType.GameFinished: {
                    openGameFinishedModal()
                }
                // `gameFinished` event is the same as `roundFinished` event plus some extra logic
                // eslint-disable-next-line no-fallthrough
                case ServerSentSocketMessageType.RoundFinished: {
                    dispatchRoomMetaInfoAction({
                        type: RoomMetaInfoActionType.SetRoomStatus,
                        status: RoomStatusType.Waiting,
                    })
                    roomStatusRef.current = RoomStatusType.Waiting
                    submittedGuessRef.current = false
                    dispatchRoomMetaInfoAction({ type: RoomMetaInfoActionType.ResetProgress })
                    playRoundFinishedNotification()
                    refreshRoomUsersAndStatus(20)
                    dispatchRoomMetaInfoAction({
                        type: RoomMetaInfoActionType.SetShowLastRoundScore,
                        showLastRoundScore: true,
                    })
                    setTimeout(() => {
                        dispatchRoomMetaInfoAction({
                            type: RoomMetaInfoActionType.SetShowLastRoundScore,
                            showLastRoundScore: false,
                        })
                    }, 10000)
                    break
                }
                case ServerSentSocketMessageType.GuessSubmitted: {
                    await fetchAndSetUsers(roomId)
                    break
                }
                case ServerSentSocketMessageType.GuessRevoked: {
                    await fetchAndSetUsers(roomId)
                    break
                }
                case ServerSentSocketMessageType.UserMuted: {
                    await fetchAndSetUsers(roomId)
                    break
                }
                case ServerSentSocketMessageType.UserUnmuted: {
                    await fetchAndSetUsers(roomId)
                    break
                }
                case ServerSentSocketMessageType.UserBanned: {
                    if (message.payload.publicId === getPublicUserId()) {
                        showBannedFromRoomNotification(strings)
                        navigate("/")
                    }
                    await fetchAndSetUsers(roomId)
                    break
                }
                case ServerSentSocketMessageType.UserScoreChanged: {
                    await fetchAndSetUsers(roomId)
                    break
                }
                case ServerSentSocketMessageType.Pong:
                    break
                case ServerSentSocketMessageType.Tick:
                    dispatchRoomMetaInfoAction({ type: RoomMetaInfoActionType.SetProgress, progress: message.payload })
                    if ([3, 5, 10].includes(message.payload)) {
                        if (userGuessRef.current !== null) {
                            // @ts-expect-error: figure out why TS says property `.position` isn't present
                            const lat = userGuessRef.current.position.lat().toString()
                            // @ts-expect-error: figure out why TS says property `.position` isn't present
                            const lng = userGuessRef.current.position.lng().toString()
                            saveGuess(lat, lng, roomId)
                        } else {
                            console.error("[map]: user marker not found.")
                        }
                    }
                    if (message.payload === 1) {
                        if (userGuessRef.current !== null) {
                            // @ts-expect-error: figure out why TS says property `.position` isn't present
                            const lat = userGuessRef.current.position.lat().toString()
                            // @ts-expect-error: figure out why TS says property `.position` isn't present
                            const lng = userGuessRef.current.position.lng().toString()
                            submitGuess(lat, lng, roomId)
                        } else {
                            console.error("[map]: user marker not found.")
                        }
                    }
                    break
                default:
                    console.error(`[WS]: unknown or unexpected message type: ${JSON.stringify(message)}`)
            }
        }
        return setInterval(() => {
            sendMessage({ type: ClientSentSocketMessageType.Ping })
        }, 15 * 1000)
    }

    function sendMessage(message: ClientSentSocketMessage, retriesLeft: number = 3): void {
        const messageAsStr = JSON.stringify(message)
        if (socketRef.current === null || socketRef.current.readyState !== 1) {
            console.error(`[WS]: tried to send message ${messageAsStr} while socketRef is null or not in ready state`)
            if (message.type !== ClientSentSocketMessageType.ChatMessage) {
                return
            }
            if (retriesLeft > 0) {
                console.log("[WS]: retrying sending the message...")
                setTimeout(() => sendMessage(message, retriesLeft - 1), 1000)
            } else {
                console.error("[WS]: failed to send the message even after 3 attempts")
            }
            return
        }
        socketRef.current.send(messageAsStr)
    }

    function closeSocket(): void {
        if (socketRef.current === null) {
            console.error("[WS]: tried to close the socket while socketRef.current === null")
            return
        }
        console.log("[WS]: closing websocket connection...")
        socketRef.current.close()
    }

    return { connectionIsOk, sendMessage, closeSocket }
}

export const RoomSocketContext = createContext<RoomSocketControl | null>(null)
