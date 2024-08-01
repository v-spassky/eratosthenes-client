import { I18nContext } from "@lingui/react"
import chatPrompts from "constants/chatPrompts"
import { SupportedLocale } from "localization/all"

export default function randomChatPrompt(strings: I18nContext): string {
    const locale = strings.i18n.locale as SupportedLocale
    const prompts = chatPrompts[locale]
    return prompts[Math.floor(Math.random() * prompts.length)]
}
