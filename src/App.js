import PlayScreen from "./pages/PlayScreen.js";
import HomeScreen from "./pages/HomeScreen.js";
import NoMatchScreen from "./pages/NoMatchScreen.js";
import { NextUIProvider } from "@nextui-org/react";
import { Routes, Route, Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

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
