import chatPrompts from "constants/chatPrompts"

export default function randomChatPrompt(): string {
    return chatPrompts[Math.floor(Math.random() * chatPrompts.length)]
}
