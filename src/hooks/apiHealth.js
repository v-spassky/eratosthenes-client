import { useState, useEffect } from "react";
import { apiIsHealthy } from "api/http";

export default function useHealth() {
    const [healthy, setHealthy] = useState(false);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const checkHealth = async () => {
            setChecking(true);
            try {
                if (isMounted) {
                    setHealthy(await apiIsHealthy());
                }
            } catch (error) {
                if (isMounted) {
                    setHealthy(false);
                }
            } finally {
                if (isMounted) {
                    setChecking(false);
                }
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return [healthy, checking];
}
