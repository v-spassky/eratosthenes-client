import { Button, Tooltip } from "@nextui-org/react";
import { FaCheck } from "react-icons/fa6";

import GoogleMap from "../../utils/maps/GoogleMap.js";

export default function Map({ mapRef, markersRef, handleConfirmAnswer, roomStatusRef }) {
    return (
        <div
            id="map"
            style={{
                position: "absolute", bottom: "20px", right: "20px", width: "500px", height: "300px", zIndex: 1,
                borderRadius: "10px", overflow: "hidden"
            }}
        >
            <GoogleMap mapRef={mapRef} markersRef={markersRef} roomStatusRef={roomStatusRef}/>
            {roomStatusRef.current === "playing" &&
                <Tooltip content="Подтвердить ответ">
                    <Button
                        onClick={handleConfirmAnswer}
                        isIconOnly
                        color="primary"
                        style={{ position: "absolute", bottom: "5px", right: "5px" }}
                    >
                        <FaCheck />
                    </Button>
                </Tooltip>
            }
        </div>
    );
}
