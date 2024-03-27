import { Progress } from "@nextui-org/react";
import { useTheme } from "next-themes";

export default function CountdownBar({ progress }) {
    const { theme, _setTheme } = useTheme();

    const backgroundColor = theme === "light" ? "white" : "black";

    function progressBarVisibility() {
        return progress > 0 ? "visible" : "hidden";
    }

    return (
        <div
            style={{
                width: "500px", height: "30px", backgroundColor: backgroundColor, borderRadius: "9999px",
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                visibility: progressBarVisibility(),
            }}
        >
            <Progress value={progress} style={{ padding: "10px" }} />
        </div>
    );
}
