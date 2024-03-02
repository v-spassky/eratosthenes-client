import { Wrapper } from "@googlemaps/react-wrapper";

function GoogleMapsWrapper({ children }) {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return <div>Cannot display the map: Google Maps API key missing.</div>;
    }

    return <Wrapper apiKey={apiKey}>{children}</Wrapper>;
}

export default GoogleMapsWrapper;
