import Chat from "pages/playScreen/components/Chat"
import UserList from "pages/playScreen/components/UserList"
import React, { ReactElement } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

export default function SidePane(): ReactElement {
    return (
        <div id="sidePane" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <PanelGroup autoSaveId="persistence" direction="vertical">
                <Panel minSize={20}>
                    <UserList />
                </Panel>
                <PanelResizeHandle style={{ height: "1px", backgroundColor: "gray" }} />
                <Panel defaultSize={60} minSize={20}>
                    <Chat />
                </Panel>
            </PanelGroup>
        </div>
    )
}
