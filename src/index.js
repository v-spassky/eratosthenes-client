import "index.css";
import "fonts/Roboto_Mono/RobotoMono-VariableFont_wght.ttf";
import "react-toastify/dist/ReactToastify.css";

import App from "App.js";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
