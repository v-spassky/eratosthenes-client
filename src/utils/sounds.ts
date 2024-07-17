export function soundsAreMuted(): boolean {
    return localStorage.getItem("mute") === "true"
}

export function muteSounds(): void {
    localStorage.setItem("mute", "true")
}

export function unmuteSounds(): void {
    localStorage.setItem("mute", "false")
}

export function toggleMute(): void {
    if (soundsAreMuted()) {
        unmuteSounds()
    } else {
        muteSounds()
    }
}

function playSound(sound: HTMLAudioElement): void {
    if (!soundsAreMuted()) {
        sound.play()
    }
}

export function playRoundStartedNotification(): void {
    playSound(new Audio("/sounds/round_started_notification.wav"))
}

export function playRoundFinishedNotification(): void {
    playSound(new Audio("/sounds/round_finished_notification.wav"))
}

export function playNewMessageNotification(): void {
    playSound(new Audio("/sounds/new_message_notification.wav"))
}

export function playUserConnectedNotification(): void {
    playSound(new Audio("/sounds/user_connected_notification.wav"))
}

export function playUserDisconnectedNotification(): void {
    playSound(new Audio("/sounds/user_disconnected_notification.wav"))
}
