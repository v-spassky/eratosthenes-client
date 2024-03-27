import GoogleMap from "../../utils/maps/GoogleMap.js";

export default function Map({ mapRef, markersRef, roomStatusRef }) {
    return (
        <div
            id="map"
            style={{
                position: "absolute", bottom: "20px", right: "20px", width: "500px", height: "300px", zIndex: 1,
                borderRadius: "10px", overflow: "hidden"
            }}
        >
            <GoogleMap mapRef={mapRef} markersRef={markersRef} roomStatusRef={roomStatusRef}/>
        </div>
    );
}
