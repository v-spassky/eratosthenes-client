export type User = {
    publicId: string
    name: string
    avatarEmoji: string
    score: number
    isHost: boolean
    description: string
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

export type ChatMessage = {
    id: number
    authorName: string
    content: string
    isFromBot: boolean
}

export type LatLng = {
    lat: number
    lng: number
}

export enum ApiKeyStrategy {
    UseMyOwn = "useMyOwn",
    DoNotUse = "doNotUse",
    UseDefault = "useDefault",
}
