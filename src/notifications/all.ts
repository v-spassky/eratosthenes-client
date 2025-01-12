import { I18nContext } from "@lingui/react"
import { Slide, toast } from "react-toastify"

let unsetUsernameErrorFired = false

export function showUnsetUsernameErrorNotification(strings: I18nContext): void {
    if (unsetUsernameErrorFired) {
        return
    }
    toast.error(strings.i18n._("setUsernameToConnect"), {
        position: "bottom-left",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
    })
    unsetUsernameErrorFired = true
    setTimeout(() => {
        unsetUsernameErrorFired = false
    }, 2000)
}

export function showUnsetRoomIdErrorNotification(strings: I18nContext): void {
    toast.error(strings.i18n._("enterRoomId"), {
        position: "bottom-left",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
    })
}

// TODO: add an enum for `roomConnectionErrorCode`
const failedRoomConnectionErrorFired = new Map<string, boolean>([
    ["roomNotFound", false],
    ["userAlreadyInRoom", false],
    ["usernameTooLong", false],
    ["userBanned", false],
])

export function showFailedRoomConnectionNotification(strings: I18nContext, roomConnectionErrorCode: string): void {
    if (failedRoomConnectionErrorFired.get(roomConnectionErrorCode)) {
        return
    }
    let errMsg = ""
    switch (roomConnectionErrorCode) {
        case "roomNotFound":
            errMsg = strings.i18n._("suchRoomWasNotFound")
            break
        case "userAlreadyInRoom":
            errMsg = strings.i18n._("someoneWithSuchNameOrPasscodeAlreadyInRoom")
            break
        case "usernameTooLong":
            errMsg = strings.i18n._("rejectedBcOfUsernameIsTooLong")
            break
        case "userBanned":
            errMsg = strings.i18n._("youAreBannedInTheRoom")
            break
        default:
            errMsg = strings.i18n._("couldNotConnectToTheRoom")
    }
    toast.error(errMsg, {
        position: "bottom-left",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
    })
    failedRoomConnectionErrorFired.set(roomConnectionErrorCode, true)
    setTimeout(() => {
        failedRoomConnectionErrorFired.set(roomConnectionErrorCode, false)
    }, 2000)
}

export function showThanksForUsingOwnApiKeyNotification(strings: I18nContext): void {
    toast(strings.i18n._("thxForUsingYourOwnApiKey"), {
        position: "bottom-left",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
    })
}

export function showBannedFromRoomNotification(strings: I18nContext): void {
    toast.error(strings.i18n._("youWereBannedInTheRoom"), {
        position: "bottom-left",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
    })
}

export function cannotPasteImageNotification(strings: I18nContext): void {
    toast.error(strings.i18n._("cannotPasteImage"), {
        position: "bottom-left",
        autoClose: 2000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Slide,
    })
}
