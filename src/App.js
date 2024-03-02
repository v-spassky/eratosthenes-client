import { NextUIProvider } from "@nextui-org/react";
import { Outlet,Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import HomeScreen from "./pages/HomeScreen.js";
import NoMatchScreen from "./pages/NoMatchScreen.js";
import PlayScreen from "./pages/PlayScreen.js";

function App() {
    return (
        <NextUIProvider>
            <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/room/:id" element={<PlayScreen />} />
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
        </NextUIProvider>
    );
}

export default App;
