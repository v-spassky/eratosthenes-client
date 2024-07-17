export enum SocketMessageType {
    ChatMessage = "chatMessage",
    UserConnected = "userConnected",
    UserReConnected = "userReConnected",
    UserDisconnected = "userDisconnected",
    RoundStarted = "roundStarted",
    GameFinished = "gameFinished",
    RoundFinished = "roundFinished",
    GuessSubmitted = "guessSubmitted",
    GuessRevoked = "guessRevoked",
    UserMuted = "userMuted",
    UserUnmuted = "userUnmuted",
    UserBanned = "userBanned",
    UserScoreChanged = "userScoreChanged",
    Ping = "ping",
    Pong = "pong",
    Tick = "tick",
}

interface ChatMessagePayload {
    id: number
    from: string
    content: string
    isFromBot: boolean
}

interface BriefUserInfoPayload {
    username: string
    avatarEmoji: string
}

interface UserPubIdInfoPayload {
    publicId: string
}

export type SocketMessage =
    | { type: SocketMessageType.ChatMessage; payload: ChatMessagePayload }
    | { type: SocketMessageType.UserConnected; payload: BriefUserInfoPayload }
    | { type: SocketMessageType.UserReConnected; payload: BriefUserInfoPayload }
    | { type: SocketMessageType.UserDisconnected; payload: BriefUserInfoPayload }
    | { type: SocketMessageType.RoundStarted; payload: null }
    | { type: SocketMessageType.GameFinished; payload: null }
    | { type: SocketMessageType.RoundFinished; payload: null }
    | { type: SocketMessageType.GuessSubmitted; payload: null }
    | { type: SocketMessageType.GuessRevoked; payload: null }
    | { type: SocketMessageType.UserMuted; payload: null }
    | { type: SocketMessageType.UserUnmuted; payload: null }
    | { type: SocketMessageType.UserBanned; payload: UserPubIdInfoPayload }
    | { type: SocketMessageType.UserScoreChanged; payload: null }
    | { type: SocketMessageType.Ping; payload: null }
    | { type: SocketMessageType.Pong; payload: null }
    | { type: SocketMessageType.Tick; payload: number }
