import { RoomStatusType } from "models/all"
import React, { createContext, MutableRefObject, ReactElement, useRef } from "react"

export const StreetViewRefContext = createContext<MutableRefObject<google.maps.StreetViewPanorama | null> | null>(null)
export const MapRefContext = createContext<MutableRefObject<google.maps.Map | null> | null>(null)
export const MapMarkersRefContext = createContext<MutableRefObject<google.maps.Marker[]> | null>(null)
export const UserGuessRefContext = createContext<MutableRefObject<google.maps.Marker | null> | null>(null)
export const SubmittedGuessRefContext = createContext<MutableRefObject<boolean> | null>(null)
export const PolyLinesRefRefContext = createContext<MutableRefObject<google.maps.Polyline[]> | null>(null)
export const PrevApiKeyRefContext = createContext<MutableRefObject<string | null> | null>(null)
export const RoomStatusRefContext = createContext<MutableRefObject<RoomStatusType> | null>(null)

export const unsetApiKey = "UNSET"

export function MapDataContextProvider({ children }: { children: ReactElement }): ReactElement {
    const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null)
    const mapRef = useRef<google.maps.Map | null>(null)
    const markersRef = useRef<google.maps.Marker[]>([])
    const userGuessRef = useRef<google.maps.Marker | null>(null)
    const submittedGuessRef = useRef<boolean>(false)
    const polyLinesRef = useRef<google.maps.Polyline[]>([])
    const prevApiKeyRef = useRef(unsetApiKey)
    const roomStatusRef = useRef(RoomStatusType.Waiting) // TODO: this duplicates the `roomMetaInfo.roomStatus`

    return (
        <StreetViewRefContext.Provider value={streetViewRef}>
            <MapRefContext.Provider value={mapRef}>
                <MapMarkersRefContext.Provider value={markersRef}>
                    <UserGuessRefContext.Provider value={userGuessRef}>
                        <SubmittedGuessRefContext.Provider value={submittedGuessRef}>
                            <PolyLinesRefRefContext.Provider value={polyLinesRef}>
                                <PrevApiKeyRefContext.Provider value={prevApiKeyRef}>
                                    <RoomStatusRefContext.Provider value={roomStatusRef}>
                                        {children}
                                    </RoomStatusRefContext.Provider>
                                </PrevApiKeyRefContext.Provider>
                            </PolyLinesRefRefContext.Provider>
                        </SubmittedGuessRefContext.Provider>
                    </UserGuessRefContext.Provider>
                </MapMarkersRefContext.Provider>
            </MapRefContext.Provider>
        </StreetViewRefContext.Provider>
    )
}
