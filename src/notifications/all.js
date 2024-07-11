import { Slide, toast } from "react-toastify";

let unsetUsernameErrorFired = false;

export function showUnsetUsernameErrorNotification() {
    if (unsetUsernameErrorFired) {
        return;
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
    });
    unsetUsernameErrorFired = true;
    setTimeout(() => { unsetUsernameErrorFired = false; }, 2000);
}

export function showUnsetRoomIdErrorNotification() {
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
    });
}

let failedRoomConnectionErrorFired = {
    "Room not found.": false,
    "Such user already in the room.": false,
    "The username is too long.": false,
    "User is banned.": false,
};

export function showFailedRoomConnectionNotification(apiErrorText) {
    if (failedRoomConnectionErrorFired[apiErrorText]) {
        return;
    }
    let errMsg = "";
    switch (apiErrorText) {
        case "Room not found.":
            errMsg = "Такая комната не найдена";
            break;
        case "Such user already in the room.":
            errMsg = "Кто-то с таким именем уже есть в комнате";
            break;
        case "The username is too long.":
            errMsg = "Говорят что твой юзернейм слишком длинный, попробуй покороче.";
            break;
        case "User is banned.":
            errMsg = "Ты забанен в этой комнате.";
            break;
        default:
            errMsg = "Ой, почему-то не получилось подключиться к комнате";
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
    });
    failedRoomConnectionErrorFired[apiErrorText] = true;
    setTimeout(() => { failedRoomConnectionErrorFired[apiErrorText] = false; }, 2000);
}

export function showThanksForUsingOwnApiKeyNotification() {
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
    });
}

export function showBannedFromRoomNotification() {
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
    });
}
