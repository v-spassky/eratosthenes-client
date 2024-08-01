import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { NextUIProvider } from "@nextui-org/react"
import initTranslations from "localization/all"
import { getSelectedLanguage } from "localStorage/storage"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import HomeScreen from "pages/homeScreen/HomeScreen"
import NoMatchScreen from "pages/NoMatchScreen"
import PlayScreenWithContext from "pages/playScreen/PlayScreenWithContext"
import React, { ReactElement } from "react"
import { Outlet, Route, Routes } from "react-router-dom"
import { ToastContainer } from "react-toastify"

initTranslations()
i18n.activate(getSelectedLanguage())

export default function App(): ReactElement {
    return (
        <NextUIProvider>
            <NextThemesProvider attribute="class" enableSystem defaultTheme="system">
                <I18nProvider i18n={i18n}>
                    <Routes>
                        <Route path="/" element={<HomeScreen />} />
                        <Route path="/room/:id" element={<PlayScreenWithContext />} />
                        <Route path="*" element={<NoMatchScreen />} />
                    </Routes>
                    <Outlet />
                    <ToastContainer
                        position="bottom-left"
                        autoClose={5000}
                        hideProgressBar
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </I18nProvider>
            </NextThemesProvider>
        </NextUIProvider>
    )
}
