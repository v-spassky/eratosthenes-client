import useHealth from "hooks/apiHealth.js";

export default function HealthcheckFailedWarning() {
    const [healthy, _checkingHealth] = useHealth();

    if (healthy) {
        return <></>;
    }

    return <div style={{
        color: "red", border: "solid", borderWidth: "1px", borderRadius: "12px", height: "40px", padding: "12px",
        display: "flex", justifyContent: "center", alignItems: "center",
    }}>
        Сервер недоступен, пока что поиграть не получится.
    </div>;
}
