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
import { User } from "models/all"
import { useTheme } from "next-themes"
import React, { ReactElement, useState } from "react"
import { FaCoins, FaEllipsisVertical, FaSkullCrossbones } from "react-icons/fa6"
import { GiSpeaker, GiSpeakerOff } from "react-icons/gi"
import { useParams } from "react-router-dom"

interface UserListProps {
    users: User[]
    showLastRoundScore: boolean
    iAmHost: boolean
}

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

export default function UserList({ users, showLastRoundScore, iAmHost }: UserListProps): ReactElement {
    const { id } = useParams()
    const { theme } = useTheme()
    const banUserModal = useDisclosure()
    const changeUserScoreModal = useDisclosure()
    const [usernameToEdit, setUsernameToEdit] = useState("")
    const [publicIdWhoseCreditsToChange, setPublicIdWhoseCreditsToChange] = useState("")
    const [changeUserCreditsAmount, setChangeUserCreditsAmount] = useState(0)
    const chipBackground = theme === "light" ? "rgb(242, 244, 245)" : "rgb(75 85 99)"

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
                <Badge content="хост" color="danger" size="sm">
                    {avatar}
                </Badge>
            )
        }
        return <TableCell style={{ fontWeight: "bold" }}>{avatar}</TableCell>
    }

    function getUserOptionsCell(user: User): ReactElement {
        if (!iAmHost) {
            return (
                <TableCell>
                    <></>
                </TableCell>
            )
        }
        const dropdownMenu = user.isHost ? (
            <DropdownMenu>
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
                    Изменить очки
                </DropdownItem>
            </DropdownMenu>
        ) : (
            <DropdownMenu>
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
                    Изменить очки
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
                    {user.isMuted ? "Размьютить" : "Замьютить"}
                </DropdownItem>

                <DropdownItem
                    key="ban"
                    color="danger"
                    startContent={<FaSkullCrossbones />}
                    onClick={() => {
                        setUsernameToEdit(user.name)
                        banUserModal.onOpen()
                    }}
                >
                    Забанить
                </DropdownItem>
            </DropdownMenu>
        )
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
                    onClose={() => setUsernameToEdit("")}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Точно хочешь забанить {usernameToEdit}?</ModalHeader>
                                <ModalFooter>
                                    <Button color="primary" onPress={onClose}>
                                        Ой, нет...
                                    </Button>
                                    <Button
                                        color="danger"
                                        onPress={() => {
                                            setUsernameToEdit("")
                                            banUser(id!, user.publicId)
                                            onClose()
                                        }}
                                    >
                                        Да!
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
                                <ModalHeader>Изменение количество очков {usernameToEdit}</ModalHeader>
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
                                        Назад, я передумал
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
                                        Вперёд!
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </TableCell>
        )
    }

    const regularUserList = (
        <div id="userList" style={{ height: "100%", flexGrow: 1, overflowX: "hidden" }}>
            <Table removeWrapper hideHeader aria-label="List of users in the room">
                <TableHeader>
                    <TableColumn>Avatar</TableColumn>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Score</TableColumn>
                    <TableColumn>Description</TableColumn>
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
                                    isInvisible={!(showLastRoundScore && user.lastRoundScore !== null)}
                                >
                                    <Chip style={{ background: chipBackground }}>{user.score}</Chip>
                                </Badge>
                                <span style={{ marginLeft: "3px" }}></span>
                                {medalOfIndex(index) !== "" && (
                                    <Chip style={{ background: chipBackground }}>{medalOfIndex(index)}</Chip>
                                )}
                            </TableCell>
                            <TableCell>{user.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )

    const hostUserList = (
        <div id="userList" style={{ height: "100%", flexGrow: 1, overflowX: "hidden" }}>
            <Table removeWrapper hideHeader aria-label="List of users in the room">
                <TableHeader>
                    <TableColumn>Avatar</TableColumn>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Score</TableColumn>
                    <TableColumn>Description</TableColumn>
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
                                    isInvisible={!(showLastRoundScore && user.lastRoundScore !== null)}
                                >
                                    <Chip style={{ background: chipBackground }}>{user.score}</Chip>
                                </Badge>
                                <span style={{ marginLeft: "3px" }}></span>
                                {medalOfIndex(index) !== "" && (
                                    <Chip style={{ background: chipBackground }}>{medalOfIndex(index)}</Chip>
                                )}
                            </TableCell>
                            <TableCell>{user.description}</TableCell>
                            {getUserOptionsCell(user)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )

    return iAmHost ? hostUserList : regularUserList
}
