import { useLingui } from "@lingui/react"
import React, { ReactElement } from "react"

interface HealthcheckFailedWarningProps {
    healthy: boolean
}

export default function HealthcheckFailedWarning({ healthy }: HealthcheckFailedWarningProps): ReactElement {
    const strings = useLingui()

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
