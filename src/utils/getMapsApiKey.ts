import { getApiKey, getApiKeyStrategy } from "localStorage/storage"
import { ApiKeyStrategy } from "models/all"

export default function getMapsApiKey(): string | null {
    switch (getApiKeyStrategy()) {
        case ApiKeyStrategy.UseMyOwn:
            return getApiKey()
        case ApiKeyStrategy.DoNotUse:
            return null
        case ApiKeyStrategy.UseDefault:
            return process.env.REACT_APP_GOOGLE_MAPS_API_KEY!
        default:
            console.error(`[API key]: unknown API key strategy: ${getApiKeyStrategy()}`)
            return process.env.REACT_APP_GOOGLE_MAPS_API_KEY!
    }
}
