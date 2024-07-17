import { Button } from "@nextui-org/react"
import React, { ReactElement } from "react"
import { useNavigate } from "react-router-dom"

export default function NoMatchScreen(): ReactElement {
    const navigate = useNavigate()

    return (
        <div
            id="homeScreen"
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "20px",
            }}
        >
            <div style={{ width: "500px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <h1>Ой-ой, произошло что-то нехорошее!</h1>
                <Button color="primary" style={{ width: "160px" }} onPress={() => navigate("/")}>
                    Вернуться домой
                </Button>
            </div>
        </div>
    )
}
