import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import Chat from "./Chat.js";
import UserList from "./UserList.js";

export default function SidePane({ socketRef, messages, setMessages, users, connectionIsOk, showLastRoundScore }) {
    return (
        <div id="sidePane" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <PanelGroup autoSaveId="persistence" direction="vertical">
                <Panel minSize={20}>
                    <UserList users={users} showLastRoundScore={showLastRoundScore} />
                </Panel>
                <PanelResizeHandle style={{ height: "1px", backgroundColor: "gray" }} />
                <Panel defaultSize={60} minSize={20}>
                    <Chat
                        socketRef={socketRef}
                        messages={messages}
                        setMessages={setMessages}
                        connectionIsOk={connectionIsOk}
                    />
                </Panel>
            </PanelGroup>
        </div>
    );
}
