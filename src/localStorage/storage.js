import { acquireUserId } from "api/http.js";

export function getUsername() {
    return localStorage.getItem("username");
}

export function setUsername(username) {
    localStorage.setItem("username", username);
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
