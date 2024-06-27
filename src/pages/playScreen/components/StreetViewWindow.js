import { Button, Modal, ModalContent, ModalFooter, ModalHeader, Snippet, useDisclosure } from "@nextui-org/react";
import { getLastVisitedRoomId, setLastVisitedRoomId } from "localStorage/storage.js";
import CountdownBar from "pages/playScreen/components/CountdownBar.js";
import GoogleMapsWrapper from "pages/playScreen/components/GoogleMapsWrapper.js";
import GoogleStreetView from "pages/playScreen/components/GoogleStreetView.js";
import Map from "pages/playScreen/components/Map.js";
import { useEffect } from "react";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import AccordionWithResponsiveBackground from "sharedComponents/AccordionWithInteractiveBackground.js";
import PreferencesButton from "sharedComponents/preferencesButton.js";

export default function StreetViewWindow(
    {
        prevApiKeyRef, showStartGameButton, handleStartGame, progress, mapRef, roomStatusRef, streetViewRef,
        userGuessRef, handleConfirmAnswer, handleRevokeAnswer, submittedGuessRef,
    }
) {
    const leaveGameModal = useDisclosure();
    const newlyConnectedModal = useDisclosure();
    const navigate = useNavigate();
    const { id } = useParams();

    function handleRoomExit() {
        navigate("/");
    }

    useEffect(() => {
        if (getLastVisitedRoomId() === id) {
            return;
        }
        setLastVisitedRoomId(id);
        newlyConnectedModal.onOpen();
    }, []);

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
                <div style={{
                    position: "absolute", bottom: "10px", left: "10px", zIndex: 1, display: "flex",
                    flexDirection: "column", gap: "6px",
                }}>
                    <PreferencesButton />
                    <Button
                        isIconOnly
                        onClick={leaveGameModal.onOpen}
                        color="primary"
                        aria-label="Leave room"
                    >
                        <FaArrowRightFromBracket />
                    </Button>
                </div>
                {showStartGameButton &&
                    <Button
                        color="primary"
                        aria-label="Start game"
                        onClick={handleStartGame}
                        style={{
                            position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 1,
                        }}
                    >
                        Начать игру
                    </Button>
                }
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
                                <Button color="primary" onPress={onClose}>Нет...</Button>
                                <Button color="danger" onPress={handleRoomExit}>Да, и поскорее!</Button>
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
                            <Snippet symbol="">{window.location.href}</Snippet>
                            <AccordionWithResponsiveBackground title="А как играть?">
                                Когда хозяин комнаты начинает игру, на экране появляется стрит вью панорама и таймер
                                обратного отсчёта. До конца таймера нужно поставить метку на карте внизу справа. После
                                конца таймера раунд заканчивается и игрокам начисляются очки пропорционально близости их
                                метки к реальному положению панорамы. И так по кругу.
                            </AccordionWithResponsiveBackground>
                            <ModalFooter style={{ padding: "0px", paddingTop: "12px" }}>
                                <Button color="primary" onPress={onClose}>Понятно.</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
