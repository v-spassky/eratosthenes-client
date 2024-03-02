import { Button, Modal, ModalContent, ModalFooter, ModalHeader, Tooltip, useDisclosure } from "@nextui-org/react";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import GoogleMapsWrapper from "../../utils/maps/GoogleMapsWrapper.js";
import GoogleStreetView from '../../utils/maps/GoogleStreetView.js';
import Map from './Map.js';

function StreetViewWindow() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const navigate = useNavigate();

    const handleRoomExit = () => {
        navigate("/");
    }

    return (
        <div id="streetViewWindow" style={{ height: "100%", flexGrow: 1, position: "relative" }}>
            <GoogleMapsWrapper>
                <GoogleStreetView />
                <Map />
                <Tooltip content="Покинуть комнату">
                    <Button
                        isIconOnly
                        onClick={onOpen}
                        color="primary"
                        aria-label="Leave room"
                        style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: 1 }}
                    >
                        <FaArrowRightFromBracket />
                    </Button>
                </Tooltip>
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

export default StreetViewWindow;
