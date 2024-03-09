import { Progress } from "@nextui-org/react";

export default function CountdownBar({ progress }) {
    function progressBarVisibility() {
        return progress > 0 ? "visible" : "hidden";
    }

    return (
        <div
            style={{
                width: "500px", height: "30px", backgroundColor: "white", borderRadius: "9999px", display: "flex",
                flexDirection: "column", justifyContent: "center", alignItems: "center", visibility: progressBarVisibility(),
            }}
        >
            <Progress value={progress} style={{ padding: "10px" }} />
        </div>
    );
}
