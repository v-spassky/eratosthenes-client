import { ChatMessage, LatLng, User } from "models/all"

// TODO: enums for error codes

interface DecodePasscodeSuccessfulResponse {
    error: false
    publicId: string
}

interface DecodePasscodeErrorResponse {
    error: true
    publicId?: never
}

export type DecodePasscodeResponse = DecodePasscodeSuccessfulResponse | DecodePasscodeErrorResponse

interface CanConnectToRoomSuccessfulResponse {
    canConnect: true
    errorCode?: never
}

interface CanConnectToRoomErrorResponse {
    canConnect: false
    errorCode: string
}

export type CanConnectToRoomResponse = CanConnectToRoomSuccessfulResponse | CanConnectToRoomErrorResponse

// TODO: what if it errors out?
export interface IsUserTheHostResponse {
    isHost: boolean
}

// TODO: what if it errors out?
export interface CreateRoomResponse {
    roomId: string
}

interface RoomUsersSuccessfulResponse {
    error: true
    errorCode: string
    users?: never
    status?: never
}

export interface RoomStatusWaiting {
    waiting: { previousLocation: LatLng | null }
}

export interface RoomStatusPlaying {
    playing: { currentLocation: LatLng }
}

type RoomStatus = RoomStatusWaiting | RoomStatusPlaying

export function isRoomStatusPlaying(status: RoomStatus): status is RoomStatusPlaying {
    return "playing" in status
}

export function isRoomStatusWaiting(status: RoomStatus): status is RoomStatusWaiting {
    return "waiting" in status
}

interface RoomUsersErrorResponse {
    error: false
    errorCode?: never
    users: User[]
    status: RoomStatus
}

export type RoomUsersResponse = RoomUsersSuccessfulResponse | RoomUsersErrorResponse

interface RoomMessagesSuccessfulResponse {
    error: true
    errorCode: string
    messages?: never
}

interface RoomMessagesErrorResponse {
    error: false
    errorCode?: never
    messages: ChatMessage[]
}

export type RoomMessagesResponse = RoomMessagesSuccessfulResponse | RoomMessagesErrorResponse

interface SubmitGuessSuccessfulResponse {
    error: true
    errorCode: string
}

interface SubmitGuessErrorResponse {
    error: false
    errorCode?: never
}

export type SubmitGuessResponse = SubmitGuessSuccessfulResponse | SubmitGuessErrorResponse

interface RevokeGuessSuccessfulResponse {
    error: true
    errorCode: string
}

interface RevokeGuessErrorResponse {
    error: false
    errorCode?: never
}

export type RevokeGuessResponse = RevokeGuessSuccessfulResponse | RevokeGuessErrorResponse

interface MuteUserSuccessfulResponse {
    error: true
    errorCode: string
}

interface MuteUserErrorResponse {
    error: false
    errorCode?: never
}

export type MuteUserResponse = MuteUserSuccessfulResponse | MuteUserErrorResponse

interface UnmuteUserSuccessfulResponse {
    error: true
    errorCode: string
}

interface UnmuteUserErrorResponse {
    error: false
    errorCode?: never
}

export type UnmuteUserResponse = UnmuteUserSuccessfulResponse | UnmuteUserErrorResponse

interface BanUserSuccessfulResponse {
    error: true
    errorCode: string
}

interface BanUserErrorResponse {
    error: false
    errorCode?: never
}

export type BanUserResponse = BanUserSuccessfulResponse | BanUserErrorResponse

export interface HealthCheckResponse {
    error: boolean
}

interface ChangeScoreSuccessfulResponse {
    error: true
    errorCode: string
}

interface ChangeScoreErrorResponse {
    error: false
    errorCode?: never
}

export type ChangeScoreResponse = ChangeScoreSuccessfulResponse | ChangeScoreErrorResponse
