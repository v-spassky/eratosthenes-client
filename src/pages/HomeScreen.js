import {
    Accordion, AccordionItem, Avatar, Button, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader,
    useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";

import avatarEmojis from "../constants/avatarEmojis";

function HomeScreen() {
    const location = useLocation();
    const roomIdFromChat = location.state && location.state.roomId;
    const [selectedEmoji, setSelectedEmoji] = useState(localStorage.getItem("selectedEmoji") || "");
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");
    const [targetRoomID, setTargetRoomID] = useState(roomIdFromChat || "");
    const [redraw, setRedraw] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const navigate = useNavigate();

    const usernameChangesSaved = localStorage.getItem("username") === username;
    const apiKeyChangesSaved = localStorage.getItem("apiKey") === apiKey;
    const selectedEmojiChangesSaved = localStorage.getItem("selectedEmoji") === selectedEmoji;
    const allChangesSaved = usernameChangesSaved && apiKeyChangesSaved && selectedEmojiChangesSaved;

    const handleSave = () => {
        localStorage.setItem("username", username);
        localStorage.setItem("apiKey", apiKey);
        localStorage.setItem("selectedEmoji", selectedEmoji);
        setRedraw(!redraw);
        toast("Настройки сохранены", {
            position: "bottom-left",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Slide,
        });
    };

    const handleConnectToRoom = async () => {
        if (!targetRoomID.trim()) {
            toast.error("Введи айди комнаты", {
                position: "bottom-left",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Slide,
            });
        } else {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_SERVER_ORIGIN}/can-connect/${targetRoomID}?username=${username}`,
                    { method: "GET" },
                );
                if (response.ok) {
                    const data = await response.json();
                    if (!data.canConnect) {
                        toast.error("Такая комната не найдена", {
                            position: "bottom-left",
                            autoClose: 2000,
                            hideProgressBar: true,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                            transition: Slide,
                        });
                        return;
                    }
                    navigate(`/room/${targetRoomID}`);
                } else {
                    console.error("Failed to create room:", response.statusText);
                }
            } catch (error) {
                console.error("Error creating room:", error.message);
            }
        }
    };

    const handleCreateRoom = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_ORIGIN}/create-room`,
                { method: "POST", headers: { "Content-Type": "application/json" } }
            );
            if (response.ok) {
                const data = await response.json();
                const roomId = data.roomId;
                console.log("Room created:", roomId);
                console.log(roomId);
                navigate(`/room/${roomId}`);
            } else {
                console.error("Failed to create room:", response.statusText);
            }
        } catch (error) {
            console.error("Error creating room:", error.message);
        }
    };

    const handleEmojiSelect = (emoji) => {
        setSelectedEmoji(emoji);
    };

    const canCreateRoom = () => {
        if (!allChangesSaved) {
            return false;
        }
        return username.trim() !== "";
    }

    const canJoinToRoom = () => {
        if (!allChangesSaved) {
            return false;
        }
        return username.trim() !== "" && targetRoomID.trim() !== "";
    }

    return (
        <div
            id="homeScreen"
            style={{
                height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
                alignItems: "center"
            }}
        >
            <div style={{ width: "600px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>Настройки пользователя</h1>
                <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                    <div>
                        <Avatar
                            name={selectedEmoji}
                            style={{ fontSize: "35px", userSelect: "none", cursor: "pointer" }}
                            size="lg"
                            onClick={onOpen}
                        />
                    </div>
                    <Input
                        isRequired
                        label="Юзернейм"
                        placeholder="Как к тебе обращаться?"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <Input
                    label="АПИ ключ"
                    placeholder="Ключик от Google Maps JS API"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
                <Accordion>
                    <AccordionItem key="1" aria-label="Про АПИ ключ" title="Про АПИ ключ">
                        <p>
                            АПИ ключ не обязателен, но если у тебя есть возможность, то используй, пожалуйста, свой
                            ключ. Вот <a href="https://www.geohub.gg/custom-key-instructions.pdf" target="blank"
                                style={{ color: "blue", fontStyle: "italic", textDecoration: "underline" }}>
                                инструкция</a> по созданию и настройке ключа от разработчиков Geohub (требуется гугл
                            аккаунт с подключённой картой в консоли разработчика).
                            <br /><br />
                            АПИ ключ сохраняется только на клиенте и не передаётся на сервер, честное слово. Спасибо!
                        </p>
                    </AccordionItem>
                </Accordion>
                {allChangesSaved
                    ? <Button color="primary" style={{ width: "120px" }} onClick={handleSave}>Сохранить</Button>
                    : <Button color="primary" style={{ width: "120px" }} onClick={handleSave} variant="shadow">
                        Сохранить
                    </Button>
                }
                <Divider />
                <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>Подключиться к существующей комнате</h1>
                <Input
                    isRequired
                    value={targetRoomID}
                    onChange={(e) => setTargetRoomID(e.target.value)}
                    label="Айди комнаты"
                    placeholder="Идентификатор комнаты"
                />
                {canJoinToRoom()
                    ? <Button onPress={handleConnectToRoom} color="primary" style={{ width: "120px" }}>
                        Подключиться
                    </Button>
                    : <Button isDisabled color="primary" style={{ width: "120px" }}>Подключиться</Button>
                }
                <Divider />
                <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>Создать новую комнату</h1>
                {canCreateRoom()
                    ? <Button onPress={handleCreateRoom} color="primary" style={{ width: "120px" }}>Создать</Button>
                    : <Button isDisabled color="primary" style={{ width: "120px" }}>Создать</Button>
                }
            </div>

            <Modal size={"4xl"} isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Выбери себе аватарку</ModalHeader>
                            <ModalBody>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {avatarEmojis.map((emoji) => (
                                        <span key={emoji} onClick={() => handleEmojiSelect(emoji)}>
                                            <Avatar
                                                name={emoji}
                                                className="emoji-avatar"
                                                style={{ fontSize: "35px", userSelect: "none", cursor: "pointer" }}
                                                size="md"
                                                color="primary"
                                            />
                                        </span>
                                    ))}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={onClose}>Сохранить</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div >
    );
}

export default HomeScreen;
