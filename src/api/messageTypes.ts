import { BotMessagePayload } from "models/all"

export type ClientSentSocketMessage =
    | { type: ClientSentSocketMessageType.ChatMessage; payload: OutgoingChatMessagePayload }
    | { type: ClientSentSocketMessageType.UserConnected; payload: BriefUserInfoPayload }
    | { type: ClientSentSocketMessageType.UserReConnected; payload: BriefUserInfoPayload }
    | { type: ClientSentSocketMessageType.UserDisconnected; payload: BriefUserInfoPayload }
    | { type: ClientSentSocketMessageType.RoundStarted }
    | { type: ClientSentSocketMessageType.Ping }

export enum ClientSentSocketMessageType {
    ChatMessage = "ChatMessage",
    UserConnected = "UserConnected",
    UserDisconnected = "UserDisconnected",
    UserReConnected = "UserReConnected",
    RoundStarted = "RoundStarted",
    Ping = "Ping",
}

export type ServerSentSocketMessage =
    | { type: ServerSentSocketMessageType.ChatMessage; payload: IncomingChatMessagePayload }
    | { type: ServerSentSocketMessageType.BotMessage; id: number; payload: BotMessagePayload }
    | { type: ServerSentSocketMessageType.UserConnected; payload: BriefUserInfoPayload }
    | { type: ServerSentSocketMessageType.UserDisconnected; payload: BriefUserInfoPayload }
    | { type: ServerSentSocketMessageType.RoundStarted }
    | { type: ServerSentSocketMessageType.GameFinished }
    | { type: ServerSentSocketMessageType.RoundFinished }
    | { type: ServerSentSocketMessageType.GuessSubmitted }
    | { type: ServerSentSocketMessageType.GuessRevoked }
    | { type: ServerSentSocketMessageType.UserMuted }
    | { type: ServerSentSocketMessageType.UserUnmuted }
    | { type: ServerSentSocketMessageType.UserBanned; payload: UserPubIdInfoPayload }
    | { type: ServerSentSocketMessageType.UserScoreChanged }
    | { type: ServerSentSocketMessageType.Pong }
    | { type: ServerSentSocketMessageType.Tick; payload: number }

export enum ServerSentSocketMessageType {
    ChatMessage = "ChatMessage",
    BotMessage = "BotMessage",
    UserConnected = "UserConnected",
    UserDisconnected = "UserDisconnected",
    RoundStarted = "RoundStarted",
    GameFinished = "GameFinished",
    RoundFinished = "RoundFinished",
    GuessSubmitted = "GuessSubmitted",
    GuessRevoked = "GuessRevoked",
    UserMuted = "UserMuted",
    UserUnmuted = "UserUnmuted",
    UserBanned = "UserBanned",
    UserScoreChanged = "UserScoreChanged",
    Pong = "Pong",
    Tick = "Tick",
}

interface OutgoingChatMessagePayload {
    from: string // TODO: remove this, get username on the server
    content: string
}

interface IncomingChatMessagePayload {
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
