import Map from './Map.js';
import GoogleStreetView from '../../utils/maps/GoogleStreetView.js';
import GoogleMapsWrapper from "../../utils/maps/GoogleMapsWrapper.js";

function StreetViewWindow() {
    return (
        <div id="streetViewWindow" style={{ height: "100%", flexGrow: 1, position: "relative" }}>
            <GoogleMapsWrapper>
                <GoogleStreetView />
                <Map />
            </GoogleMapsWrapper>
        </div>
    );
}

export default StreetViewWindow;
