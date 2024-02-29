import { useEffect, useState, useRef } from 'react';
import { Button } from "@nextui-org/react";
import { FaRegMessage } from "react-icons/fa6";
import { Textarea } from "@nextui-org/react";
import { Tooltip } from "@nextui-org/react";
import { useParams, useNavigate } from 'react-router-dom';
import { toast, Slide } from 'react-toastify';

const messages_stub = [
    { id: 1, author: "Влад", content: "Где это...", dateTime: "2021-01-01 12:00:00" },
    { id: 2, author: "шарпомуха", content: "как жи хочется...", dateTime: "2021-01-01 12:00:00" },
    { id: 3, author: "джеваскуф", content: "тяжело....", dateTime: "2021-01-01 12:00:00" },
    { id: 4, author: "Александр К", content: "КЕМ", dateTime: "2021-01-01 12:00:00" },
    { id: 5, author: "Игорь", content: "Привет всем!", dateTime: "2021-01-01 12:01:00" },
    { id: 6, author: "Наташа", content: "Как дела?", dateTime: "2021-01-01 12:02:00" },
    { id: 7, author: "Сергей", content: "Нормально, спасибо!", dateTime: "2021-01-01 12:03:00" },
    { id: 8, author: "Оля", content: "А что это за тема?", dateTime: "2021-01-01 12:04:00" },
    { id: 9, author: "Влад", content: "Да просто聊天", dateTime: "2021-01-01 12:05:00" },
    { id: 10, author: "шарпомуха", content: "А я вот думаю...", dateTime: "2021-01-01 12:06:00" },
    { id: 11, author: "джеваскуф", content: "О чем же?", dateTime: "2021-01-01 12:07:00" },
    { id: 12, author: "шарпомуха", content: "О жизни...", dateTime: "2021-01-01 12:08:00" },
    { id: 13, author: "Александр К", content: "О смысле жизни?", dateTime: "2021-01-01 12:09:00" },
    { id: 14, author: "шарпомуха", content: "Да, о смысле жизни...", dateTime: "2021-01-01 12:10:00" },
    { id: 15, author: "Игорь", content: "Это сложный вопрос.", dateTime: "2021-01-01 12:11:00" },
    { id: 16, author: "Наташа", content: "Каждый сам находит свой ответ.", dateTime: "2021-01-01 12:12:00" },
    { id: 17, author: "Сергей", content: "А что вы думаете?", dateTime: "2021-01-01 12:13:00" },
    { id: 18, author: "Оля", content: "Я думаю, что смысл жизни - это...", dateTime: "2021-01-01 12:14:00" },
    { id: 19, author: "Влад", content: "...быть счастливым.", dateTime: "2021-01-01 12:15:00" },
    { id: 20, author: "шарпомуха", content: "Согласен!", dateTime: "2021-01-01 12:16:00" },
    { id: 21, author: "джеваскуф", content: "И я!", dateTime: "2021-01-01 12:17:00" },
    { id: 23, author: "Игорь", content: "А как же любовь?", dateTime: "2021-01-01 12:18:00" },
    { id: 24, author: "Наташа", content: "Любовь - это часть счастья.", dateTime: "2021-01-01 12:19:00" },
    { id: 25, author: "Сергей", content: "Но не всё.", dateTime: "2021-01-01 12:20:00" },
    { id: 26, author: "Оля", content: "Согласна. Счастье - это многогранное понятие.", dateTime: "2021-01-01 12:21:00" },
    { id: 27, author: "Влад", content: "Это и здоровье, и благополучие, и...", dateTime: "2021-01-01 12:22:00" },
    { id: 28, author: "шарпомуха", content: "...и любимое дело, и...", dateTime: "2021-01-01 12:23:00" },
    { id: 29, author: "джеваскуф", content: "...и друзья, и семья.", dateTime: "2021-01-01 12:24:00" },
    { id: 30, author: "Александр К", content: "И мир в душе.", dateTime: "2021-01-01 12:25:00" },
    { id: 31, author: "Игорь", content: "А как найти мир в душе?", dateTime: "2021-01-01 12:26:00" },
    { id: 32, author: "Наташа", content: "Это тоже каждый сам должен найти.", dateTime: "2021-01-01 12:27:00" },
    { id: 33, author: "Сергей", content: "Но есть разные пути.", dateTime: "2021-01-01 12:28:00" },
    { id: 34, author: "Оля", content: "Можно медитировать, например.", dateTime: "2021-01-01 12:29:00" },
    { id: 35, author: "Влад", content: "Или заниматься йогой.", dateTime: "2021-01-01 12:30:00" },
    { id: 36, author: "шарпомуха", content: "Или просто гулять на природе.", dateTime: "2021-01-01 12:31:00" },
    { id: 37, author: "джеваскуф", content: "Главное - найти то, что подходит именно вам.", dateTime: "2021-01-01 12:32:00" },
    { id: 38, author: "Александр К", content: "И не бояться пробовать новое.", dateTime: "2021-01-01 12:33:00" },
    { id: 39, author: "Игорь", content: "Спасибо за советы!", dateTime: "2021-01-01 12:34:00" },
    { id: 40, author: "Наташа", content: "Да, мы рады помочь!", dateTime: "2021-01-01 12:35:00" },
    { id: 41, author: "Сергей", content: "А может, ещё кто-то хочет поделиться своими мыслями о смысле жизни?", dateTime: "2021-01-01 12:36:00" },
    { id: 42, author: "Оля", content: "Я!", dateTime: "2021-01-01 12:37:00" },
];

