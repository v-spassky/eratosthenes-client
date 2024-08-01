import { I18nContext } from "@lingui/react"
import userDescriptions from "constants/userDescriptions"
import { SupportedLocale } from "localization/all"

export default function randomUserDescription(descriptionIndex: number, strings: I18nContext): string {
    const locale = strings.i18n.locale as SupportedLocale
    const descriptions = userDescriptions[locale]
    return descriptions[descriptionIndex]
}
