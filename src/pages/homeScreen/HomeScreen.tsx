import { useLingui } from "@lingui/react"
import {
    Avatar,
    Button,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    useDisclosure,
} from "@nextui-org/react"
import { canConnectToRoom, createRoom } from "api/http"
import avatarEmojis from "constants/avatarEmojis"
import maxUsernameLength from "constants/maxUsernameLength"
import {
    getApiKey,
    getApiKeyStrategy,
    getSelectedEmoji,
    getUsername,
    setApiKey as setApiKeyInStorage,
    setApiKeyStrategy as setApiKeyStrategyInStorage,
    setSelectedEmoji as setSelectedEmojiInStorage,
    setUsername as setUsernameInStorage,
} from "localStorage/storage"
import { ApiKeyStrategy } from "models/all"
import { showFailedRoomConnectionNotification, showUnsetRoomIdErrorNotification } from "notifications/all"
import HealthcheckFailedWarning from "pages/homeScreen/components/HealthcheckFailedWarning"
import React, { ReactElement, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import AccordionWithResponsiveBackground from "sharedComponents/AccordionWithInteractiveBackground"
import PreferencesButton from "sharedComponents/preferencesButton"

export default function HomeScreen(): ReactElement {
    const navigate = useNavigate()
    const location = useLocation()
    const strings = useLingui()
    const roomIdFromChat = location.state && location.state.roomId
    const [selectedEmoji, setSelectedEmoji] = useState(getSelectedEmoji() || "")
    const [username, setUsername] = useState(getUsername() || "")
    const [apiKeyStrategy, setApiKeyStrategy] = useState(getApiKeyStrategy())
    const [apiKey, setApiKey] = useState(getApiKey() || "")
    const [targetRoomID, setTargetRoomID] = useState(roomIdFromChat || "")
    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const apiKeyIsValid = apiKey.trim() !== ""
    const [usernameIsValid, usernameErrorMsg] = checkUsername()

    function checkUsername(): [boolean, string | null] {
        if (username.trim() === "") {
            return [false, strings.i18n._("usernameCannotBeEmpty")]
        }
        if (username.length >= maxUsernameLength) {
            return [false, strings.i18n._("usernameIsTooLong")]
        }
        return [true, null]
    }

    async function handleConnectToRoom(): Promise<void> {
        if (!targetRoomID.trim()) {
            showUnsetRoomIdErrorNotification()
        } else {
            const canConnectResp = await canConnectToRoom(targetRoomID)
            if (!canConnectResp.canConnect) {
                showFailedRoomConnectionNotification(canConnectResp.errorCode)
                return
            }
            navigate(`/room/${targetRoomID}`)
        }
    }

    async function handleCreateRoom(): Promise<void> {
        const roomId = await createRoom()
        navigate(`/room/${roomId}`)
    }

    function handleEmojiSelect(emoji: string, onClose: () => void): void {
        setSelectedEmojiInStorage(emoji)
        setSelectedEmoji(emoji)
        onClose()
    }

    function canCreateRoom(): boolean {
        return username.trim() !== ""
    }

    function canJoinToRoom(): boolean {
        return username.trim() !== "" && targetRoomID.trim() !== ""
    }

    function apiKeyStrategyDisplay(strategyKey: ApiKeyStrategy): ReactElement {
        switch (strategyKey) {
            case ApiKeyStrategy.UseMyOwn:
                return <p>{strings.i18n._("useOwnApiKey")}</p>
            case ApiKeyStrategy.DoNotUse:
                return <p>{strings.i18n._("doNotUseApiKey")}</p>
            case ApiKeyStrategy.UseDefault:
                return <p>{strings.i18n._("useDefaultApiKey")}</p>
            default:
                console.error(`[API key]: unknown API key strategy: ${strategyKey}`)
                return <p>{strings.i18n._("tryToReloadThePage")}</p>
        }
    }

    function apiKeyStrategyDescriptionDisplay(strategyKey: ApiKeyStrategy): ReactElement {
        switch (strategyKey) {
            case ApiKeyStrategy.UseMyOwn:
                return (
                    <p
                        style={{
                            fontStyle: "italic",
                            fontSize: "small",
                            color: "gray",
                            whiteSpace: "initial",
                            wordWrap: "initial",
                        }}
                    >
                        {strings.i18n._("useOwnApiKeyDescription")}
                    </p>
                )
            case ApiKeyStrategy.DoNotUse:
                return (
                    <p
                        style={{
                            fontStyle: "italic",
                            fontSize: "small",
                            color: "gray",
                            whiteSpace: "initial",
                            wordWrap: "initial",
                        }}
                    >
                        {strings.i18n._("doNotUseApiKeyDescription")}
                    </p>
                )
            case ApiKeyStrategy.UseDefault:
                return (
                    <p
                        style={{
                            fontStyle: "italic",
                            fontSize: "small",
                            color: "gray",
                            whiteSpace: "initial",
                            wordWrap: "initial",
                        }}
                    >
                        {strings.i18n._("useDefaultApiKeyDescription")}
                    </p>
                )
            default:
                console.error(`[API key]: unknown API key strategy: ${strategyKey}`)
                return <p>{strings.i18n._("oopsSomethingIsWrongWithApiKeyStrategy")}</p>
        }
    }

    function usernameErrorMsgDecorator(): ReactElement {
        return (
            <div
                style={{
                    height: usernameIsValid ? 0 : "20px",
                    overflow: "hidden",
                    transition: "height 0.3s ease",
                    color: "red",
                    fontSize: "12px",
                    marginTop: "5px",
                }}
            >
                {usernameErrorMsg}
            </div>
        )
    }

    return (
        <div
            id="homeScreen"
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div style={{ width: "600px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>{strings.i18n._("userSettings")}</h1>
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
                    <Input
                        isRequired
                        isInvalid={!usernameIsValid}
                        errorMessage={usernameErrorMsgDecorator()}
                        label={strings.i18n._("username")}
                        placeholder={strings.i18n._("howToCallYou")}
                        value={username}
                        onChange={(e) => {
                            setUsernameInStorage(e.target.value)
                            setUsername(e.target.value)
                        }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "16px" }}>
                    <p>{strings.i18n._("whatDoWeDoWithTheApiKey")}</p>
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
                                const newStrategy = [...strategyKeys][0] as ApiKeyStrategy
                                setApiKeyStrategyInStorage(newStrategy)
                                setApiKeyStrategy(newStrategy)
                            }}
                        >
                            <DropdownItem key={ApiKeyStrategy.UseMyOwn} style={{ width: "500px" }}>
                                {apiKeyStrategyDisplay(ApiKeyStrategy.UseMyOwn)}
                                {apiKeyStrategyDescriptionDisplay(ApiKeyStrategy.UseMyOwn)}
                            </DropdownItem>
                            <DropdownItem key={ApiKeyStrategy.DoNotUse} style={{ width: "500px" }}>
                                {apiKeyStrategyDisplay(ApiKeyStrategy.DoNotUse)}
                                {apiKeyStrategyDescriptionDisplay(ApiKeyStrategy.DoNotUse)}
                            </DropdownItem>
                            <DropdownItem key={ApiKeyStrategy.UseDefault} style={{ width: "500px" }}>
                                {apiKeyStrategyDisplay(ApiKeyStrategy.UseDefault)}
                                {apiKeyStrategyDescriptionDisplay(ApiKeyStrategy.UseDefault)}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                {apiKeyStrategy === "useMyOwn" &&
                    (apiKeyIsValid ? (
                        <Input
                            isRequired
                            label={strings.i18n._("apiKey")}
                            placeholder={strings.i18n._("apiKeyInputPlaceholder")}
                            value={apiKey}
                            onChange={(e) => {
                                setApiKeyInStorage(e.target.value)
                                setApiKey(e.target.value)
                            }}
                        />
                    ) : (
                        <Input
                            isRequired
                            isInvalid
                            label={strings.i18n._("apiKey")}
                            placeholder={strings.i18n._("apiKeyInputPlaceholder")}
                            value={apiKey}
                            onChange={(e) => {
                                setApiKeyInStorage(e.target.value)
                                setApiKey(e.target.value)
                            }}
                        />
                    ))}
                <AccordionWithResponsiveBackground title={strings.i18n._("aboutApiKeyTitle")}>
                    {strings.i18n._("aboutApiKeyBeforeInstruction")}
                    <a
                        href="https://www.geohub.gg/custom-key-instructions.pdf"
                        target="blank"
                        style={{ color: "blue", fontStyle: "italic", textDecoration: "underline" }}
                    >
                        {strings.i18n._("aboutApiKeyInstruction")}
                    </a>
                    {strings.i18n._("aboutApiKeyAfterInstruction1")}
                    <br />
                    <br />
                    {strings.i18n._("aboutApiKeyAfterInstruction2")}
                    <br />
                    <br />
                    {strings.i18n._("aboutApiKeyAfterInstruction3")}
                </AccordionWithResponsiveBackground>
                <Divider />
                <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>{strings.i18n._("connectToExistingRoom")}</h1>
                <Input
                    isRequired
                    value={targetRoomID}
                    onChange={(e) => setTargetRoomID(e.target.value)}
                    label={strings.i18n._("roomId")}
                    placeholder={strings.i18n._("roomIdPlaceholder")}
                />
                {canJoinToRoom() ? (
                    <Button onPress={handleConnectToRoom} color="primary" style={{ width: "120px" }}>
                        {strings.i18n._("connect")}
                    </Button>
                ) : (
                    <Button isDisabled color="primary" style={{ width: "120px" }}>
                        {strings.i18n._("connect")}
                    </Button>
                )}
                <Divider />
                <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>{strings.i18n._("createNewRoom")}</h1>
                {canCreateRoom() ? (
                    <Button onPress={handleCreateRoom} color="primary" style={{ width: "120px" }}>
                        {strings.i18n._("create")}
                    </Button>
                ) : (
                    <Button isDisabled color="primary" style={{ width: "120px" }}>
                        {strings.i18n._("create")}
                    </Button>
                )}
            </div>

            <div style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: 1 }}>
                <PreferencesButton />
            </div>

            <div
                style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 1 }}
            >
                <HealthcheckFailedWarning />
            </div>

            <Modal size={"4xl"} isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{strings.i18n._("chooseYourAvatar")}</ModalHeader>
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
        </div>
    )
}
