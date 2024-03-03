import {
    Avatar, Badge, Chip, ScrollShadow, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow,
} from "@nextui-org/react";

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

function UserList({ users }) {
    return (
        <div id="userList" style={{ height: "100%", flexGrow: 1, overflow: "auto" }}>
            <ScrollShadow>
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
                                    <Chip style={{ background: "rgb(242, 244, 245)" }}>{user.score}</Chip>
                                    <span style={{ marginLeft: "3px" }} ></span>
                                    {medalOfIndex(index) !== ""
                                        && <Chip style={{ background: "rgb(242, 244, 245)" }}>
                                            {medalOfIndex(index)}
                                        </Chip>
                                    }
                                </TableCell>
                                <TableCell>{user.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollShadow>
        </div>
    );
}

export default UserList;
