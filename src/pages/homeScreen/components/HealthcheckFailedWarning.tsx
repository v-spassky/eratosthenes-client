import { useLingui } from "@lingui/react"
import useHealth from "hooks/apiHealth"
import React, { ReactElement } from "react"

export default function HealthcheckFailedWarning(): ReactElement {
    const strings = useLingui()
    const [healthy, _checkingHealth] = useHealth()

    if (healthy) {
        return <></>
    }

    return (
        <div
            style={{
                color: "red",
                border: "solid",
                borderWidth: "1px",
                borderRadius: "12px",
                height: "40px",
                padding: "12px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {strings.i18n._("serverIsUnreachable")}
        </div>
    )
}
