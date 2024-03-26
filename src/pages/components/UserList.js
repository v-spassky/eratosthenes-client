import {
    Avatar, Badge, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow,
} from "@nextui-org/react";
import { useTheme } from "next-themes";

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

export default function UserList({ users }) {
    const { theme, _setTheme } = useTheme();
    const chipBackground = theme === "light" ? "rgb(242, 244, 245)" : "rgb(75 85 99)";

    return <div id="userList" style={{ height: "100%", flexGrow: 1, overflowX: "hidden" }}>
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
                        {user.isHost
                            ? <TableCell style={{ fontWeight: "bold" }}>
                                <Badge content="host" color="danger" size="sm">
                                    <Avatar name={user.avatarEmoji} style={{ fontSize: "35px" }} />
                                </Badge>
                            </TableCell>
                            : <TableCell style={{ fontWeight: "bold" }}>
                                <Avatar name={user.avatarEmoji} style={{ fontSize: "35px" }} />
                            </TableCell>
                        }
                        <TableCell style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>{user.name}</TableCell>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                            <Chip style={{ background: chipBackground }}>{user.score}</Chip>
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
    </div>
}
