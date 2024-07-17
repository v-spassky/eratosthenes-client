import { SocketMessage } from "api/messageTypes"
import { ChatMessage, User } from "models/all"
import Chat from "pages/playScreen/components/Chat"
import UserList from "pages/playScreen/components/UserList"
import React, { Dispatch, ReactElement, SetStateAction } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

interface SidePaneProps {
    sendMessage: (message: SocketMessage) => void
    messages: ChatMessage[]
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>
    users: User[]
    connectionIsOk: boolean
    showLastRoundScore: boolean
    iAmHost: boolean
}

export default function SidePane({
    sendMessage,
    messages,
    setMessages,
    users,
    connectionIsOk,
    showLastRoundScore,
    iAmHost,
}: SidePaneProps): ReactElement {
    return (
        <div id="sidePane" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <PanelGroup autoSaveId="persistence" direction="vertical">
                <Panel minSize={20}>
                    <UserList users={users} showLastRoundScore={showLastRoundScore} iAmHost={iAmHost} />
                </Panel>
                <PanelResizeHandle style={{ height: "1px", backgroundColor: "gray" }} />
                <Panel defaultSize={60} minSize={20}>
                    <Chat
                        sendMessage={sendMessage}
                        messages={messages}
                        setMessages={setMessages}
                        connectionIsOk={connectionIsOk}
                    />
                </Panel>
            </PanelGroup>
        </div>
    )
}
