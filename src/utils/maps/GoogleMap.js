import { useEffect, useRef } from "react";

const DEFAULT_CENTER = { lat: 0.0, lng: 0.0 };
const DEFAULT_ZOOM = 1;

function GoogleMap() {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            new window.google.maps.Map(ref.current, {
                disableDefaultUI: true,
                center: DEFAULT_CENTER,
                zoom: DEFAULT_ZOOM,
                mapTypeId: window.google.maps.MapTypeId.SATELLITE,
            });
        }
    }, [ref]);

    return (
        <div
            ref={ref}
            style={{ width: "100%", height: "100%" }}
        />
    );
}

export default GoogleMap;
