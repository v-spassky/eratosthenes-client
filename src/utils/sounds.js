export function soundsAreMuted() {
    return localStorage.getItem("mute") === "true";
}

export function muteSounds() {
    localStorage.setItem("mute", "true");
}

export function unmuteSounds() {
    localStorage.setItem("mute", "false");
}

export function toggleMute() {
    if (soundsAreMuted()) {
        unmuteSounds();
    } else {
        muteSounds();
    }
}

function playSound(sound) {
    if (!soundsAreMuted()) {
        sound.play();
    }
}

export function playGameStartedNotification() {
    playSound(new Audio("/sounds/game_started_notification.wav"));
}

export function playGameFinishedNotification() {
    playSound(new Audio("/sounds/game_finished_notification.wav"));
}

export function playNewMessageNotification() {
    playSound(new Audio("/sounds/new_message_notification.wav"));
}

export function playUserConnectedNotification() {
    playSound(new Audio("/sounds/user_connected_notification.wav"));
}

export function playUserDisconnectedNotification() {
    playSound(new Audio("/sounds/user_disconnected_notification.wav"));
}
