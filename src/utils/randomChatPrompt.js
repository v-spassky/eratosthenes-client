import chatPrompts from "../constants/chatPrompts.js";

export default function randomChatPrompt() {
    return chatPrompts[Math.floor(Math.random() * chatPrompts.length)];
}
