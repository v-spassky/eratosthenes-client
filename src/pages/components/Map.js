import { useState } from "react";
import { FaArrowRightArrowLeft } from "react-icons/fa6";

import GoogleMap from "../../utils/maps/GoogleMap.js";

const defaultMapWidth = 500;
const defaultMapHeight = 300;
const maxMapWidth = 1200;
const maxMapHeight = 800;
const minMapWidth = 200;
const minMapHeight = 150;

export default function Map({ mapRef, markersRef, roomStatusRef }) {
    const [resizing, setResizing] = useState(false);
    const [initialX, setInitialX] = useState(0);
    const [initialY, setInitialY] = useState(0);
    const [mapWidth, setMapWidth] = useState(() => parseInt(localStorage.getItem("mapWidth"), 10) || defaultMapWidth);
    const [mapHeight, setMapHeight] = useState(() => {
        return parseInt(localStorage.getItem("mapHeight"), 10) || defaultMapHeight;
    });

    const handleMouseDown = (event) => {
        setResizing(true);
        setInitialX(event.clientX);
        setInitialY(event.clientY);
    };

    const handleMouseMove = (event) => {
        if (resizing) {
            const deltaX = event.clientX - initialX;
            const deltaY = event.clientY - initialY;
            if (
                mapWidth - deltaX > maxMapWidth
                || mapWidth - deltaX < minMapWidth
                || mapHeight - deltaY > maxMapHeight
                || mapHeight - deltaY < minMapHeight
            ) {
                return;
            }
            setMapWidth(mapWidth - deltaX);
            setMapHeight(mapHeight - deltaY);
            setInitialX(event.clientX);
            setInitialY(event.clientY);
        }
    };

    const handleMouseUp = () => {
        setResizing(false);
        localStorage.setItem("mapWidth", mapWidth);
        localStorage.setItem("mapHeight", mapHeight);
    };

    return (
        <div
            id="map"
            style={{
                position: "absolute", bottom: "20px", right: "20px", width: mapWidth, height: mapHeight, zIndex: 1,
                borderRadius: "10px", overflow: "hidden",
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <GoogleMap mapRef={mapRef} markersRef={markersRef} roomStatusRef={roomStatusRef} />
            <div
                style={{
                    position: "absolute", top: "6px", left: "6px", width: "20px", height: "20px", zIndex: 2,
                    backgroundColor: "blue", borderRadius: "100px", cursor: "se-resize", display: "flex",
                    justifyContent: "center", alignItems: "center",
                }}
                onMouseDown={handleMouseDown}
            >
                <FaArrowRightArrowLeft style={{ transform: "rotate(45deg)", color: "white" }} />
            </div>
        </div>
    );
}
