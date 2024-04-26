import {
    Accordion, AccordionItem, Avatar, Button, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input,
    Modal, ModalBody, ModalContent, ModalHeader, useDisclosure,
} from "@nextui-org/react";
import { canConnectToRoom, createRoom } from "api/http.js";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";

import avatarEmojis from "../constants/avatarEmojis";
import PreferencesButton from "./components/preferencesButton.js";

export default function HomeScreen() {
    const location = useLocation();
    const roomIdFromChat = location.state && location.state.roomId;
    const [selectedEmoji, setSelectedEmoji] = useState(localStorage.getItem("selectedEmoji") || "");
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [apiKeyStrategy, setApiKeyStrategy] = useState(localStorage.getItem("apiKeyStrategy") || "useMyOwn");
    const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");
    const [targetRoomID, setTargetRoomID] = useState(roomIdFromChat || "");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const navigate = useNavigate();
    const [headingBackgroundColor, setHeadingBackgroundColor] = useState(roomIdFromChat || "");
    const { theme, _setTheme } = useTheme();

    const apiKeyIsValid = apiKey.trim() !== "";
    const usernameIsValid = username.trim() !== "";

    function toggleHeadingBackgroundColor() {
        const bgColor = theme === "light" ? "rgb(243, 244, 246)" : "rgb(63, 63, 70)";
        setHeadingBackgroundColor(headingBackgroundColor === "" ? bgColor : "");
    }

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
            const canConnectResp = await canConnectToRoom(targetRoomID);
            if (!canConnectResp.canConnect) {
                let errMsg = "";
                switch (canConnectResp.reason) {
                    case "Room not found.":
                        errMsg = "Такая комната не найдена";
                        break;
                    case "Such user already in the room.":
                        errMsg = "Кто-то с таким именем уже есть в комнате";
                        break;
                    default:
                        errMsg = "Ой, почему-то не получилось подключиться к комнате";
                }
                toast.error(errMsg, {
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
        }
    };

    const handleCreateRoom = async () => {
        const roomId = await createRoom();
        navigate(`/room/${roomId}`);
    };

    const handleEmojiSelect = (emoji, onClose) => {
        localStorage.setItem("selectedEmoji", emoji);
        setSelectedEmoji(emoji);
        onClose();
    };

    const canCreateRoom = () => {
        return username.trim() !== "";
    }

    const canJoinToRoom = () => {
        return username.trim() !== "" && targetRoomID.trim() !== "";
    }

    function apiKeyStrategyDisplay(strategyKey) {
        switch (strategyKey) {
            case "useMyOwn":
                return <p>Используем свой</p>;
            case "doNotUse":
                return <p>Не используем вообще</p>;
            case "useDefault":
                return <p>Используем дефолтный</p>;
            default:
                console.error("Unknown API key strategy:", strategyKey);
                return <p>Случилось что-то не то... попробуй перезагрузить страницу.</p>;
        }
    }

    function apiKeyStrategyDescriptionDisplay(strategyKey) {
        switch (strategyKey) {
            case "useMyOwn":
                return <p style={{ fontStyle: "italic", fontSize: "small", color: "gray" }}>
                    Создай свой ключ в консоли разработчика гугла как описано
                    <br />
                    ниже в разделе «Про АПИ ключ» и используй его.
                </p>;
            case "doNotUse":
                return <p style={{ fontStyle: "italic", fontSize: "small", color: "gray" }}>
                    Карта будет с инвертированными цветами, зато не нужно
                    <br />
                    создавать ключ и квота использования ключа разработчика
                    <br />
                    этого замечательного сайта тоже не будет тратиться.
                </p>;
            case "useDefault":
                return <p style={{ fontStyle: "italic", fontSize: "small", color: "gray" }}>
                    Если у тебя совсем нет возможности создать свой ключ,
                    <br />
                    а поиграть хочется, то не стесняйся использовать эту опцию.
                </p>;
            default:
                console.error("Unknown API key strategy:", strategyKey);
                return <p>Нет-нет, это что-то не то!</p>;
        }
    }

    return (
        <div
            id="homeScreen"
            style={{
                height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
                alignItems: "center"
            }}
        >
            <div style={{ width: "600px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>Настройки пользователя</h1>
                <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                    <div>
                        <Avatar
                            id="userAvatar"
                            name={selectedEmoji}
                            style={{ fontSize: "35px", userSelect: "none", cursor: "pointer" }}
                            size="lg"
                            onClick={onOpen}
                        />
                    </div>
                    {usernameIsValid
                        ? <Input
                            isRequired
                            label="Юзернейм"
                            placeholder="Как к тебе обращаться?"
                            value={username}
                            onChange={(e) => {
                                localStorage.setItem("username", e.target.value);
                                setUsername(e.target.value);
                            }}
                        />
                        : <Input
                            isRequired
                            isInvalid
                            label="Юзернейм"
                            placeholder="Как к тебе обращаться?"
                            value={username}
                            onChange={(e) => {
                                localStorage.setItem("username", e.target.value);
                                setUsername(e.target.value);
                            }}
                        />
                    }
                </div>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "16px" }}>
                    <p>Что делаем с АПИ ключом?</p>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="bordered" size="sm" style={{ width: "190px" }}>
                                {apiKeyStrategyDisplay(apiKeyStrategy)}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Single selection example"
                            variant="flat"
                            disallowEmptySelection
                            selectionMode="single"
                            selectedKeys={[apiKeyStrategy]}
                            onSelectionChange={(strategyKeys) => {
                                const newStrategy = [...strategyKeys][0];
                                localStorage.setItem("apiKeyStrategy", newStrategy);
                                setApiKeyStrategy(newStrategy);
                            }}
                        >
                            <DropdownItem key="useMyOwn">
                                {apiKeyStrategyDisplay("useMyOwn")}
                                {apiKeyStrategyDescriptionDisplay("useMyOwn")}
                            </DropdownItem>
                            <DropdownItem key="doNotUse">
                                {apiKeyStrategyDisplay("doNotUse")}
                                {apiKeyStrategyDescriptionDisplay("doNotUse")}
                            </DropdownItem>
                            <DropdownItem key="useDefault">
                                {apiKeyStrategyDisplay("useDefault")}
                                {apiKeyStrategyDescriptionDisplay("useDefault")}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                {apiKeyStrategy === "useMyOwn" &&
                    (apiKeyIsValid
                        ? <Input
                            isRequired
                            label="АПИ ключ"
                            placeholder="Ключик от Google Maps JS API"
                            value={apiKey}
                            onChange={(e) => {
                                localStorage.setItem("apiKey", e.target.value);
                                setApiKey(e.target.value);
                            }}
                        />
                        : <Input
                            isRequired
                            isInvalid
                            label="АПИ ключ"
                            placeholder="Ключик от Google Maps JS API"
                            value={apiKey}
                            onChange={(e) => {
                                localStorage.setItem("apiKey", e.target.value);
                                setApiKey(e.target.value);
                            }}
                        />
                    )
                }
                <Accordion>
                    <AccordionItem
                        key="1"
                        aria-label="Про АПИ ключ"
                        title={
                            <p
                                id="about-api-key-heading"
                                style={{
                                    width: "min-content", whiteSpace: "nowrap", padding: "2px 4px 2px 4px",
                                    backgroundColor: headingBackgroundColor, borderRadius: "4px",
                                }}
                                onMouseEnter={toggleHeadingBackgroundColor}
                                onMouseLeave={toggleHeadingBackgroundColor}
                            >
                                Про АПИ ключ
                            </p>
                        }
                    >
                        <p>
                            АПИ ключ не обязателен, но если у тебя есть возможность, то используй, пожалуйста, свой
                            ключ. Вот <a href="https://www.geohub.gg/custom-key-instructions.pdf" target="blank"
                                style={{ color: "blue", fontStyle: "italic", textDecoration: "underline" }}>
                                инструкция</a> по созданию и настройке ключа от разработчиков Geohub (требуется гугл
                            аккаунт с подключённой картой в консоли разработчика).
                            <br /><br />
                            Если хочется просто осмотреться, то есть опция не использовать ключ вообще. В этом случае
                            карта будет с инвертированными цветами.
                            <br /><br />
                            АПИ ключ сохраняется только на клиенте и не передаётся на сервер, честное слово. Спасибо!
                        </p>
                    </AccordionItem>
                </Accordion>
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

            <div style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: 1 }}>
                <PreferencesButton />
            </div>

            <Modal size={"4xl"} isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Выбери себе аватарку</ModalHeader>
                            <ModalBody>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {avatarEmojis.map((emoji) => (
                                        <span key={emoji} onClick={() => handleEmojiSelect(emoji, onClose)}>
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
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div >
    );
}
