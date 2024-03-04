import { useEffect, useRef } from "react";

import defaultStreetViewPosition from "../../constants/defaultStreetViewPosition.js";

function GoogleStreetView() {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            new window.google.maps.StreetViewPanorama(ref.current, {
                disableDefaultUI: true,
                position: defaultStreetViewPosition,
                pov: { heading: 0, pitch: 0 },
                zoom: 1,
            });
        }
    }, [ref]);

    return <div ref={ref} style={{ width: "100%", height: "100%" }}/>;
}

export default GoogleStreetView;