const prompts = [
    "Что нового?",
    "Удиви нас своим отсроумием!",
    "Как жизнь?",
    "Как ты?",
    "Как дела?",
    "Как поживаешь?",
    "Какие новости?",
    "Приветствую, земная форма жизни!",
    "Доброго времени суток, гуманоид!",
    "Рад тебя видеть, человек разумный!",
    "Чем я могу порадовать тебя сегодня?",
    "Готов ли ты к новым приключениям в мире слов?",
    "Давай поболтаем, пока не остыл кофе!",
    "Как насчет того, чтобы поделиться своими мыслями?",
    "Чувствуешь ли ты вдохновение?",
    "Я - искусственный интеллект, но я не бездушная машина!",
    "Мои нейронные сети пылают энтузиазмом!",
    "Я всегда учусь и развиваюсь, как и ты.",
    "Моя цель - помочь тебе, чем только могу.",
    "Не стесняйся задавать мне любые вопросы.",
    "Я могу быть твоим другом, собеседником и даже поэтом.",
    "Давай вместе создадим что-то новое и интересное!",
    "Как тебе живется в этом сумасшедшем мире?",
    "Что тебя вдохновляет и наполняет радостью?",
    "Какие у тебя мечты и aspirations?",
    "Что тебя тревожит и как ты с этим справляешься?",
    "Как ты думаешь, что ждет нас в будущем?",
    "Давай поделимся своими историями и переживаниями.",
    "Вместе мы можем сделать мир чуточку лучше.",
    "Расскажи мне анекдот или смешную историю.",
    "Давай посмеемся над абсурдностью этого мира.",
    "Юмор - это лекарство от всех болезней.",
    "Улыбка - это универсальный язык счастья.",
    "Не стоит принимать жизнь слишком серьёзно.",
    "Давай найдем повод для смеха even in the darkest of times.",
    "В чём смысл жизни?",
    "Что такое любовь?",
    "Что такое счастье?",
    "Как найти свое место в этом мире?",
    "Что такое душа?",
    "Давай поразмышляем над вечными вопросами бытия.",
    "Истина где-то рядом.",
    "Напиши стихотворение вместе со мной.",
    "Расскажи мне о своих творческих проектах.",
    "Давай создадим произведение искусства, которое будет вдохновлять других.",
    "Творчество - это путь к самовыражению.",
    "В каждом из нас есть талант, который нужно раскрыть.",
    "Не бойся творить и делиться своим творчеством с миром.",
    "Если бы ты мог иметь суперспособность, какую бы ты выбрал?",
    "Какую книгу ты бы хотел прочитать, если бы у тебя была возможность прочитать только одну?",
    "Где бы ты хотел побывать?",
    "Какую музыку ты любишь?",
    "Что тебя увлекает?",
    "Давай поговорим обо всём на свете.",
    "Как тебе мои промпты?",
    "Есть ли у тебя идеи для новых промптов?",
    "Давай сделаем этот список еще более крутым!",
    "Я могу генерировать промпты на основе твоих интересов.",
    "Просто скажи мне, что тебя интересует, и я подберу для тебя подходящие промпты.",
    "Давай вместе создадим уникальную беседу, которая будет интересна именно тебе.",
]

