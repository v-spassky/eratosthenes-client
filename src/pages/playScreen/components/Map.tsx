import { Button, Tooltip } from "@nextui-org/react"
import {
    getMapHeight,
    getMapWidth,
    setMapHeight as setMapHeightInStorage,
    setMapWidth as setMapWidthInStorage,
} from "localStorage/storage"
import GoogleMap from "pages/playScreen/components/GoogleMap"
import React, { MouseEvent, MutableRefObject, ReactElement, useEffect, useState } from "react"
import { FaArrowRightArrowLeft } from "react-icons/fa6"
import { FaCheck } from "react-icons/fa6"
import { FaArrowRotateLeft } from "react-icons/fa6"

interface MapProps {
    mapRef: MutableRefObject<google.maps.Map | null>
    roomStatusRef: MutableRefObject<string>
    userGuessRef: MutableRefObject<google.maps.Marker | null>
    handleConfirmAnswer: () => void
    handleRevokeAnswer: () => void
    submittedGuessRef: MutableRefObject<boolean>
}

const maxMapWidth = 1200
const maxMapHeight = 800
const minMapWidth = 200
const minMapHeight = 150

export default function Map({
    mapRef,
    roomStatusRef,
    userGuessRef,
    handleConfirmAnswer,
    handleRevokeAnswer,
    submittedGuessRef,
}: MapProps): ReactElement {
    const [resizing, setResizing] = useState(false)
    const [initialX, setInitialX] = useState(0)
    const [initialY, setInitialY] = useState(0)
    const [mapWidth, setMapWidth] = useState(getMapWidth())
    const [mapHeight, setMapHeight] = useState(getMapHeight())

    const handleMouseDown = (event: MouseEvent): void => {
        setResizing(true)
        setInitialX(event.clientX)
        setInitialY(event.clientY)
    }

    const handleMouseMove = (event: globalThis.MouseEvent): void => {
        if (resizing) {
            const deltaX = event.clientX - initialX
            const deltaY = event.clientY - initialY
            if (
                mapWidth - deltaX > maxMapWidth ||
                mapWidth - deltaX < minMapWidth ||
                mapHeight - deltaY > maxMapHeight ||
                mapHeight - deltaY < minMapHeight
            ) {
                return
            }
            setMapWidth(mapWidth - deltaX)
            setMapHeight(mapHeight - deltaY)
            setInitialX(event.clientX)
            setInitialY(event.clientY)
        }
    }

    const handleMouseUp = (): void => {
        setResizing(false)
        setMapWidthInStorage(mapWidth)
        setMapHeightInStorage(mapHeight)
    }

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseup", handleMouseUp)
        return (): void => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [resizing])

    const confirmGuessBtn = (): ReactElement => {
        if (userGuessRef.current === null) {
            return (
                <Tooltip content="Подтвердить ответ">
                    <Button
                        aria-label="Submit guess"
                        isDisabled
                        onClick={handleConfirmAnswer}
                        isIconOnly
                        color="primary"
                        style={{ position: "absolute", bottom: "5px", right: "5px" }}
                    >
                        <FaCheck />
                    </Button>
                </Tooltip>
            )
        }
        const btnIcon = submittedGuessRef.current ? <FaArrowRotateLeft /> : <FaCheck />
        const btnTooltip = submittedGuessRef.current ? "Отменить ответ" : "Подтвердить ответ"
        const btnOnClick = submittedGuessRef.current ? handleRevokeAnswer : handleConfirmAnswer
        return (
            <Tooltip content={btnTooltip}>
                <Button
                    aria-label="Submit or revoke guess"
                    onClick={btnOnClick}
                    isIconOnly
                    color="primary"
                    style={{ position: "absolute", bottom: "5px", right: "5px" }}
                >
                    {btnIcon}
                </Button>
            </Tooltip>
        )
    }

    return (
        <div
            id="map"
            style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                width: mapWidth,
                height: mapHeight,
                zIndex: 1,
                borderRadius: "10px",
                overflow: "hidden",
            }}
        >
            <GoogleMap
                mapRef={mapRef}
                roomStatusRef={roomStatusRef}
                userGuessRef={userGuessRef}
                submittedGuessRef={submittedGuessRef}
            />
            {roomStatusRef.current === "playing" && confirmGuessBtn()}
            <div
                style={{
                    position: "absolute",
                    top: "6px",
                    left: "6px",
                    width: "20px",
                    height: "20px",
                    zIndex: 2,
                    backgroundColor: "#0070F0",
                    borderRadius: "100px",
                    cursor: "se-resize",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
                onMouseDown={handleMouseDown}
            >
                <FaArrowRightArrowLeft style={{ transform: "rotate(45deg)", color: "white" }} />
            </div>
        </div>
    )
}
