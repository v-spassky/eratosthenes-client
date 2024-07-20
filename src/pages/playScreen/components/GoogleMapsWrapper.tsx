import { Wrapper } from "@googlemaps/react-wrapper"
import React, { ReactElement, ReactNode, useContext } from "react"
import { PrevApiKeyRefContext } from "state/map"
import getMapsApiKey from "utils/getMapsApiKey"
interface GoogleMapsWrapperProps {
    children: ReactNode
}

export default function GoogleMapsWrapper({ children }: GoogleMapsWrapperProps): ReactElement {
    const apiKey = getMapsApiKey()
    const prevApiKeyRef = useContext(PrevApiKeyRefContext)!

    if (prevApiKeyRef.current === "UNSET") {
        console.log(`[API key]: API key is unset. Setting it to "${apiKey}".`)
        prevApiKeyRef.current = apiKey
    }

    if (prevApiKeyRef.current !== apiKey) {
        console.log(`[API key]: API key has changed (${prevApiKeyRef.current} -> ${apiKey}). Reloading...`)
        // TODO: test this (changed from `window.location.reload(false)`)
        window.location.reload()
    }

    // `apiKey` may be `null` in which case the map will be in inverted colors and this is the intended behavior
    return <Wrapper apiKey={apiKey!}>{children}</Wrapper>
}
