export default function getMapsApiKey() {
    switch (localStorage.getItem("apiKeyStrategy")) {
        case "useMyOwn":
            return localStorage.getItem("apiKey");
        case "doNotUse":
            return null;
        case "useDefault":
            return process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        default:
            console.error(`[API key]: unknown API key strategy: ${localStorage.getItem("apiKeyStrategy")}`);
            return process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    }
}
