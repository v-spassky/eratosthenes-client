import { Progress } from "@nextui-org/react"
import { useTheme } from "next-themes"
import React, { ReactElement, useContext } from "react"
import { RoomMetaInfoContext } from "state/roomMetaInfo"

export default function CountdownBar(): ReactElement {
    const { theme } = useTheme()
    const { progress } = useContext(RoomMetaInfoContext)

    const backgroundColor = theme === "light" ? "white" : "black"

    function progressBarVisibility(): "visible" | "hidden" {
        return progress > 0 ? "visible" : "hidden"
    }

    return (
        <div
            style={{
                width: "500px",
                height: "30px",
                backgroundColor: backgroundColor,
                borderRadius: "9999px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                visibility: progressBarVisibility(),
            }}
        >
            <Progress aria-label="seconds-left-until-round-end" value={progress} style={{ padding: "10px" }} />
        </div>
    )
}
