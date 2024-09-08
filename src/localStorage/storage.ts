import { SupportedLocale } from "localization/all"
import { ApiKeyStrategy } from "models/all"

// TODO: refactor into object-oriented API

export function getUsername(): string | null {
    return localStorage.getItem("username")
}

export function setUsername(username: string): void {
    localStorage.setItem("username", username)
}

export function getPasscode(): string {
    return localStorage.getItem("passcode") || ""
}

export function setPasscode(passcode: string): void {
    localStorage.setItem("passcode", passcode)
}

export function getSelectedEmoji(): string | null {
    return localStorage.getItem("selectedEmoji")
}

export function setSelectedEmoji(emoji: string): void {
    localStorage.setItem("selectedEmoji", emoji)
}

export function getPublicUserId(): string {
    if (localStorage.getItem("publicUserId") === null) {
        console.error("Public user ID is missing!")
    }
    return localStorage.getItem("publicUserId") || ""
}

export function setPublicUserId(publicUserId: string): void {
    localStorage.setItem("publicUserId", publicUserId)
}

export function getApiKeyStrategy(): ApiKeyStrategy {
    const strategy = localStorage.getItem("apiKeyStrategy")
    if (strategy && Object.values(ApiKeyStrategy).includes(strategy as ApiKeyStrategy)) {
        return strategy as ApiKeyStrategy
    }
    return ApiKeyStrategy.UseDefault
}

export function setApiKeyStrategy(strategy: ApiKeyStrategy): void {
    localStorage.setItem("apiKeyStrategy", strategy)
}

export function getApiKey(): string | null {
    const rawApiKey = localStorage.getItem("apiKey")
    return rawApiKey === "null" ? null : rawApiKey
}

export function setApiKey(apiKey: string): void {
    localStorage.setItem("apiKey", apiKey)
}

export function getLastVisitedRoomId(): string | null {
    return localStorage.getItem("lastVisitedRoomId")
}

export function setLastVisitedRoomId(roomId: string): void {
    localStorage.setItem("lastVisitedRoomId", roomId)
}

const defaultMapWidth = 500

export function getMapWidth(): number {
    const rawMapWidth = localStorage.getItem("mapWidth")
    if (rawMapWidth === null) {
        return defaultMapWidth
    }
    return parseInt(rawMapWidth, 10)
}

export function setMapWidth(width: number): void {
    localStorage.setItem("mapWidth", width.toString())
}

const defaultMapHeight = 300

export function getMapHeight(): number {
    const rawMapHeight = localStorage.getItem("mapHeight")
    if (rawMapHeight === null) {
        return defaultMapHeight
    }
    return parseInt(rawMapHeight, 10)
}

export function setMapHeight(height: number): void {
    localStorage.setItem("mapHeight", height.toString())
}

export function getSelectedLanguage(): SupportedLocale {
    const selectedLanguage = localStorage.getItem("selectedLanguage")
    if (selectedLanguage) {
        return selectedLanguage as SupportedLocale
    }
    const userLocale = navigator.language || navigator.languages?.[0] || "unknown"
    if (userLocale.startsWith("ru")) {
        return "ru"
    }
    return "en"
}

export function setSelectedLanguage(language: string): void {
    localStorage.setItem("selectedLanguage", language)
}
