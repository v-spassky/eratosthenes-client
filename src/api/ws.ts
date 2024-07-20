import { canConnectToRoom, getUsersOfRoom, submitGuess } from "api/http"
import { SocketMessage, SocketMessageType } from "api/messageTypes"
import socketConnWaitRetryPeriodMs from "constants/socketConnWaitRetryPeriod"
import { getSelectedEmoji, getUserIds, getUsername } from "localStorage/storage"
import { RoomStatusType } from "models/all"
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
    sendMessage: (message: SocketMessage) => void
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
            showUnsetUsernameErrorNotification()
            navigate("/", { state: { roomId: roomId } })
            return
        }
        const checkIfCanConnect = async (): Promise<void> => {
            const canConnectResp = await canConnectToRoom(roomId)
            if (!canConnectResp.canConnect) {
                showFailedRoomConnectionNotification(canConnectResp.errorCode)
                navigate("/")
                return
            }
        }
        checkIfCanConnect()

        const pingInterval = connectToSocket(false)

        setTimeout(() => {
            const username = getUsername()
            if (username === null) {
                console.log("[storage]: could't get username from local storage")
                return
            }
            const payload: SocketMessage = {
                type: SocketMessageType.UserConnected,
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
                console.log("[storage]: could't get username from local storage")
                return
            }
            const payload: SocketMessage = {
                type: SocketMessageType.UserDisconnected,
                payload: { username, avatarEmoji: getSelectedEmoji() || "" },
            }
            sendMessage(payload)
            closeSocket()
            console.log("[WS]: clearing ping interval...")
            clearInterval(pingInterval)
        }
    }, [])

    function connectToSocket(isReconnect: boolean): NodeJS.Timeout {
        const [publicId, privateId] = getUserIds()
        socketRef.current = new WebSocket(
            `${process.env.REACT_APP_WS_SERVER_ORIGIN}/rooms/${roomId}?public_id=${publicId}&private_id=${privateId}`
        )
        socketRef.current.onopen = (): void => {
            console.log("[WS]: websocket connection established.")
            setConnectionIsOk(true)
            if (isReconnect) {
                const username = getUsername()
                if (username === null) {
                    console.log("[storage]: could't get username from local storage")
                    return
                }
                const payload: SocketMessage = {
                    type: SocketMessageType.UserReConnected,
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
            const message: SocketMessage = JSON.parse(event.data)
            switch (message.type) {
                case "chatMessage": {
                    if (!message.payload.isFromBot) {
                        playNewMessageNotification()
                    }
                    dispatchMessagesAction({
                        type: MessagesActionType.AddMessage,
                        message: { authorName: message.payload.from, ...message.payload },
                    })
                    break
                }
                case "userConnected": {
                    playUserConnectedNotification()
                    await fetchAndSetUsers(roomId)
                    break
                }
                case "userDisconnected": {
                    playUserDisconnectedNotification()
                    await fetchAndSetUsers(roomId)
                    break
                }
                case "roundStarted": {
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
                case "gameFinished": {
                    openGameFinishedModal()
                }
                // `gameFinished` event is the same as `roundFinished` event plus some extra logic
                // eslint-disable-next-line no-fallthrough
                case "roundFinished": {
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
                case "guessSubmitted": {
                    await fetchAndSetUsers(roomId)
                    break
                }
                case "guessRevoked": {
                    await fetchAndSetUsers(roomId)
                    break
                }
                case "userMuted": {
                    await fetchAndSetUsers(roomId)
                    break
                }
                case "userUnmuted": {
                    await fetchAndSetUsers(roomId)
                    break
                }
                case "userBanned": {
                    const [publicId, _privateId] = getUserIds()
                    if (message.payload.publicId === publicId) {
                        showBannedFromRoomNotification()
                        navigate("/")
                    }
                    await fetchAndSetUsers(roomId)
                    break
                }
                case "userScoreChanged": {
                    await fetchAndSetUsers(roomId)
                    break
                }
                case "ping":
                    break
                case "pong":
                    break
                case "tick":
                    dispatchRoomMetaInfoAction({ type: RoomMetaInfoActionType.SetProgress, progress: message.payload })
                    if (message.payload === 1) {
                        if (userGuessRef.current !== null) {
                            // @ts-expect-error: figure out why TS says property `.position` isn't present
                            const lat = userGuessRef.current.position.lat().toString()
                            // @ts-expect-error: figure out why TS says property `.position` isn't present
                            const lng = userGuessRef.current.position.lng().toString()
                            submitGuess(lat, lng, roomId)
                        } else {
                            console.error("[map]: user marker not found.")
                            // TODO: show error
                        }
                    }
                    break
                default:
                    console.error(`[WS]: unknown or unexpected message type: ${message.type}`)
            }
        }
        return setInterval(() => {
            sendMessage({ type: SocketMessageType.Ping, payload: null })
        }, 5 * 1000)
    }

    function sendMessage(message: SocketMessage): void {
        const messageAsStr = JSON.stringify(message)
        if (socketRef.current === null) {
            console.error(`[WS]: tried to send message ${messageAsStr} while socketRef.current === null`)
            return
        }
        if (socketRef.current.readyState !== 1) {
            console.error(`[WS]: tried to send message ${messageAsStr} while socketRef.current.readyState !== 1`)
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
