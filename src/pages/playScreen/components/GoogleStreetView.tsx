import defaultStreetViewPosition from "constants/defaultStreetViewPosition"
import React, { MutableRefObject, ReactElement, useEffect, useRef } from "react"

interface GoogleStreetViewProps {
    streetViewRef: MutableRefObject<google.maps.StreetViewPanorama | null>
}

export default function GoogleStreetView({ streetViewRef }: GoogleStreetViewProps): ReactElement {
    const streetViewContainerRef = useRef(null)

    useEffect(() => {
        if (streetViewContainerRef.current !== null) {
            streetViewRef.current = new window.google.maps.StreetViewPanorama(streetViewContainerRef.current, {
                disableDefaultUI: true,
                position: defaultStreetViewPosition,
                pov: { heading: 0, pitch: 0 },
                zoom: 1,
                showRoadLabels: false,
            })
        }
    }, [streetViewContainerRef])

    return <div ref={streetViewContainerRef} style={{ width: "100%", height: "100%" }} />
}
