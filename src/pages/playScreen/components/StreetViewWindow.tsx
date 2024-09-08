import { useLingui } from "@lingui/react"
import { Button, Modal, ModalContent, ModalFooter, ModalHeader, Snippet, useDisclosure } from "@nextui-org/react"
import { ClientSentSocketMessage, ClientSentSocketMessageType } from "api/messageTypes"
import { RoomSocketContext } from "api/ws"
import { getLastVisitedRoomId, setLastVisitedRoomId } from "localStorage/storage"
import { RoomStatusType } from "models/all"
import CountdownBar from "pages/playScreen/components/CountdownBar"
import GoogleMapsWrapper from "pages/playScreen/components/GoogleMapsWrapper"
import GoogleStreetView from "pages/playScreen/components/GoogleStreetView"
import Map from "pages/playScreen/components/Map"
import React, { ReactElement, useContext, useEffect } from "react"
import { FaArrowRightFromBracket } from "react-icons/fa6"
import { useNavigate, useParams } from "react-router-dom"
import AccordionWithResponsiveBackground from "sharedComponents/AccordionWithInteractiveBackground"
import PreferencesButton from "sharedComponents/preferencesButton"
import { RoomStatusRefContext, SubmittedGuessRefContext } from "state/map"
import { RoomMetaInfoActionType, RoomMetaInfoContext, RoomMetaInfoDispatchContext } from "state/roomMetaInfo"
import { playRoundStartedNotification } from "utils/sounds"

export default function StreetViewWindow(): ReactElement {
    const strings = useLingui()
    const leaveGameModal = useDisclosure()
    const newlyConnectedModal = useDisclosure()
    const navigate = useNavigate()
    const { id } = useParams()
    const { roomStatus, showStartGameButton } = useContext(RoomMetaInfoContext)
    const dispatchRoomMetaInfoAction = useContext(RoomMetaInfoDispatchContext)
    const roomStatusRef = useContext(RoomStatusRefContext)!
    const submittedGuessRef = useContext(SubmittedGuessRefContext)!
    const { sendMessage } = useContext(RoomSocketContext)!

    function handleRoomExit(): void {
        navigate("/")
    }

    function handleStartGame(): void {
        if (roomStatus === RoomStatusType.Playing) {
            return
        }
        submittedGuessRef.current = false
        dispatchRoomMetaInfoAction({
            type: RoomMetaInfoActionType.SetRoomStatus,
            status: RoomStatusType.Playing,
        })
        roomStatusRef.current = RoomStatusType.Playing
        dispatchRoomMetaInfoAction({ type: RoomMetaInfoActionType.SetProgressToMax })
        const payload: ClientSentSocketMessage = { type: ClientSentSocketMessageType.RoundStarted }
        sendMessage(payload)
        playRoundStartedNotification()
    }

    useEffect(() => {
        if (getLastVisitedRoomId() === id) {
            return
        }
        setLastVisitedRoomId(id!)
        newlyConnectedModal.onOpen()
    }, [])

    return (
        <div id="streetViewWindow" style={{ height: "100%", flexGrow: 1, position: "relative" }}>
            <GoogleMapsWrapper>
                <GoogleStreetView />
                <Map />
                <div
                    style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "10px",
                        zIndex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                    }}
                >
                    <PreferencesButton />
                    <Button isIconOnly onClick={leaveGameModal.onOpen} color="primary" aria-label="Leave room">
                        <FaArrowRightFromBracket />
                    </Button>
                </div>
                {showStartGameButton && (
                    <Button
                        color="primary"
                        aria-label="Start game"
                        onClick={handleStartGame}
                        style={{
                            position: "absolute",
                            bottom: "10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 1,
                        }}
                    >
                        {strings.i18n._("startRound")}
                    </Button>
                )}
                <div
                    style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 1 }}
                >
                    <CountdownBar />
                </div>
            </GoogleMapsWrapper>
            <Modal size={"sm"} isOpen={leaveGameModal.isOpen} onOpenChange={leaveGameModal.onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{strings.i18n._("doYouREallyWannaExitTheRoom")}</ModalHeader>
                            <ModalFooter>
                                <Button color="primary" onPress={onClose}>
                                    {strings.i18n._("shyNo")}
                                </Button>
                                <Button color="danger" onPress={handleRoomExit}>
                                    {strings.i18n._("yesPlease")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal size={"2xl"} isOpen={newlyConnectedModal.isOpen} onOpenChange={newlyConnectedModal.onOpenChange}>
                <ModalContent style={{ padding: "24px" }}>
                    {(onClose) => (
                        <>
                            <ModalHeader style={{ padding: "0px", paddingBottom: "12px" }}>
                                {strings.i18n._("hello")}
                            </ModalHeader>
                            <p style={{ paddingBottom: "4px" }}>{strings.i18n._("hereIsAnInvitationLink")}</p>
                            <Snippet symbol="" tooltipProps={{ content: strings.i18n._("copy") }}>
                                {window.location.href}
                            </Snippet>
                            <AccordionWithResponsiveBackground title={strings.i18n._("howToPlayQuestion")}>
                                {strings.i18n._("howToPlay")}
                            </AccordionWithResponsiveBackground>
                            <ModalFooter style={{ padding: "0px", paddingTop: "12px" }}>
                                <Button color="primary" onPress={onClose}>
                                    {strings.i18n._("gotIt")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}
