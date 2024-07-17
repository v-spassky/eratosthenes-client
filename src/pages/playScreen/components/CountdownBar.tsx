import { Progress } from "@nextui-org/react"
import { useTheme } from "next-themes"
import React, { ReactElement } from "react"

interface CountdownBarProps {
    progress: number
}

export default function CountdownBar({ progress }: CountdownBarProps): ReactElement {
    const { theme } = useTheme()

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
            <Progress aria-label="Seconds left until round end" value={progress} style={{ padding: "10px" }} />
        </div>
    )
}
