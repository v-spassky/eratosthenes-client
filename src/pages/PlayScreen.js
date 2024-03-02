
import { useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Slide, toast } from "react-toastify";

import SidePane from "./components/SidePane.js";
import StreetViewWindow from "./components/StreetViewWindow.js";


export default function PlayScreen({ prevApiKeyRef }) {
    useEffect(() => {
        if (localStorage.getItem("apiKeyStrategy") !== "useMyOwn") {
            return;
        }
        if (localStorage.getItem("apiKey") === null) {
            return;
        }
        if (localStorage.getItem("apiKey") === "") {
            return;
        }
        toast("Спасибо за использование собственного АПИ ключа! ❤️ ", {
            position: "bottom-left",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Slide,
        });
    }, []);

    return (
        <div id="playScreen" style={{ height: "100vh", display: "flex", flexDirection: "row" }}>
            <PanelGroup autoSaveId="persistence" direction="horizontal">
                <Panel minSize={50}>
                    <StreetViewWindow prevApiKeyRef={prevApiKeyRef} />
                </Panel>
                <PanelResizeHandle style={{ width: "1px", backgroundColor: "gray" }} />
                <Panel defaultSize={30} minSize={10}>
                    <SidePane />
                </Panel>
            </PanelGroup>
        </div >
    );
}
