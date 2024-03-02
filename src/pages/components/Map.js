import { Button, Tooltip } from "@nextui-org/react";
import { FaCheck } from "react-icons/fa6";

import GoogleMap from "../../utils/maps/GoogleMap.js";

function Map() {
    return (
        <div
            id="map"
            style={{
                position: "absolute", bottom: "20px", right: "20px", width: "500px", height: "300px", zIndex: 1,
                borderRadius: "10px", overflow: "hidden"
            }}
        >
            <GoogleMap />
            <Tooltip content="Подтвердить ответ">
                <Button isIconOnly color="primary" style={{ position: "absolute", bottom: "5px", right: "5px" }}>
                    <FaCheck />
                </Button>
            </Tooltip>
        </div>
    );
}

export default Map;
