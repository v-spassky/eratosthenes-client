import { apiIsHealthy } from "api/http"
import { useEffect, useState } from "react"

export default function useHealth(): [boolean, boolean] {
    const [healthy, setHealthy] = useState(false)
    const [checking, setChecking] = useState(false)

    useEffect(() => {
        let isMounted = true
        const checkHealth = async (): Promise<void> => {
            setChecking(true)
            try {
                if (isMounted) {
                    setHealthy(await apiIsHealthy())
                }
            } catch (error) {
                if (isMounted) {
                    setHealthy(false)
                }
            } finally {
                if (isMounted) {
                    setChecking(false)
                }
            }
        }

        checkHealth()
        const interval = setInterval(checkHealth, 30000)

        return (): void => {
            isMounted = false
            clearInterval(interval)
        }
    }, [])

    return [healthy, checking]
}
