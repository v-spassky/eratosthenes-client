import {
    Avatar, Badge, Chip, ScrollShadow, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow,
} from "@nextui-org/react";

const users = [
    {
        id: 1,
        name: "шарпомуха",
        avatarEmoji: "💂‍♂️",
        score: 1053,
        isHost: false,
        description: "Его фасеточные глаза смотрят мне прямо в душу.",
    },
    {
        id: 2,
        name: "джеваскуф",
        avatarEmoji: "🏄🏼",
        score: 755,
        isHost: false,
        description: "Его код - это произведение искусства, а комментарии - поэзия.",
    },
    {
        id: 3,
        name: "Влад",
        avatarEmoji: "🐘",
        score: 698,
        isHost: false,
        description: "Он всегда готов помочь, даже если это означает, что он будет спать на клавиатуре.",
    },
    {
        id: 4,
        name: "Александр К",
        avatarEmoji: "🦀",
        score: 686,
        isHost: true,
        description: "Он знает все мемы и всегда готов рассмешить.",
    },
    {
        id: 5,
        name: "Игорь",
        avatarEmoji: "🐺",
        score: 542,
        isHost: false,
        description: "Он мастер перевоплощения и может стать кем угодно, от пирата до принцессы.",
    },
    {
        id: 6,
        name: "Наташа",
        avatarEmoji: "👷‍♀️",
        score: 431,
        isHost: false,
        description: "Она может петь как соловей, а ее танцы завораживают.",
    },
    {
        id: 7,
        name: "Сергей",
        avatarEmoji: "🤤",
        score: 235,
        isHost: false,
        description: "Он мастер на все руки и может починить все, от сломанного тостера до разбитого сердца.",
    },
    {
        id: 8,
        name: "Оля",
        avatarEmoji: "🙎‍♀️",
        score: 112,
        isHost: false,
        description: "Она всегда знает, как поднять настроение, даже в самый хмурый день.",
    },
];

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

function UserList() {
    return (
        <div id="userList" style={{ height: "100%", flexGrow: 1, padding: 10, overflow: "auto" }}>
            <ScrollShadow>
                <Table removeWrapper hideHeader aria-label="Example static collection table">
                    <TableHeader>
                        <TableColumn>Avatar</TableColumn>
                        <TableColumn>Name</TableColumn>
                        <TableColumn>Score</TableColumn>
                        <TableColumn>Description</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow key={user.id}>
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