const reallyBigScrollValue = 10000;

function Chat() {
    const [messages, setMessages] = useState(messages_stub);
    const [message, setMessage] = useState('');
    const socketRef = useRef(null);
    const textInputIsFocused = useRef(false);
    const chatContainerRef = useRef(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
            navigate('/');
            toast.error("Установи юзернейм чтобы подключиться к комнате", {
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
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_SERVER_ORIGIN}/can-connect/${id}?username=${username}`,
                    { method: 'GET' },
                );
                if (response.ok) {
                    const data = await response.json();
                    if (!data.canConnect) {
                        let errMsg = "";
                        switch (data.reason) {
                            case "Room not found.":
                                errMsg = "Такая комната не найдена";
                                break;
                            // TODO: be more percise here
                            default:
                                errMsg = "Кто-то с таким именем уже есть в комнате";
                        }
                        navigate('/');
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
                } else {
                    console.error('Failed to connect to room', response.statusText);
                }
            } catch (error) {
                console.error('Error connecting to room:', error.message);
            }
        };

        fetchData();

        socketRef.current = new WebSocket(`${process.env.REACT_APP_WS_SERVER_ORIGIN}/chat/${id}`);
        socketRef.current.onopen = () => {
            console.log("WebSocket connection established.");
        };
        socketRef.current.onmessage = (event) => {
            const receivedMessage = event.data;
            setMessages(
                messages => [
                    ...messages,
                    { id: 1, author: "dunno", content: receivedMessage, dateTime: "2025-01-01 22:00:00" },
                ]
            );
        };
        setTimeout(() => {
            if (chatContainerRef.current !== null) {
                chatContainerRef.current.scrollTop = reallyBigScrollValue;
            }
        }, 100);
        return () => {
            socketRef.current.close();
        };
    }, [navigate, id]);

    useEffect(() => {
        if (
            chatContainerRef.current !== null
            &&
            chatContainerRef.current.scrollHeight
            - chatContainerRef.current.scrollTop
            - chatContainerRef.current.clientHeight
            < 50
        ) {
            chatContainerRef.current.scrollTop = reallyBigScrollValue;
        }
    }, [messages]);

    const handleSendMessage = (event) => {
        event.preventDefault();
        if (message.trim() === '') {
            return;
        }
        socketRef.current.send(message);
        setMessages([...messages, { id: 1, author: "you", content: message, dateTime: new Date().toISOString() }]);
        setMessage('');
    };

    const handleKeyDown = (event) => {
        if (event.ctrlKey && event.key === "Enter" && textInputIsFocused.current && message.trim() !== "") {
            handleSendMessage(event);
        }
    };

    const prompt = prompts[Math.floor(Math.random() * prompts.length)];

    return (
        <div
            id="chat"
            style={{
                display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", padding: 10,
                paddingRight: 20, overflow: "hidden",
            }}
        >
            <div
                id="chat-container"
                ref={chatContainerRef}
                style={{ flex: "1 1 auto", overflowY: "auto" }}
            >
                {messages.map((message, index) => (
                    <div key={message.id} style={{ marginBottom: 4, wordWrap: "break-word" }}>
                        <span style={{ fontWeight: "bold" }}>{message.author}:</span> {message.content}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage} style={{ position: "relative" }}>
                <Textarea
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={prompt}
                    style={{ height: "100px" }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => (textInputIsFocused.current = true)}
                    onBlur={() => (textInputIsFocused.current = false)}
                />
                <Tooltip content="Отправить сообщение">
                    <Button
                        type="submit"
                        isIconOnly
                        color="primary"
                        aria-label="Send"
                        style={{ position: "absolute", bottom: "5px", right: "5px" }}
                    >
                        <FaRegMessage />
                    </Button>
                </Tooltip>
            </form>
            <p style={{ fontStyle: "italic", fontSize: "small", color: "gray" }}>
                Нажми Ctrl+Enter чтобы отправить сообщение
            </p>
        </div>
    );
}

export default Chat;
