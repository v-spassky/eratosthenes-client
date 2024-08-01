import { I18nContext } from "@lingui/react"
import { getUsername } from "localStorage/storage"
import { ChatMessage, ChatMessageType } from "models/all"
import { createContext, Dispatch } from "react"

export const MessagesContext = createContext<ChatMessage[]>([])
export const MessagesDispatchContext = createContext<Dispatch<MessagesAction>>(() => {
    throw new Error("MessagesDispatchContext not provided!")
})

export enum MessagesActionType {
    SetMessages,
    AddMessage,
    TranslateMeInMessages,
}

export type MessagesAction =
    | { type: MessagesActionType.SetMessages; messages: ChatMessage[]; strings: I18nContext }
    | { type: MessagesActionType.AddMessage; message: ChatMessage }
    | { type: MessagesActionType.TranslateMeInMessages; strings: I18nContext }

export function messagesReducer(messages: ChatMessage[], action: MessagesAction): ChatMessage[] {
    switch (action.type) {
        case MessagesActionType.SetMessages: {
            return action.messages.map((message) => {
                switch (message.type) {
                    case ChatMessageType.FromPlayerChatMessage: {
                        return {
                            ...message,
                            authorName:
                                message.authorName === getUsername() ? action.strings.i18n._("me") : message.authorName,
                        }
                    }
                    case ChatMessageType.FromBotChatMessage: {
                        return {
                            ...message,
                            // TODO: translate content
                            content: message.content,
                        }
                    }
                }
            })
        }
        case MessagesActionType.AddMessage: {
            return [...messages, { ...action.message }]
        }
        case MessagesActionType.TranslateMeInMessages: {
            return messages.map((message) => {
                switch (message.type) {
                    case ChatMessageType.FromPlayerChatMessage: {
                        const messageIsMine = ["me", "я"].includes(message.authorName)
                        return {
                            ...message,
                            authorName: messageIsMine ? action.strings.i18n._("me") : message.authorName,
                        }
                    }
                    case ChatMessageType.FromBotChatMessage: {
                        return {
                            ...message,
                            // TODO: translate content
                            content: message.content,
                        }
                    }
                }
            })
        }
    }
}
