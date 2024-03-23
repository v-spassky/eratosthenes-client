import { useEffect, useRef } from "react";

import defaultStreetViewPosition from "../../constants/defaultStreetViewPosition.js";

export default function GoogleStreetView({ streetViewRef }) {
    const streetViewContainerRef = useRef(null);

    useEffect(() => {
        if (streetViewContainerRef.current) {
            streetViewRef.current = new window.google.maps.StreetViewPanorama(streetViewContainerRef.current, {
                disableDefaultUI: true,
                position: defaultStreetViewPosition,
                pov: { heading: 0, pitch: 0 },
                zoom: 1,
            });
        }
    }, [streetViewContainerRef]);

    return <div ref={streetViewContainerRef} style={{ width: "100%", height: "100%" }}/>;
}
