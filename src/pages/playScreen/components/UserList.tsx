import { useLingui } from "@lingui/react"
import {
    Avatar,
    Badge,
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from "@nextui-org/react"
import { banUser, changeUserScore, muteUser, unmuteUser } from "api/http"
import { UnmuteUserResponse } from "api/responses"
import { chatEventBus, ChatEventType } from "events/chat"
import { User } from "models/all"
import { useTheme } from "next-themes"
import React, { ReactElement, useContext, useState } from "react"
import { FaCoins, FaEllipsisVertical, FaSkullCrossbones } from "react-icons/fa6"
import { GiSpeaker, GiSpeakerOff } from "react-icons/gi"
import { HiOutlineAtSymbol } from "react-icons/hi"
import { useParams } from "react-router-dom"
import { RoomMetaInfoContext } from "state/roomMetaInfo"
import { UsersContext } from "state/users"

function medalOfIndex(index: number): string {
    switch (index) {
        case 0:
            return "🥇"
        case 1:
            return "🥈"
        case 2:
            return "🥉"
        default:
            return ""
    }
}

export default function UserList(): ReactElement {
    const { id } = useParams()
    const { theme } = useTheme()
    const strings = useLingui()
    const users = useContext(UsersContext)
    const banUserModal = useDisclosure()
    const changeUserScoreModal = useDisclosure()
    const [usernameToEdit, setUsernameToEdit] = useState("")
    const [userIdToBan, setUserIdToBan] = useState("")
    const [publicIdWhoseCreditsToChange, setPublicIdWhoseCreditsToChange] = useState("")
    const [changeUserCreditsAmount, setChangeUserCreditsAmount] = useState(0)
    const chipBackground = theme === "light" ? "rgb(242, 244, 245)" : "rgb(75 85 99)"
    const { iAmHost, showLastRoundScore } = useContext(RoomMetaInfoContext)

    function getUserAvatarCell(user: User): ReactElement {
        let avatar = <Avatar name={user.avatarEmoji} style={{ fontSize: "35px" }} />
        if (user.submittedGuess) {
            avatar = (
                <Badge
                    content="✔"
                    color="success"
                    size="sm"
                    placement="bottom-left"
                    shape="circle"
                    style={{ color: "white" }}
                >
                    {avatar}
                </Badge>
            )
        }
        if (user.isMuted) {
            avatar = (
                <Badge content="✖" color="default" size="sm" placement="bottom-right">
                    {avatar}
                </Badge>
            )
        }
        if (user.isHost) {
            avatar = (
                <Badge content={strings.i18n._("host")} color="danger" size="sm">
                    {avatar}
                </Badge>
            )
        }
        return <TableCell style={{ fontWeight: "bold" }}>{avatar}</TableCell>
    }

    function getUserOptionsCell(user: User): ReactElement {
        let dropdownMenu
        if (!iAmHost) {
            dropdownMenu = (
                <DropdownMenu>
                    <DropdownItem
                        key="tagInTheChat"
                        color="default"
                        startContent={<HiOutlineAtSymbol />}
                        onClick={() => chatEventBus.emit({ type: ChatEventType.UserMentioned, username: user.name })}
                    >
                        {strings.i18n._("tagInTheChat")}
                    </DropdownItem>
                </DropdownMenu>
            )
        } else {
            dropdownMenu = user.isHost ? (
                <DropdownMenu>
                    <DropdownItem
                        key="tagInTheChat"
                        color="default"
                        startContent={<HiOutlineAtSymbol />}
                        onClick={() => chatEventBus.emit({ type: ChatEventType.UserMentioned, username: user.name })}
                    >
                        {strings.i18n._("tagInTheChat")}
                    </DropdownItem>
                    <DropdownItem
                        key="changeScore"
                        color="default"
                        startContent={<FaCoins />}
                        onClick={() => {
                            setPublicIdWhoseCreditsToChange(user.publicId)
                            setUsernameToEdit(user.name)
                            changeUserScoreModal.onOpen()
                        }}
                    >
                        {strings.i18n._("changeScore")}
                    </DropdownItem>
                </DropdownMenu>
            ) : (
                <DropdownMenu>
                    <DropdownItem
                        key="tagInTheChat"
                        color="default"
                        startContent={<HiOutlineAtSymbol />}
                        onClick={() => chatEventBus.emit({ type: ChatEventType.UserMentioned, username: user.name })}
                    >
                        {strings.i18n._("tagInTheChat")}
                    </DropdownItem>
                    <DropdownItem
                        key="changeScore"
                        color="default"
                        startContent={<FaCoins />}
                        onClick={() => {
                            setPublicIdWhoseCreditsToChange(user.publicId)
                            setUsernameToEdit(user.name)
                            changeUserScoreModal.onOpen()
                        }}
                    >
                        {strings.i18n._("changeScore")}
                    </DropdownItem>

                    <DropdownItem
                        key="mute"
                        color={user.isMuted ? "default" : "warning"}
                        startContent={user.isMuted ? <GiSpeaker /> : <GiSpeakerOff />}
                        onClick={
                            user.isMuted
                                ? (): Promise<UnmuteUserResponse> => unmuteUser(id!, user.publicId)
                                : (): Promise<UnmuteUserResponse> => muteUser(id!, user.publicId)
                        }
                    >
                        {user.isMuted ? strings.i18n._("unmute") : strings.i18n._("mute")}
                    </DropdownItem>

                    <DropdownItem
                        key="ban"
                        color="danger"
                        startContent={<FaSkullCrossbones />}
                        onClick={() => {
                            setUsernameToEdit(user.name)
                            setUserIdToBan(user.publicId)
                            banUserModal.onOpen()
                        }}
                    >
                        {strings.i18n._("ban")}
                    </DropdownItem>
                </DropdownMenu>
            )
        }
        return (
            <TableCell>
                <Dropdown placement="bottom">
                    <DropdownTrigger>
                        <Button isIconOnly variant="light" size="sm">
                            <FaEllipsisVertical />
                        </Button>
                    </DropdownTrigger>
                    {dropdownMenu}
                </Dropdown>
                <Modal
                    size={"lg"}
                    isOpen={banUserModal.isOpen}
                    onOpenChange={banUserModal.onOpenChange}
                    onClose={() => {
                        setUsernameToEdit("")
                        setUserIdToBan("")
                    }}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>
                                    {strings.i18n._("doYouReallyWantToBan")} {usernameToEdit}?
                                </ModalHeader>
                                <ModalFooter>
                                    <Button color="primary" onPress={onClose}>
                                        {strings.i18n._("oopsNo")}
                                    </Button>
                                    <Button
                                        color="danger"
                                        onPress={() => {
                                            setUsernameToEdit("")
                                            setUserIdToBan("")
                                            banUser(id!, userIdToBan)
                                            onClose()
                                        }}
                                    >
                                        {strings.i18n._("strongYes")}
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal
                    size={"lg"}
                    isOpen={changeUserScoreModal.isOpen}
                    onOpenChange={changeUserScoreModal.onOpenChange}
                    onClose={() => {
                        setChangeUserCreditsAmount(0)
                        setUsernameToEdit("")
                        setPublicIdWhoseCreditsToChange("")
                    }}
                >
                    <ModalContent>
                        {(_onClose) => (
                            <>
                                <ModalHeader>
                                    {strings.i18n._("changingUserScore")} {usernameToEdit}
                                </ModalHeader>
                                <ModalBody>
                                    <Input
                                        type="number"
                                        value={changeUserCreditsAmount.toString()}
                                        onValueChange={(value) => setChangeUserCreditsAmount(Number(value))}
                                    />
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color="primary"
                                        onPress={() => {
                                            setChangeUserCreditsAmount(0)
                                            setUsernameToEdit("")
                                            setPublicIdWhoseCreditsToChange("")
                                            changeUserScoreModal.onClose()
                                        }}
                                    >
                                        {strings.i18n._("backIChangedMyMind")}
                                    </Button>
                                    <Button
                                        color="primary"
                                        onPress={() => {
                                            changeUserScore(id!, publicIdWhoseCreditsToChange, changeUserCreditsAmount)
                                            setChangeUserCreditsAmount(0)
                                            setUsernameToEdit("")
                                            setPublicIdWhoseCreditsToChange("")
                                            changeUserScoreModal.onClose()
                                        }}
                                    >
                                        {strings.i18n._("goAhead")}
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </TableCell>
        )
    }

    return (
        <div id="userList" style={{ height: "100%", flexGrow: 1, overflowX: "hidden" }}>
            <Table removeWrapper hideHeader aria-label="List of users in the room">
                <TableHeader>
                    <TableColumn>Avatar</TableColumn>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Score</TableColumn>
                    <TableColumn>Options</TableColumn>
                </TableHeader>
                <TableBody>
                    {users.map((user, index) => (
                        <TableRow key={user.name}>
                            {getUserAvatarCell(user)}
                            <TableCell style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>{user.name}</TableCell>
                            <TableCell style={{ whiteSpace: "nowrap" }}>
                                <Badge
                                    content={`+${user.lastRoundScore}`}
                                    color="primary"
                                    size="md"
                                    placement="bottom-right"
                                    isInvisible={
                                        !(showLastRoundScore && user.lastRoundScore !== null && user.lastRoundScore > 0)
                                    }
                                >
                                    <Chip style={{ background: chipBackground }}>{user.score}</Chip>
                                </Badge>
                                <span style={{ marginLeft: "3px" }}></span>
                                {medalOfIndex(index) !== "" && (
                                    <Chip style={{ background: chipBackground }}>{medalOfIndex(index)}</Chip>
                                )}
                            </TableCell>
                            {getUserOptionsCell(user)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
