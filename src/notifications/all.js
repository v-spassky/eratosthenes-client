import { Slide, toast } from "react-toastify";

export function showUnsetUsernameErrorNotification() {
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

export function showFailedRoomConnectionNotification(apiErrorText) {
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
