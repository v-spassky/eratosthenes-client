import UserList from "./UserList.js";
import Chat from "./Chat.js";
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

function SidePane() {
    return (
        <div id="sidePane" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <PanelGroup direction="vertical">
                <Panel minSize={20}>
                    <UserList />
                </Panel>
                <PanelResizeHandle style={{height: "1px", backgroundColor: "gray"}}/>
                <Panel defaultSize={60} minSize={20}>
                    <Chat />
                </Panel>
            </PanelGroup>
        </div>
    );
}

export default SidePane;
