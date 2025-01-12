export type User = {
    publicId: string
    name: string
    avatarEmoji: string
    score: number
    isHost: boolean
    lastGuess: LatLng
    // TODO: rename so that it sounds more like a `boolean` (maybe `hasSubmittedGuess`)
    submittedGuess: boolean
    lastRoundScore: number
    isMuted: boolean
}

export enum RoomStatusType {
    Playing = "playing",
    Waiting = "waiting",
}

export enum ChatMessageType {
    FromPlayerChatMessage = "FromPlayerChatMessage",
    FromBotChatMessage = "FromBotChatMessage",
}

export type ChatMessage =
    | {
          type: ChatMessageType.FromPlayerChatMessage
          id: number
          authorName: string
          content: string
          attachmentIds: string[]
      }
    | { type: ChatMessageType.FromBotChatMessage; id: number; content: BotMessagePayload }

export enum BotMessagePayloadType {
    RoundStartedBotMsg = "RoundStartedBotMsg",
    RoundEndedBotMsg = "RoundEndedBotMsg",
    UserConnectedBotMsg = "UserConnectedBotMsg",
    UserDisconnectedBotMsg = "UserDisconnectedBotMsg",
}

// TODO: use camelCase.
export type BotMessagePayload =
    | { type: BotMessagePayloadType.RoundStartedBotMsg; payload: { round_number: number; rounds_per_game: number } }
    | { type: BotMessagePayloadType.RoundEndedBotMsg; payload: { round_number: number; rounds_per_game: number } }
    | { type: BotMessagePayloadType.UserConnectedBotMsg; payload: { username: string } }
    | { type: BotMessagePayloadType.UserDisconnectedBotMsg; payload: { username: string } }

export type LatLng = {
    lat: number
    lng: number
}

export enum ApiKeyStrategy {
    UseMyOwn = "useMyOwn",
    DoNotUse = "doNotUse",
    UseDefault = "useDefault",
}
