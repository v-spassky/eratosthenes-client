import React, { useEffect, useRef } from "react";

const DEFAULT_POSITION = { lat: 44.8566, lng: 10.3522 };

function GoogleStreetView() {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            new window.google.maps.StreetViewPanorama(ref.current, {
                disableDefaultUI: true,
                position: DEFAULT_POSITION,
                pov: { heading: 0, pitch: 0 },
                zoom: 1,
            });
        }
    }, [ref]);

    return (
        <div
            ref={ref}
            style={{ width: "100%", height: "100%" }}
        />
    );
};

export default GoogleStreetView;
