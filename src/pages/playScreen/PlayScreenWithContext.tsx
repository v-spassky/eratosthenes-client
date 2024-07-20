import PlayScreen from "pages/playScreen/PlayScreen"
import React, { ReactElement, useReducer } from "react"
import { MapDataContextProvider } from "state/map"
import { MessagesContext, MessagesDispatchContext, messagesReducer } from "state/messages"
import {
    defaultRoomMetaInfo,
    RoomMetaInfoContext,
    RoomMetaInfoDispatchContext,
    roomMetaInfoReducer,
} from "state/roomMetaInfo"
import { UsersContext, UsersDispatchContext, usersReducer } from "state/users"

export default function PlayScreenWithContext(): ReactElement {
    const [users, dispatchUsersAction] = useReducer(usersReducer, [])
    const [messages, dispatchMessagesAction] = useReducer(messagesReducer, [])
    const [roomMetaInfo, dispatchRoomMetaInfoAction] = useReducer(roomMetaInfoReducer, defaultRoomMetaInfo)

    return (
        <UsersContext.Provider value={users}>
            <UsersDispatchContext.Provider value={dispatchUsersAction}>
                <MessagesContext.Provider value={messages}>
                    <MessagesDispatchContext.Provider value={dispatchMessagesAction}>
                        <RoomMetaInfoContext.Provider value={roomMetaInfo}>
                            <RoomMetaInfoDispatchContext.Provider value={dispatchRoomMetaInfoAction}>
                                <MapDataContextProvider>
                                    <PlayScreen />
                                </MapDataContextProvider>
                            </RoomMetaInfoDispatchContext.Provider>
                        </RoomMetaInfoContext.Provider>
                    </MessagesDispatchContext.Provider>
                </MessagesContext.Provider>
            </UsersDispatchContext.Provider>
        </UsersContext.Provider>
    )
}
