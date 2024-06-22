import { Wrapper } from "@googlemaps/react-wrapper";
import getMapsApiKey from "utils/getMapsApiKey.js";

export default function GoogleMapsWrapper({ children, prevApiKeyRef }) {
    const apiKey = getMapsApiKey();

    if (prevApiKeyRef.current === "UNSET") {
        console.log(`[API key]: API key is unset. Setting it to "${apiKey}".`);
        prevApiKeyRef.current = apiKey;
    }

    if (prevApiKeyRef.current !== apiKey) {
        console.log(
            `[API key]: detected that API key has changed ("${prevApiKeyRef.current}" -> "${apiKey}"). Reloading...`,
        );
        window.location.reload(false);
    }

    return <Wrapper apiKey={apiKey}>{children}</Wrapper>;
}
