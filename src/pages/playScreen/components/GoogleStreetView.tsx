import defaultStreetViewPosition from "constants/defaultStreetViewPosition"
import React, { ReactElement, useContext, useEffect, useRef } from "react"
import { StreetViewRefContext } from "state/map"

export default function GoogleStreetView(): ReactElement {
    const streetViewRef = useContext(StreetViewRefContext)!
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
