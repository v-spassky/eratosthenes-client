import { useState, useEffect } from "react";
import {
    Avatar, Button, Divider, Input, Modal, ModalContent, ModalBody, ModalHeader, ModalFooter, useDisclosure, Accordion,
    AccordionItem,
} from "@nextui-org/react";
import { toast, Slide } from 'react-toastify';
import { useNavigate } from "react-router-dom";

const emojis = [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐙", "🐵", "🙈", "🙉",
    "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋",
    "🐌", "🐞", "🐜", "🦗", "🕷", "🦂", "🦟", "🦠", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡",
    "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🦣", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒",
];

function HomeScreen() {
    const [username, setUsername] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [selectedEmoji, setSelectedEmoji] = useState("");
    const [TargetRoomID, setTargetRoomID] = useState("");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const navigate = useNavigate();

    const handleSave = () => {
        localStorage.setItem("username", username);
        localStorage.setItem("apiKey", apiKey);
        localStorage.setItem("selectedEmoji", selectedEmoji);
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

    const handleLoad = () => {
        const savedUsername = localStorage.getItem("username");
        const savedApiKey = localStorage.getItem("apiKey");
        const savedSelectedEmoji = localStorage.getItem("selectedEmoji");
        if (savedUsername) {
            setUsername(savedUsername);
        }
        if (savedApiKey) {
            setApiKey(savedApiKey);
        }
        if (savedSelectedEmoji) {
            setSelectedEmoji(savedSelectedEmoji);
        }
    };

    const handleConnectToRoom = (emoji) => {
        navigate(`/room/${TargetRoomID}`);
    };

    const handleEmojiSelect = (emoji) => {
        setSelectedEmoji(emoji);
    };

    useEffect(() => {
        handleLoad();
    }, []);

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
                <div style={{ width: "600px", display: "flex", flexDirection: "row", gap: "10px" }}>
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
                                style={{ color: "blue", fontStyle: "italic", textDecoration: "underline" }}>инструкция</a> по
                            созданию и настройке ключа от разработчиков Geohub (требуется гугл аккаунт с подключённой
                            картой в консоли разработчика). АПИ ключ сохраняется только на клиенте и не передаётся на
                            сервер, честное слово. Спасибо!
                        </p>
                    </AccordionItem>
                </Accordion>
                <Button color="primary" style={{ width: "120px" }} onClick={handleSave}>Сохранить</Button>
                <Divider />
                <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>Подключиться к сушествующей комнате</h1>
                <Input
                    isRequired
                    value={TargetRoomID}
                    onChange={(e) => setTargetRoomID(e.target.value)}
                    label="Айди комнаты"
                    placeholder="Идентификатор комнаты"
                />
                <Button onPress={handleConnectToRoom} color="primary" style={{ width: "120px" }}>Подключиться</Button>
                <Divider />
                <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>Создать новую комнату</h1>
                <Button color="primary" style={{ width: "120px" }}>Создать</Button>
            </div>

            <Modal size={"4xl"} isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Выбери себе аватарку</ModalHeader>
                            <ModalBody>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {emojis.map((emoji) => (
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
