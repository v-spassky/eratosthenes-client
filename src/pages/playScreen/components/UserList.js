import {
    Avatar, Badge, Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input,
    Modal, ModalBody, ModalContent,
    ModalFooter, ModalHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure,
} from "@nextui-org/react";
import { banUser, changeUserScore, muteUser, unmuteUser } from "api/http.js";
import { useTheme } from "next-themes";
import { useState } from "react";
import { FaCoins, FaEllipsisVertical, FaSkullCrossbones } from "react-icons/fa6";
import { GiSpeaker, GiSpeakerOff } from "react-icons/gi";
import { useParams } from "react-router-dom";

function medalOfIndex(index) {
    switch (index) {
        case 0:
            return "🥇";
        case 1:
            return "🥈";
        case 2:
            return "🥉";
        default:
            return "";
    }
}

export default function UserList({ users, showLastRoundScore, iAmHost }) {
    const { id } = useParams();
    const { theme, _setTheme } = useTheme();
    const banUserModal = useDisclosure();
    const changeUserScoreModal = useDisclosure();
    const [usernameWhoseCreditsToChange, setUsernameWhoseCreditsToChange] = useState("");
    const [changeUserCreditsAmount, setChangeUserCreditsAmount] = useState(0);
    const chipBackground = theme === "light" ? "rgb(242, 244, 245)" : "rgb(75 85 99)";

    function getUserAvatarCell(user) {
        let avatar = <Avatar name={user.avatarEmoji} style={{ fontSize: "35px" }} />;
        if (user.submittedGuess) {
            avatar = <Badge
                content="✔"
                color="success"
                size="sm"
                placement="bottom-left"
                shape="circle"
                style={{ color: "white" }}
            >
                {avatar}
            </Badge>;
        }
        if (user.isMuted) {
            avatar = <Badge content="✖" color="default" size="sm" placement="bottom-right">
                {avatar}
            </Badge>;
        }
        if (user.isHost) {
            avatar = <Badge content="хост" color="danger" size="sm">
                {avatar}
            </Badge>;
        }
        return <TableCell style={{ fontWeight: "bold" }}>{avatar}</TableCell>;
    }

    function getUserOptionsCell(user) {
        if (!iAmHost) {
            return <TableCell></TableCell>;
        }
        return <TableCell>
            <Dropdown placement="bottom">
                <DropdownTrigger>
                    <Button isIconOnly variant="light" size="sm">
                        <FaEllipsisVertical />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu>
                    <DropdownItem
                        key="changeScore"
                        color="default"
                        startContent={<FaCoins />}
                        onClick={() => {
                            setUsernameWhoseCreditsToChange(user.name);
                            changeUserScoreModal.onOpen();
                        }}
                    >
                        Изменить очки
                    </DropdownItem>
                    {!user.isHost &&
                        <DropdownItem
                            key="mute"
                            color={user.isMuted ? "default" : "warning"}
                            startContent={user.isMuted ? <GiSpeaker /> : <GiSpeakerOff />}
                            onClick={user.isMuted ? () => unmuteUser(id, user.name) : () => muteUser(id, user.name)}
                        >
                            {user.isMuted ? "Размьютить" : "Замьютить"}
                        </DropdownItem>
                    }
                    {!user.isHost &&
                        <DropdownItem
                            key="ban"
                            color="danger"
                            startContent={<FaSkullCrossbones />}
                            onClick={banUserModal.onOpen}
                        >
                            Забанить
                        </DropdownItem>
                    }
                </DropdownMenu>
            </Dropdown>
            <Modal size={"lg"} isOpen={banUserModal.isOpen} onOpenChange={banUserModal.onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Точно хочешь забанить {user.name}?</ModalHeader>
                            <ModalFooter>
                                <Button color="primary" onPress={onClose}>Ой, нет...</Button>
                                <Button
                                    color="danger"
                                    onPress={() => {
                                        banUser(id, user.name);
                                        onClose();
                                    }}>
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
                    setChangeUserCreditsAmount(0);
                    setUsernameWhoseCreditsToChange("");
                }}
            >
                <ModalContent>
                    {(_onClose) => (
                        <>
                            <ModalHeader>Изменение количество очков {usernameWhoseCreditsToChange}</ModalHeader>
                            <ModalBody>
                                <Input
                                    type="number"
                                    value={changeUserCreditsAmount}
                                    onValueChange={(value) => setChangeUserCreditsAmount(Number(value))}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="primary"
                                    onPress={() => {
                                        setChangeUserCreditsAmount(0);
                                        setUsernameWhoseCreditsToChange("");
                                        changeUserScoreModal.onClose();
                                    }}
                                >
                                    Назад, я передумал
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={() => {
                                        changeUserScore(id, usernameWhoseCreditsToChange, changeUserCreditsAmount);
                                        setChangeUserCreditsAmount(0);
                                        setUsernameWhoseCreditsToChange("");
                                        changeUserScoreModal.onClose();
                                    }}
                                >
                                    Вперёд!
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </TableCell>;
    }

    const regularUserList = <div id="userList" style={{ height: "100%", flexGrow: 1, overflowX: "hidden" }}>
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
                            <span style={{ marginLeft: "3px" }} ></span>
                            {medalOfIndex(index) !== ""
                                && <Chip style={{ background: chipBackground }}>
                                    {medalOfIndex(index)}
                                </Chip>
                            }
                        </TableCell>
                        <TableCell>{user.description}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>;

    const hostUserList = <div id="userList" style={{ height: "100%", flexGrow: 1, overflowX: "hidden" }}>
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
                            <span style={{ marginLeft: "3px" }} ></span>
                            {medalOfIndex(index) !== ""
                                && <Chip style={{ background: chipBackground }}>
                                    {medalOfIndex(index)}
                                </Chip>
                            }
                        </TableCell>
                        <TableCell>{user.description}</TableCell>
                        {getUserOptionsCell(user)}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>;

    return iAmHost ? hostUserList : regularUserList;
}
