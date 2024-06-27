import { getApiKey, getApiKeyStrategy } from "localStorage/storage";

export default function getMapsApiKey() {
    switch (getApiKeyStrategy()) {
        case "useMyOwn":
            return getApiKey();
        case "doNotUse":
            return null;
        case "useDefault":
            return process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        default:
            console.error(`[API key]: unknown API key strategy: ${getApiKeyStrategy()}`);
            return process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    }
}
