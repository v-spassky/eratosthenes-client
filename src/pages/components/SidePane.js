import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import Chat from "./Chat.js";
import UserList from "./UserList.js";

function SidePane({ socketRef, messages, setMessages, users }) {
    return (
        <div id="sidePane" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <PanelGroup autoSaveId="persistence" direction="vertical">
                <Panel minSize={20}>
                    <UserList users={users} />
                </Panel>
                <PanelResizeHandle style={{ height: "1px", backgroundColor: "gray" }} />
                <Panel defaultSize={60} minSize={20}>
                    <Chat socketRef={socketRef} messages={messages} setMessages={setMessages} />
                </Panel>
            </PanelGroup>
        </div>
    );
}

export default SidePane;
