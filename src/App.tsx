import { NextUIProvider } from "@nextui-org/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import HomeScreen from "pages/homeScreen/HomeScreen"
import NoMatchScreen from "pages/NoMatchScreen"
import PlayScreen from "pages/playScreen/PlayScreen"
import React, { ReactElement, useRef } from "react"
import { Outlet, Route, Routes } from "react-router-dom"
import { ToastContainer } from "react-toastify"

export default function App(): ReactElement {
    const prevApiKeyRef = useRef("UNSET")

    return (
        <NextUIProvider>
            <NextThemesProvider attribute="class" defaultTheme="light">
                <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/room/:id" element={<PlayScreen prevApiKeyRef={prevApiKeyRef} />} />
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
            </NextThemesProvider>
        </NextUIProvider>
    )
}
