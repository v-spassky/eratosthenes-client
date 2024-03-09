import { useEffect, useRef } from "react";

const mapDefaultCenter = { lat: 0.0, lng: 0.0 };
const mapDefaultZoom = 1;
const mapMarkSvg = "M0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z";

export default function GoogleMap() {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    function setUserMarker(location) {
        const username = localStorage.getItem("username");
        let found = false;
        console.log("location:", location);
        markersRef.current.forEach((marker) => {
            console.log("marker.username:", marker.username);
            if (marker.username === username) {
                console.log("found!!!");
                marker.setPosition(location);
                found = true;
            }
        });
        if (!found) {
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
            markersRef.current.push(
                new window.google.maps.Marker({
                    position: location,
                    map: mapRef.current,
                    label: localStorage.getItem("selectedEmoji"),
                    icon: svgMarker,
                    username: username,
                })
            );
        }
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
