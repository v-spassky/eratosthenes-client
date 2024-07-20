import mapMarkSvg from "constants/mapMarkSvg"
import { getSelectedEmoji, getUsername } from "localStorage/storage"
import { RoomStatusType } from "models/all"
import React, { ReactElement, useContext, useEffect, useRef } from "react"
import { MapRefContext } from "state/map"
import { RoomStatusRefContext, SubmittedGuessRefContext, UserGuessRefContext } from "state/map"

const mapDefaultCenter = { lat: 0.0, lng: 0.0 }
const mapDefaultZoom = 1

export default function GoogleMap(): ReactElement {
    const mapContainerRef = useRef(null)
    const mapRef = useContext(MapRefContext)!
    const userGuessRef = useContext(UserGuessRefContext)!
    const submittedGuessRef = useContext(SubmittedGuessRefContext)!
    const roomStatusRef = useContext(RoomStatusRefContext)!

    function setUserMarker(location: google.maps.LatLng | google.maps.LatLngLiteral): void {
        if (roomStatusRef.current !== RoomStatusType.Playing) {
            return
        }
        if (submittedGuessRef.current) {
            return
        }
        const username = getUsername()
        if (username === null) {
            console.log("[storage]: could't get username from local storage")
            return
        }
        if (userGuessRef.current !== null) {
            userGuessRef.current.setPosition(location)
            return
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
        }
        userGuessRef.current = new window.google.maps.Marker({
            position: location,
            map: mapRef.current,
            label: getSelectedEmoji() || username.slice(0, 3),
            icon: svgMarker,
            // @ts-expect-error: this is monkey-patching the `Marker` object with custom properties
            username,
        })
    }

    useEffect(() => {
        if (mapContainerRef.current) {
            mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
                disableDefaultUI: true,
                center: mapDefaultCenter,
                zoom: mapDefaultZoom,
                mapTypeId: window.google.maps.MapTypeId.SATELLITE,
            })
            window.google.maps.event.addListener(mapRef.current, "click", (event: google.maps.MapMouseEvent) => {
                if (event.latLng === null) {
                    console.log("[map]: event.latLng is null")
                    return
                }
                setUserMarker(event.latLng)
            })
        }
    }, [mapContainerRef])

    return <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
}
