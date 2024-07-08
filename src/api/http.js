import { getUserId, getUsername, setUserId } from "localStorage/storage.js";

const origin = process.env.REACT_APP_SERVER_ORIGIN;

export async function canConnectToRoom(roomId) {
    const userId = getUserId();
    const username = getUsername();
    return await fetch(`${origin}/rooms/${roomId}/can-connect?user_id=${userId}&username=${username}`)
        .then(response => response.json());
}

export async function userIsHost(roomId) {
    const userId = getUserId();
    return await fetch(`${origin}/rooms/${roomId}/am-i-host?user_id=${userId}`)
        .then(response => response.json())
        .then(data => data.isHost);
}

export async function createRoom() {
    const userId = getUserId();
    return await fetch(
        `${origin}/rooms?user_id=${userId}`,
        { method: "POST", headers: { "Content-Type": "application/json" } },
    )
        .then(response => response.json())
        .then(data => data.roomId);
}

export async function getUsersOfRoom(roomId) {
    const userId = getUserId();
    return await fetch(`${origin}/rooms/${roomId}/users?user_id=${userId}`)
        .then(response => response.json());
}

export async function getMessagesOfRoom(roomId) {
    const userId = getUserId();
    return await fetch(`${origin}/rooms/${roomId}/messages?user_id=${userId}`)
        .then(response => response.json());
}

export async function submitGuess(lat, lng, roomId) {
    const userId = getUserId();
    const payload = { lat: lat, lng: lng };
    await fetch(
        `${origin}/rooms/${roomId}/submit-guess?user_id=${userId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );
}

export async function revokeGuess(roomId) {
    const userId = getUserId();
    await fetch(
        `${origin}/rooms/${roomId}/revoke-guess?user_id=${userId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }
    );
}

export async function acquireUserId() {
    const userId = await fetch(`${origin}/auth/acquire-id`)
        .then(response => response.json())
        .then(data => data.userId);
    setUserId(userId);
}

export async function muteUser(roomId, usernameToMute) {
    const userId = getUserId();
    await fetch(
        `${origin}/rooms/${roomId}/users/${usernameToMute}/mute?user_id=${userId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }
    );
}

export async function unmuteUser(roomId, usernameToUnmute) {
    const userId = getUserId();
    await fetch(
        `${origin}/rooms/${roomId}/users/${usernameToUnmute}/unmute?user_id=${userId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }
    );
}

export async function banUser(roomId, usernameToBan) {
    const userId = getUserId();
    await fetch(
        `${origin}/rooms/${roomId}/users/${usernameToBan}/ban?user_id=${userId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }
    );
}

export async function apiIsHealthy() {
    const response = await fetch(`${origin}/health/check`);
    return response.status === 200;
}

export async function changeUserScore(roomId, targetUsername, amount) {
    const userId = getUserId();
    const payload = { amount: String(amount) };
    await fetch(
        `${origin}/rooms/${roomId}/users/${targetUsername}/change-score?user_id=${userId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );
}
