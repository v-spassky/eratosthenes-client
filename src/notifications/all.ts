import { Slide, toast } from "react-toastify"

let unsetUsernameErrorFired = false

export function showUnsetUsernameErrorNotification(): void {
    if (unsetUsernameErrorFired) {
        return
    }
    toast.error("Установи юзернейм чтобы подключиться к комнате", {
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

export function showUnsetRoomIdErrorNotification(): void {
    toast.error("Введи айди комнаты", {
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

export function showFailedRoomConnectionNotification(roomConnectionErrorCode: string): void {
    if (failedRoomConnectionErrorFired.get(roomConnectionErrorCode)) {
        return
    }
    let errMsg = ""
    switch (roomConnectionErrorCode) {
        case "roomNotFound":
            errMsg = "Такая комната не найдена"
            break
        case "userAlreadyInRoom":
            errMsg = "Кто-то с таким именем уже есть в комнате"
            break
        case "usernameTooLong":
            errMsg = "Говорят что твой юзернейм слишком длинный, попробуй покороче."
            break
        case "userBanned":
            errMsg = "Ты забанен в этой комнате."
            break
        default:
            errMsg = "Ой, почему-то не получилось подключиться к комнате"
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

export function showThanksForUsingOwnApiKeyNotification(): void {
    toast("Спасибо за использование собственного АПИ ключа! ❤️ ", {
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

export function showBannedFromRoomNotification(): void {
    toast.error("Тебя забанили в этой комнате", {
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
