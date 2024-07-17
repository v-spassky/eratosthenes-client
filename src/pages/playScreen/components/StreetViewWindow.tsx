import { Button, Modal, ModalContent, ModalFooter, ModalHeader, Snippet, useDisclosure } from "@nextui-org/react"
import { getLastVisitedRoomId, setLastVisitedRoomId } from "localStorage/storage"
import CountdownBar from "pages/playScreen/components/CountdownBar"
import GoogleMapsWrapper from "pages/playScreen/components/GoogleMapsWrapper"
import GoogleStreetView from "pages/playScreen/components/GoogleStreetView"
import Map from "pages/playScreen/components/Map"
import React, { MutableRefObject, ReactElement, useEffect } from "react"
import { FaArrowRightFromBracket } from "react-icons/fa6"
import { useNavigate, useParams } from "react-router-dom"
import AccordionWithResponsiveBackground from "sharedComponents/AccordionWithInteractiveBackground"
import PreferencesButton from "sharedComponents/preferencesButton"

interface StreetViewWindowProps {
    prevApiKeyRef: MutableRefObject<string>
    showStartGameButton: boolean
    handleStartGame: () => void
    progress: number
    mapRef: MutableRefObject<google.maps.Map | null>
    roomStatusRef: MutableRefObject<string>
    streetViewRef: MutableRefObject<google.maps.StreetViewPanorama | null>
    userGuessRef: MutableRefObject<google.maps.Marker | null>
    handleConfirmAnswer: () => void
    handleRevokeAnswer: () => void
    submittedGuessRef: MutableRefObject<boolean>
}

export default function StreetViewWindow({
    prevApiKeyRef,
    showStartGameButton,
    handleStartGame,
    progress,
    mapRef,
    roomStatusRef,
    streetViewRef,
    userGuessRef,
    handleConfirmAnswer,
    handleRevokeAnswer,
    submittedGuessRef,
}: StreetViewWindowProps): ReactElement {
    const leaveGameModal = useDisclosure()
    const newlyConnectedModal = useDisclosure()
    const navigate = useNavigate()
    const { id } = useParams()

    function handleRoomExit(): void {
        navigate("/")
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
            <GoogleMapsWrapper prevApiKeyRef={prevApiKeyRef}>
                <GoogleStreetView streetViewRef={streetViewRef} />
                <Map
                    mapRef={mapRef}
                    roomStatusRef={roomStatusRef}
                    userGuessRef={userGuessRef}
                    handleConfirmAnswer={handleConfirmAnswer}
                    handleRevokeAnswer={handleRevokeAnswer}
                    submittedGuessRef={submittedGuessRef}
                />
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
                        Начать раунд
                    </Button>
                )}
                <div
                    style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 1 }}
                >
                    <CountdownBar progress={progress} />
                </div>
            </GoogleMapsWrapper>

            <Modal size={"sm"} isOpen={leaveGameModal.isOpen} onOpenChange={leaveGameModal.onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Точно хочешь выйти из комнаты?</ModalHeader>
                            <ModalFooter>
                                <Button color="primary" onPress={onClose}>
                                    Нет...
                                </Button>
                                <Button color="danger" onPress={handleRoomExit}>
                                    Да, и поскорее!
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
                            <ModalHeader style={{ padding: "0px", paddingBottom: "12px" }}>Привет!</ModalHeader>
                            <p style={{ paddingBottom: "4px" }}>
                                Вот ссылка по которой сюда можно кого-нибудь пригласить:
                            </p>
                            <Snippet symbol="" tooltipProps={{ content: "Копировать" }}>
                                {window.location.href}
                            </Snippet>
                            <AccordionWithResponsiveBackground title="А как играть?">
                                Когда хозяин комнаты начинает игру, на экране появляется стрит вью панорама и таймер
                                обратного отсчёта. До конца таймера нужно поставить метку на карте внизу справа. После
                                конца таймера раунд заканчивается и игрокам начисляются очки пропорционально близости их
                                метки к реальному положению панорамы. И так по кругу.
                            </AccordionWithResponsiveBackground>
                            <ModalFooter style={{ padding: "0px", paddingTop: "12px" }}>
                                <Button color="primary" onPress={onClose}>
                                    Понятно.
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}
