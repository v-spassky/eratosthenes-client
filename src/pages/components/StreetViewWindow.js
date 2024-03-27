import { Button, Modal, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import GoogleMapsWrapper from "../../utils/maps/GoogleMapsWrapper.js";
import GoogleStreetView from "../../utils/maps/GoogleStreetView.js";
import PreferencesButton from "../components/preferencesButton.js";
import CountdownBar from "./CountdownBar.js";
import Map from "./Map.js";

export default function StreetViewWindow(
    {
        prevApiKeyRef, showStartGameButton, handleStartGame, progress, mapRef, markersRef, roomStatusRef,
        streetViewRef,
    }
) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const navigate = useNavigate();

    function handleRoomExit() {
        navigate("/");
    }

    return (
        <div id="streetViewWindow" style={{ height: "100%", flexGrow: 1, position: "relative" }}>
            <GoogleMapsWrapper prevApiKeyRef={prevApiKeyRef}>
                <GoogleStreetView streetViewRef={streetViewRef} />
                <Map
                    mapRef={mapRef}
                    markersRef={markersRef}
                    roomStatusRef={roomStatusRef}
                />
                <div style={{
                    position: "absolute", bottom: "10px", left: "10px", zIndex: 1, display: "flex",
                    flexDirection: "column", gap: "6px",
                }}>
                    <PreferencesButton />
                    <Button
                        isIconOnly
                        onClick={onOpen}
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

            <Modal size={"sm"} isOpen={isOpen} onOpenChange={onOpenChange}>
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
        </div>
    );
}
