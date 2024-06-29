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

export function playRoundStartedNotification() {
    playSound(new Audio("/sounds/round_started_notification.wav"));
}

export function playRoundFinishedNotification() {
    playSound(new Audio("/sounds/round_finished_notification.wav"));
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
