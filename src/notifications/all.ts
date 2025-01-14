import { useLingui } from "@lingui/react"
import { useTheme } from "next-themes"
import { Slide, toast } from "react-toastify"

let unsetUsernameErrorFired = false
const failedRoomConnectionErrorFired = new Map<string, boolean>([
    ["roomNotFound", false],
    ["userAlreadyInRoom", false],
    ["usernameTooLong", false],
    ["userBanned", false],
])

export default function useNotifications(): {
    showUnsetUsernameErrorNotification: () => void
    showUnsetRoomIdErrorNotification: () => void
    showFailedRoomConnectionNotification: (roomConnectionErrorCode: string) => void
    showThanksForUsingOwnApiKeyNotification: () => void
    showBannedFromRoomNotification: () => void
    cannotPasteImageNotification: () => void
} {
    const { i18n } = useLingui()
    const { theme } = useTheme()
    const systemThemeIsLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
    const actualTheme = theme === "system" ? (systemThemeIsLight ? "light" : "dark") : theme

    const showUnsetUsernameErrorNotification = (): void => {
        if (unsetUsernameErrorFired) {
            return
        }
        toast.error(i18n._("setUsernameToConnect"), {
            position: "bottom-left",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: actualTheme,
            transition: Slide,
        })
        unsetUsernameErrorFired = true
        setTimeout(() => {
            unsetUsernameErrorFired = false
        }, 2000)
    }

    const showUnsetRoomIdErrorNotification = (): void => {
        toast.error(i18n._("enterRoomId"), {
            position: "bottom-left",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: actualTheme,
            transition: Slide,
        })
    }

    const showFailedRoomConnectionNotification = (roomConnectionErrorCode: string): void => {
        if (failedRoomConnectionErrorFired.get(roomConnectionErrorCode)) {
            return
        }
        const errorMessages: Record<string, string> = {
            roomNotFound: i18n._("suchRoomWasNotFound"),
            userAlreadyInRoom: i18n._("someoneWithSuchNameOrPasscodeAlreadyInRoom"),
            usernameTooLong: i18n._("rejectedBcOfUsernameIsTooLong"),
            userBanned: i18n._("youAreBannedInTheRoom"),
        }

        const errMsg = errorMessages[roomConnectionErrorCode] ?? i18n._("couldNotConnectToTheRoom")
        toast.error(errMsg, {
            position: "bottom-left",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: actualTheme,
            transition: Slide,
        })
        failedRoomConnectionErrorFired.set(roomConnectionErrorCode, true)
        setTimeout(() => {
            failedRoomConnectionErrorFired.set(roomConnectionErrorCode, false)
        }, 2000)
    }

    const showThanksForUsingOwnApiKeyNotification = (): void => {
        toast(i18n._("thxForUsingYourOwnApiKey"), {
            position: "bottom-left",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: actualTheme,
            transition: Slide,
        })
    }

    const showBannedFromRoomNotification = (): void => {
        toast.error(i18n._("youWereBannedInTheRoom"), {
            position: "bottom-left",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: actualTheme,
            transition: Slide,
        })
    }

    const cannotPasteImageNotification = (): void => {
        toast.error(i18n._("cannotPasteImage"), {
            position: "bottom-left",
            autoClose: 2000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: actualTheme,
            transition: Slide,
        })
    }

    return {
        showUnsetUsernameErrorNotification,
        showUnsetRoomIdErrorNotification,
        showFailedRoomConnectionNotification,
        showThanksForUsingOwnApiKeyNotification,
        showBannedFromRoomNotification,
        cannotPasteImageNotification,
    }
}
