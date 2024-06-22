import mapMarkSvg from "constants/mapMarkSvg.js";
import { useEffect, useRef } from "react";

const mapDefaultCenter = { lat: 0.0, lng: 0.0 };
const mapDefaultZoom = 1;

export default function GoogleMap({ mapRef, roomStatusRef, userGuessRef, submittedGuessRef }) {
    const mapContainerRef = useRef(null);

    function setUserMarker(location) {
        if (roomStatusRef.current !== "playing") {
            return;
        }
        if (submittedGuessRef.current) {
            return;
        }
        const username = localStorage.getItem("username");
        if (userGuessRef.current !== null) {
            userGuessRef.current.setPosition(location);
            return;
        }
        const svgMarker = {
            path: mapMarkSvg,
            fillColor: "#0070F0",
            fillOpacity: 1,
            strokeWeight: 0,
            rotation: 0,
            scale: 2,
            anchor: new window.google.maps.Point(0, 20),
            labelOrigin: new window.google.maps.Point(0, 7),
        };
        userGuessRef.current = new window.google.maps.Marker({
            position: location,
            map: mapRef.current,
            label: localStorage.getItem("selectedEmoji") || localStorage.getItem("username").slice(0, 3),
            icon: svgMarker,
            username: username,
        });
    }

    useEffect(() => {
        if (mapContainerRef.current) {
            mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
                disableDefaultUI: true,
                center: mapDefaultCenter,
                zoom: mapDefaultZoom,
                mapTypeId: window.google.maps.MapTypeId.SATELLITE,
            });
            window.google.maps.event.addListener(mapRef.current, "click", (event) => {
                setUserMarker(event.latLng);
            });
        }
    }, [mapContainerRef]);

    return <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />;
}
