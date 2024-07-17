import {
    AcquireIdResponse,
    BanUserResponse,
    CanConnectToRoomResponse,
    ChangeScoreResponse,
    CreateRoomResponse,
    HealthCheckResponse,
    IsUserTheHostResponse,
    MuteUserResponse,
    RevokeGuessResponse,
    RoomMessagesResponse,
    RoomUsersResponse,
    SubmitGuessResponse,
    UnmuteUserResponse,
} from "api/responses"
import { getUserIds, getUsername, setUserIds } from "localStorage/storage"

const origin = process.env.REACT_APP_SERVER_ORIGIN

export async function canConnectToRoom(roomId: string): Promise<CanConnectToRoomResponse> {
    const [publicId, privateId] = getUserIds()
    const username = getUsername()
    return await fetch(`${origin}/rooms/${roomId}/can-connect?&username=${username}`, {
        headers: [
            ["Public-ID", publicId],
            ["Private-ID", privateId],
        ],
    }).then((response) => response.json())
}

export async function userIsHost(roomId: string): Promise<boolean> {
    const [publicId, privateId] = getUserIds()
    const response = await fetch(`${origin}/rooms/${roomId}/am-i-host`, {
        headers: [
            ["Public-ID", publicId],
            ["Private-ID", privateId],
        ],
    })
    const responseBody: IsUserTheHostResponse = await response.json()
    return responseBody.isHost
}

export async function createRoom(): Promise<string> {
    const [publicId, privateId] = getUserIds()
    const response = await fetch(`${origin}/rooms`, {
        method: "POST",
        headers: [
            ["Public-ID", publicId],
            ["Private-ID", privateId],
        ],
    })
    const responseBody: CreateRoomResponse = await response.json()
    return responseBody.roomId
}

export async function getUsersOfRoom(roomId: string): Promise<RoomUsersResponse> {
    const [publicId, privateId] = getUserIds()
    const response = await fetch(`${origin}/rooms/${roomId}/users`, {
        headers: [
            ["Public-ID", publicId],
            ["Private-ID", privateId],
        ],
    })
    const responseBody: RoomUsersResponse = await response.json()
    return responseBody
}

export async function getMessagesOfRoom(roomId: string): Promise<RoomMessagesResponse> {
    const [publicId, privateId] = getUserIds()
    const response = await fetch(`${origin}/rooms/${roomId}/messages`, {
        headers: [
            ["Public-ID", publicId],
            ["Private-ID", privateId],
        ],
    })
    const responseBody: RoomMessagesResponse = await response.json()
    return responseBody
}

// TODO: figure out how to pass `lat` and `lng` to warp as floats
export async function submitGuess(lat: number, lng: number, roomId: string): Promise<SubmitGuessResponse> {
    const [publicId, privateId] = getUserIds()
    const payload = { lat: lat.toString(), lng: lng.toString() }
    const response = await fetch(`${origin}/rooms/${roomId}/submit-guess`, {
        method: "POST",
        headers: [
            ["Public-ID", publicId],
            ["Private-ID", privateId],
            ["Content-Type", "application/json"],
        ],
        body: JSON.stringify(payload),
    })
    const responseBody: SubmitGuessResponse = await response.json()
    return responseBody
}

export async function revokeGuess(roomId: string): Promise<RevokeGuessResponse> {
    const [publicId, privateId] = getUserIds()
    const response = await fetch(`${origin}/rooms/${roomId}/revoke-guess`, {
        method: "POST",
        headers: [
            ["Public-ID", publicId],
            ["Private-ID", privateId],
        ],
    })
    const responseBody: RevokeGuessResponse = await response.json()
    return responseBody
}

export async function acquireUserIds(): Promise<void> {
    const response = await fetch(`${origin}/auth/acquire-ids`)
    const responseBody: AcquireIdResponse = await response.json()
    if (responseBody.error) {
        console.error("[auth]: failed to acquire an ID")
        return
    }
    setUserIds(responseBody.publicId, responseBody.privateId)
}

export async function muteUser(roomId: string, targetUserPublicId: string): Promise<MuteUserResponse> {
    const [publicId, privateId] = getUserIds()
    const response = await fetch(`${origin}/rooms/${roomId}/users/${targetUserPublicId}/mute`, {
        method: "POST",
        headers: [
            ["Public-ID", publicId],
            ["Private-ID", privateId],
        ],
    })
    const responseBody: MuteUserResponse = await response.json()
    return responseBody
}

export async function unmuteUser(roomId: string, targetUserPublicId: string): Promise<UnmuteUserResponse> {
    const [publicId, privateId] = getUserIds()
    const response = await fetch(`${origin}/rooms/${roomId}/users/${targetUserPublicId}/unmute`, {
        method: "POST",
        headers: [
            ["Public-ID", publicId],
            ["Private-ID", privateId],
        ],
    })
    const responseBody: UnmuteUserResponse = await response.json()
    return responseBody
}

export async function banUser(roomId: string, targetUserPublicId: string): Promise<BanUserResponse> {
    const [publicId, privateId] = getUserIds()
    const response = await fetch(`${origin}/rooms/${roomId}/users/${targetUserPublicId}/ban`, {
        method: "POST",
        headers: [
            ["Public-ID", publicId],
            ["Private-ID", privateId],
        ],
    })
    const responseBody: BanUserResponse = await response.json()
    return responseBody
}

export async function apiIsHealthy(): Promise<boolean> {
    const response = await fetch(`${origin}/health/check`)
    const responseBody: HealthCheckResponse = await response.json()
    return !responseBody.error
}

// TODO: figure out how to pass `amount` to Warp as int
export async function changeUserScore(
    roomId: string,
    targetUserPublicId: string,
    amount: number
): Promise<ChangeScoreResponse> {
    const [publicId, privateId] = getUserIds()
    const payload = { amount: String(amount) }
    const response = await fetch(`${origin}/rooms/${roomId}/users/${targetUserPublicId}/change-score`, {
        method: "POST",
        headers: [
            ["Public-ID", publicId],
            ["Private-ID", privateId],
            ["Content-Type", "application/json"],
        ],
        body: JSON.stringify(payload),
    })
    const responseBody: ChangeScoreResponse = await response.json()
    return responseBody
}
