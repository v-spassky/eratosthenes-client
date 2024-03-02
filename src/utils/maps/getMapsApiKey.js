export default function getMapsApiKey() {
    switch (localStorage.getItem("apiKeyStrategy")) {
        case "useMyOwn":
            return localStorage.getItem("apiKey");
        case "doNotUse":
            return null;
        case "useDefault":
            return process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        default:
            console.error(`Unknown apiKeyStrategy: ${localStorage.getItem("apiKeyStrategy")}`);
            return process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    }
}
