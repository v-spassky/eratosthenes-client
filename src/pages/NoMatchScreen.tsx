import { useLingui } from "@lingui/react"
import { Button } from "@nextui-org/react"
import React, { ReactElement } from "react"
import { useNavigate } from "react-router-dom"

export default function NoMatchScreen(): ReactElement {
    const navigate = useNavigate()
    const strings = useLingui()

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
                <h1>{strings.i18n._("somethingBadHappened")}</h1>
                <Button color="primary" style={{ width: "160px" }} onPress={() => navigate("/")}>
                    {strings.i18n._("returnHome")}
                </Button>
            </div>
        </div>
    )
}
