import { acquireUserId } from "api/http.js";
// TODO: resolve cyclic dependency between `storage.js` and `http.js`
// TODO: refactor into object-oriented API

export function getUsername() {
    return localStorage.getItem("username");
}

export function setUsername(username) {
    localStorage.setItem("username", username);
}

export function getSelectedEmoji() {
    return localStorage.getItem("selectedEmoji");
}

export function setSelectedEmoji(emoji) {
    localStorage.setItem("selectedEmoji", emoji);
}

export function getUserId() {
    if (localStorage.getItem("userId") === null) {
        acquireUserId();
    }
    return localStorage.getItem("userId");
}

export function setUserId(userId) {
    localStorage.setItem("userId", userId);
}

export function getApiKeyStrategy() {
    return localStorage.getItem("apiKeyStrategy");
}

export function setApiKeyStrategy(strategy) {
    localStorage.setItem("apiKeyStrategy", strategy);
}

export function getApiKey() {
    return localStorage.getItem("apiKey");
}

export function setApiKey(apiKey) {
    localStorage.setItem("apiKey", apiKey);
}

export function getLastVisitedRoomId() {
    return localStorage.getItem("lastVisitedRoomId");
}

export function setLastVisitedRoomId(roomId) {
    localStorage.setItem("lastVisitedRoomId", roomId);
}

export function getMapWidth() {
    return localStorage.getItem("mapWidth");
}

export function setMapWidth(width) {
    localStorage.setItem("mapWidth", width);
}

export function getMapHeight() {
    return localStorage.getItem("mapHeight");
}

export function setMapHeight(height) {
    localStorage.setItem("mapHeight", height);
}
