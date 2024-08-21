type ChatEventHandler = (payload: ChatEvent) => void

export enum ChatEventType {
    UserMentioned,
}

export type ChatEvent = { type: ChatEventType.UserMentioned; username: string }

class ChatEventBus {
    private handlers: Record<ChatEventType, ChatEventHandler[]>

    constructor() {
        this.handlers = {
            [ChatEventType.UserMentioned]: [],
        }
    }

    register(event: ChatEventType, handler: ChatEventHandler): void {
        if (!this.handlers[event]) {
            this.handlers[event] = []
        }
        this.handlers[event].push(handler)
    }

    unregister(event: ChatEventType, handler: ChatEventHandler): void {
        if (!this.handlers[event]) {
            return
        }
        this.handlers[event] = this.handlers[event].filter((h) => h !== handler)
    }

    emit(payload: ChatEvent): void {
        if (!this.handlers[payload.type]) {
            return
        }
        this.handlers[payload.type].forEach((handler) => handler(payload))
    }
}

export const chatEventBus = new ChatEventBus()
