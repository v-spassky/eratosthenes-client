import {
    BanUserResponse,
    CanConnectToRoomResponse,
    ChangeScoreResponse,
    CreateRoomResponse,
    DecodePasscodeResponse,
    HealthCheckResponse,
    IsUserTheHostResponse,
    MuteUserResponse,
    RevokeGuessResponse,
    RoomMessagesResponse,
    RoomUsersResponse,
    SubmitGuessResponse,
    UnmuteUserResponse,
} from "api/responses"
import { getPasscode, getUsername } from "localStorage/storage"

const origin = process.env.REACT_APP_SERVER_ORIGIN

let debounceTimeout: NodeJS.Timeout | null = null
const debounceDelay = 1500

export async function decodePasscode(): Promise<DecodePasscodeResponse | null> {
    if (debounceTimeout) {
        clearTimeout(debounceTimeout)
    }
    return new Promise<DecodePasscodeResponse | null>((resolve, _reject) => {
        debounceTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`${origin}/auth/passcode/decode`, {
                    headers: [["Passcode", getPasscode()]],
                })
                if (response.status !== 200) {
                    console.error("Failed to decode the current passcode.")
                    resolve(null)
                    return
                }
                resolve(await response.json())
            } catch (error) {
                resolve(null)
            }
        }, debounceDelay)
    })
}

export async function canConnectToRoom(roomId: string): Promise<CanConnectToRoomResponse> {
    const username = getUsername()
    return await fetch(`${origin}/rooms/${roomId}/can-connect?username=${username}`, {
        headers: [["Passcode", getPasscode()]],
    }).then((response) => response.json())
}

export async function userIsHost(roomId: string): Promise<boolean> {
    const response = await fetch(`${origin}/rooms/${roomId}/am-i-host`, {
        headers: [["Passcode", getPasscode()]],
    })
    const responseBody: IsUserTheHostResponse = await response.json()
    return responseBody.isHost
}

export async function createRoom(): Promise<string> {
    const response = await fetch(`${origin}/rooms`, {
        method: "POST",
        headers: {
            Passcode: getPasscode(),
        },
    })
    const responseBody: CreateRoomResponse = await response.json()
    return responseBody.roomId
}

export async function getUsersOfRoom(roomId: string): Promise<RoomUsersResponse> {
    const response = await fetch(`${origin}/rooms/${roomId}/users`, {
        headers: [["Passcode", getPasscode()]],
    })
    const responseBody: RoomUsersResponse = await response.json()
    return responseBody
}

export async function getMessagesOfRoom(roomId: string): Promise<RoomMessagesResponse> {
    const response = await fetch(`${origin}/rooms/${roomId}/messages`, {
        headers: [["Passcode", getPasscode()]],
    })
    const responseBody: RoomMessagesResponse = await response.json()
    return responseBody
}

export async function saveGuess(lat: number, lng: number, roomId: string): Promise<SubmitGuessResponse> {
    const payload = { lat, lng }
    const response = await fetch(`${origin}/rooms/${roomId}/save-guess`, {
        method: "POST",
        headers: [
            ["Passcode", getPasscode()],
            ["Content-Type", "application/json"],
        ],
        body: JSON.stringify(payload),
    })
    const responseBody: SubmitGuessResponse = await response.json()
    return responseBody
}

export async function submitGuess(lat: number, lng: number, roomId: string): Promise<SubmitGuessResponse> {
    const payload = { lat, lng }
    const response = await fetch(`${origin}/rooms/${roomId}/submit-guess`, {
        method: "POST",
        headers: [
            ["Passcode", getPasscode()],
            ["Content-Type", "application/json"],
        ],
        body: JSON.stringify(payload),
    })
    const responseBody: SubmitGuessResponse = await response.json()
    return responseBody
}

export async function revokeGuess(roomId: string): Promise<RevokeGuessResponse> {
    const response = await fetch(`${origin}/rooms/${roomId}/revoke-guess`, {
        method: "POST",
        headers: [["Passcode", getPasscode()]],
    })
    const responseBody: RevokeGuessResponse = await response.json()
    return responseBody
}

export async function muteUser(roomId: string, targetUserPublicId: string): Promise<MuteUserResponse> {
    const response = await fetch(`${origin}/rooms/${roomId}/users/${targetUserPublicId}/mute`, {
        method: "POST",
        headers: [["Passcode", getPasscode()]],
    })
    const responseBody: MuteUserResponse = await response.json()
    return responseBody
}

export async function unmuteUser(roomId: string, targetUserPublicId: string): Promise<UnmuteUserResponse> {
    const response = await fetch(`${origin}/rooms/${roomId}/users/${targetUserPublicId}/unmute`, {
        method: "POST",
        headers: [["Passcode", getPasscode()]],
    })
    const responseBody: UnmuteUserResponse = await response.json()
    return responseBody
}

export async function banUser(roomId: string, targetUserPublicId: string): Promise<BanUserResponse> {
    const response = await fetch(`${origin}/rooms/${roomId}/users/${targetUserPublicId}/ban`, {
        method: "POST",
        headers: [["Passcode", getPasscode()]],
    })
    const responseBody: BanUserResponse = await response.json()
    return responseBody
}

export async function apiIsHealthy(): Promise<boolean> {
    const response = await fetch(`${origin}/health/check`)
    const responseBody: HealthCheckResponse = await response.json()
    return !responseBody.error
}

export async function changeUserScore(
    roomId: string,
    targetUserPublicId: string,
    amount: number
): Promise<ChangeScoreResponse> {
    const payload = { amount }
    const response = await fetch(`${origin}/rooms/${roomId}/users/${targetUserPublicId}/change-score`, {
        method: "POST",
        headers: [
            ["Passcode", getPasscode()],
            ["Content-Type", "application/json"],
        ],
        body: JSON.stringify(payload),
    })
    const responseBody: ChangeScoreResponse = await response.json()
    return responseBody
}

export async function uploadImages(images: Array<{ id: string; url: string }>): Promise<void> {
    const formData = new FormData()

    for (const img of images) {
        try {
            const response = await fetch(img.url)
            const blob = await response.blob()
            formData.append(`image-${img.id}`, blob, `image-${img.id}.png`)
        } catch (error) {
            console.error(`[media]: Failed to fetch blob for image ${img.id}:`, error)
        } finally {
            URL.revokeObjectURL(img.url)
        }
    }

    const response = await fetch(`${origin}/uploads/images`, {
        method: "POST",
        headers: {
            Passcode: getPasscode(),
        },
        body: formData,
    })

    if (!response.ok) {
        throw new Error("Failed to upload images")
    }
}
