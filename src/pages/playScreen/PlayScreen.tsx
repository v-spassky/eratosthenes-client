import { useLingui } from "@lingui/react"
import { Button, Modal, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react"
import { canConnectToRoom, getMessagesOfRoom, getUsersOfRoom, userIsHost } from "api/http"
import { ClientSentSocketMessage, ClientSentSocketMessageType } from "api/messageTypes"
import { isRoomStatusPlaying, isRoomStatusWaiting } from "api/responses"
import useRoomSocket, { RoomSocketContext } from "api/ws"
import defaultStreetViewPosition from "constants/defaultStreetViewPosition"
import mapMarkSvg from "constants/mapMarkSvg"
import { getApiKey, getApiKeyStrategy, getSelectedEmoji, getUsername } from "localStorage/storage"
import { ApiKeyStrategy, RoomStatusType } from "models/all"
import {
    showFailedRoomConnectionNotification,
    showThanksForUsingOwnApiKeyNotification,
    showUnsetUsernameErrorNotification,
} from "notifications/all"
import SidePane from "pages/playScreen/components/SidePane"
import StreetViewWindow from "pages/playScreen/components/StreetViewWindow"
import React, { ReactElement, useContext, useEffect, useRef, useState } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { useNavigate, useParams } from "react-router-dom"
import {
    MapMarkersRefContext,
    MapRefContext,
    PolyLinesRefRefContext,
    RoomStatusRefContext,
    StreetViewRefContext,
    UserGuessRefContext,
} from "state/map"
import { MessagesActionType, MessagesDispatchContext } from "state/messages"
import { RoomMetaInfoActionType, RoomMetaInfoContext, RoomMetaInfoDispatchContext } from "state/roomMetaInfo"
import { UsersActionType, UsersContext, UsersDispatchContext } from "state/users"

export default function PlayScreen(): ReactElement {
    const { id } = useParams()
    const navigate = useNavigate()
    const strings = useLingui()
    const gameFinishedModal = useDisclosure()

    const users = useContext(UsersContext)
    const { roomStatus } = useContext(RoomMetaInfoContext)
    const dispatchUsersAction = useContext(UsersDispatchContext)
    const dispatchMessagesAction = useContext(MessagesDispatchContext)
    const dispatchRoomMetaInfoAction = useContext(RoomMetaInfoDispatchContext)
    const streetViewRef = useContext(StreetViewRefContext)!
    const mapRef = useContext(MapRefContext)!
    const markersRef = useContext(MapMarkersRefContext)!
    const userGuessRef = useContext(UserGuessRefContext)!
    const polyLinesRef = useContext(PolyLinesRefRefContext)!
    const roomStatusRef = useContext(RoomStatusRefContext)!

    const [streetViewPosition, setStreetViewPosition] = useState(defaultStreetViewPosition)
    const streetViewInitialized = useRef(false)

    async function refreshRoomUsersAndStatus(retryCount: number): Promise<void> {
        const usersResp = await getUsersOfRoom(id!)
        if (usersResp.error) {
            console.error("[API]: could not fetch users of room")
            return
        }
        // TODO: is it ok to compare by name? Maybe I should compare by some kind of public id?
        // At least I must ensure that the username is unique per room.
        const roomHasCurrentUser = usersResp.users.find((user) => user.name === getUsername())
        if (roomHasCurrentUser) {
            dispatchUsersAction({ type: UsersActionType.SetUsers, users: usersResp.users })
            if (isRoomStatusPlaying(usersResp.status)) {
                setStreetViewPosition(usersResp.status.playing.currentLocation)
                dispatchRoomMetaInfoAction({
                    type: RoomMetaInfoActionType.SetRoomStatus,
                    status: RoomStatusType.Playing,
                })
                roomStatusRef.current = RoomStatusType.Playing
            } else if (isRoomStatusWaiting(usersResp.status)) {
                if (usersResp.status.waiting.previousLocation !== null) {
                    setStreetViewPosition(usersResp.status.waiting.previousLocation)
                }
                dispatchRoomMetaInfoAction({
                    type: RoomMetaInfoActionType.SetRoomStatus,
                    status: RoomStatusType.Waiting,
                })
                roomStatusRef.current = RoomStatusType.Waiting
            }
        } else if (retryCount > 0) {
            setTimeout(async () => await refreshRoomUsersAndStatus(retryCount - 1), 500)
        }
    }

    const { connectionIsOk, sendMessage, closeSocket } = useRoomSocket({
        roomId: id!,
        refreshRoomUsersAndStatus,
        openGameFinishedModal: gameFinishedModal.onOpen,
    })

    async function mustShowStartGameButton(roomId: string): Promise<boolean> {
        const currentUserIsHost = await userIsHost(roomId)
        dispatchRoomMetaInfoAction({
            type: RoomMetaInfoActionType.SetIAmHost,
            iAmHost: currentUserIsHost,
        })
        return roomStatus === RoomStatusType.Waiting && currentUserIsHost
    }

    function handleTabClosing(): void {
        console.log("[navigation]: tab is closing...")
        const username = getUsername()
        if (username === null) {
            console.error("[storage]: could't get username from local storage")
            return
        }
        const payload: ClientSentSocketMessage = {
            type: ClientSentSocketMessageType.UserDisconnected,
            payload: { username, avatarEmoji: getSelectedEmoji() || "" },
        }
        sendMessage(payload)
        closeSocket()
    }

    useEffect(() => {
        window.addEventListener("beforeunload", handleTabClosing)
        if (getApiKeyStrategy() !== ApiKeyStrategy.UseMyOwn) {
            return
        }
        if (getApiKey() === null) {
            return
        }
        if (getApiKey() === "") {
            return
        }
        showThanksForUsingOwnApiKeyNotification()
        return (): void => {
            // TODO: is this OK that we don't return this in guards?
            window.removeEventListener("unload", handleTabClosing)
        }
    }, [])

    useEffect(() => {
        const switchBtnVisibility = async (): Promise<void> => {
            dispatchRoomMetaInfoAction({
                type: RoomMetaInfoActionType.SetShowStartGameButton,
                showStartGameButton: await mustShowStartGameButton(id!),
            })
        }
        switchBtnVisibility()
        if (mapRef.current) {
            markersRef.current.forEach((marker) => {
                marker.setMap(null)
            })
            polyLinesRef.current.forEach((polyLine) => {
                polyLine.setMap(null)
            })
            markersRef.current = []
            polyLinesRef.current = []
            const svgMarker = {
                path: mapMarkSvg,
                fillColor: "#0070F0",
                fillOpacity: 1,
                strokeWeight: 0,
                rotation: 0,
                scale: 2,
                anchor: new window.google.maps.Point(0, 19),
                labelOrigin: new window.google.maps.Point(0, 7),
            }
            if (roomStatus === RoomStatusType.Waiting) {
                users.forEach((user) => {
                    if (user.lastGuess) {
                        markersRef.current.push(
                            new window.google.maps.Marker({
                                position: {
                                    lat: user.lastGuess.lat,
                                    lng: user.lastGuess.lng,
                                },
                                map: mapRef.current,
                                label: user.avatarEmoji || user.name.slice(0, 3),
                                icon: svgMarker,
                                // @ts-expect-error: this is monkey-patching the `Marker` object with custom properties
                                username: user.name,
                            })
                        )
                    }
                })
                if (userGuessRef.current !== null) {
                    userGuessRef.current.setMap(null)
                }
                userGuessRef.current = null
                markersRef.current.push(
                    new window.google.maps.Marker({
                        position: streetViewPosition,
                        map: mapRef.current,
                        label: "🏠",
                        icon: svgMarker,
                        // @ts-expect-error: this is monkey-patching the `Marker` object with custom properties
                        username: "host",
                    })
                )
                markersRef.current.forEach((marker) => {
                    polyLinesRef.current.push(
                        new window.google.maps.Polyline({
                            // @ts-expect-error: figure out why TS says property `.position` isn't present
                            path: [streetViewPosition, marker.position],
                            geodesic: true,
                            strokeColor: "#0070F0",
                            strokeOpacity: 1.0,
                            strokeWeight: 2,
                            map: mapRef.current,
                        })
                    )
                })
            }
        }
    }, [users, roomStatus])

    useEffect(() => {
        if (!getUsername()) {
            showUnsetUsernameErrorNotification()
            navigate("/", { state: { roomId: id } })
            return
        }
        const checkIfCanConnect = async (): Promise<void> => {
            const canConnectResp = await canConnectToRoom(id!)
            if (!canConnectResp.canConnect) {
                showFailedRoomConnectionNotification(canConnectResp.errorCode)
                navigate("/")
                return
            }
        }
        checkIfCanConnect()
        refreshRoomUsersAndStatus(20)
        if (mapRef.current) {
            mapRef.current.setCenter({ lat: 0.0, lng: 0.0 })
            mapRef.current.setZoom(1)
        }
    }, [roomStatus])

    useEffect(() => {
        if (streetViewRef.current !== null) {
            if (!streetViewInitialized.current) {
                const newPosition = new window.google.maps.LatLng(streetViewPosition)
                streetViewRef.current.setPosition(newPosition)
                streetViewInitialized.current = true
                return
            }
            if (roomStatus === RoomStatusType.Playing) {
                const newPosition = new window.google.maps.LatLng(streetViewPosition)
                streetViewRef.current.setPosition(newPosition)
            }
        }
    }, [streetViewPosition])

    useEffect(() => {
        if (!getUsername()) {
            showUnsetUsernameErrorNotification()
            navigate("/", { state: { roomId: id } })
            return
        }
        const fetchData = async (): Promise<void> => {
            const canConnectResp = await canConnectToRoom(id!)
            if (!canConnectResp.canConnect) {
                showFailedRoomConnectionNotification(canConnectResp.errorCode)
                navigate("/")
                return
            }
            const messagesResp = await getMessagesOfRoom(id!)
            if (messagesResp.error) {
                console.error("[API]: could not fetch room messages")
                return
            }
            dispatchMessagesAction({
                type: MessagesActionType.SetMessages,
                messages: messagesResp.messages,
                strings,
            })
        }
        fetchData()
    }, [navigate, id])

    return (
        <RoomSocketContext.Provider value={{ connectionIsOk, sendMessage, closeSocket }}>
            <div id="playScreen" style={{ height: "100vh", display: "flex", flexDirection: "row" }}>
                <PanelGroup autoSaveId="persistence" direction="horizontal">
                    <Panel minSize={50}>
                        <StreetViewWindow />
                    </Panel>
                    <PanelResizeHandle style={{ width: "1px", backgroundColor: "gray" }} />
                    <Panel defaultSize={30} minSize={10}>
                        <SidePane />
                    </Panel>
                </PanelGroup>
                <Modal size={"md"} isOpen={gameFinishedModal.isOpen} onOpenChange={gameFinishedModal.onOpenChange}>
                    <ModalContent style={{ padding: "24px" }}>
                        {(onClose) => (
                            <>
                                <ModalHeader style={{ padding: "0px", paddingBottom: "12px" }}>
                                    {strings.i18n._("gameFinishedTheWinnerIs")}
                                </ModalHeader>
                                <div style={{ textAlign: "center" }}>
                                    <p style={{ fontSize: "80px" }}>{users[0].avatarEmoji}</p>
                                    <p style={{ fontSize: "24px" }}>{users[0].name}</p>
                                </div>
                                <ModalFooter style={{ padding: "0px", paddingTop: "12px" }}>
                                    <Button color="primary" onPress={onClose}>
                                        {strings.i18n._("cool")}
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </div>
        </RoomSocketContext.Provider>
    )
}
