import { getUsername } from "localStorage/storage"
import { ChatMessage } from "models/all"
import { createContext, Dispatch } from "react"

export const MessagesContext = createContext<ChatMessage[]>([])
export const MessagesDispatchContext = createContext<Dispatch<MessagesAction>>(() => {
    throw new Error("MessagesDispatchContext not provided!")
})

export enum MessagesActionType {
    SetMessages,
    AddMessage,
}

export type MessagesAction =
    | { type: MessagesActionType.SetMessages; messages: ChatMessage[] }
    | { type: MessagesActionType.AddMessage; message: ChatMessage }

export function messagesReducer(messages: ChatMessage[], action: MessagesAction): ChatMessage[] {
    switch (action.type) {
        case MessagesActionType.SetMessages: {
            return action.messages.map((message) => {
                return {
                    id: message.id,
                    authorName: message.authorName === getUsername() ? "я" : message.authorName,
                    content: message.content,
                    isFromBot: message.isFromBot,
                }
            })
        }
        case MessagesActionType.AddMessage: {
            return [...messages, { ...action.message }]
        }
    }
}
