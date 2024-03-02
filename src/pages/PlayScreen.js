
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import SidePane from './components/SidePane.js';
import StreetViewWindow from './components/StreetViewWindow.js';

function PlayScreen() {
    return (
        <div id="playScreen" style={{ height: "100vh", display: "flex", flexDirection: "row" }}>
            <PanelGroup direction="horizontal">
                <Panel minSize={50}>
                    <StreetViewWindow />
                </Panel>
                <PanelResizeHandle style={{ width: "1px", backgroundColor: "gray" }} />
                <Panel defaultSize={30} minSize={10}>
                    <SidePane />
                </Panel>
            </PanelGroup>
        </div >
    );
}

export default PlayScreen;
