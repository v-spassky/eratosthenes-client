import { getUserId, getUsername,setUserId } from "localStorage/storage.js";

const origin = process.env.REACT_APP_SERVER_ORIGIN;

export async function canConnectToRoom(roomId) {
    const userId = getUserId();
    const username = getUsername();
    return await fetch(`${origin}/can-connect/${roomId}?user_id=${userId}&username=${username}`)
        .then(response => response.json());
}

export async function userIsHost(roomId) {
    const userId = getUserId();
    return await fetch(`${origin}/is-host/${roomId}?user_id=${userId}`)
        .then(response => response.json())
        .then(data => data.isHost);
}

export async function createRoom() {
    const userId = getUserId();
    return await fetch(
        `${origin}/create-room/?user_id=${userId}`,
        { method: "POST", headers: { "Content-Type": "application/json" } },
    )
        .then(response => response.json())
        .then(data => data.roomId);
}

export async function getUsersOfRoom(roomId) {
    const userId = getUserId();
    return await fetch(`${origin}/users-of-room/${roomId}?user_id=${userId}`)
        .then(response => response.json());
}

export async function submitGuess(lat, lng, roomId) {
    const userId = getUserId();
    const payload = { lat: lat, lng: lng };
    await fetch(
        `${origin}/submit-guess/${roomId}?user_id=${userId}`,
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
        `${origin}/revoke-guess/${roomId}?user_id=${userId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }
    );
}

export async function acquireUserId() {
    const userId = await fetch(`${origin}/acquire-id`)
        .then(response => response.json())
        .then(data => data.userId);
    setUserId(userId);
}
