import { useEffect, useState, useRef } from 'react';
import { Button } from "@nextui-org/react";
import { FaRegMessage } from "react-icons/fa6";
import { Textarea } from "@nextui-org/react";
import { Tooltip } from "@nextui-org/react";
import { useParams, useNavigate } from 'react-router-dom';
import { toast, Slide } from 'react-toastify';

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

function waitForSocketConnection(socket, callback) {
    setTimeout(() => {
        if (socket.readyState === 1) {
            console.log("Connection is made")
            if (callback != null) {
                callback();
            }
        } else {
            console.log("wait for connection...")
            waitForSocketConnection(socket, callback);
        }
    }, 50);
}

function Chat() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [prompt, setPrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)]);
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
            const message = JSON.parse(event.data);
            if (message.type !== "chatMessage") {
                return;
            }
            setMessages(
                messages => [...messages, { id: 1, author: message.payload.from, content: message.payload.content }]
            );
        };
        setTimeout(() => {
            const payload = {
                type: "userConnected",
                payload: {
                    username: localStorage.getItem('username'),
                    avatarEmoji: localStorage.getItem('selectedEmoji'),
                },
            }
            waitForSocketConnection(socketRef.current, () => {
                socketRef.current.send(JSON.stringify(payload));
            });
        }, 50);
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
        const payload = {
            type: "chatMessage",
            payload: {
                from: localStorage.getItem('username'),
                content: message,
            },
        }
        socketRef.current.send(JSON.stringify(payload));
        setMessages([...messages, { id: 1, author: "you", content: message, dateTime: new Date().toISOString() }]);
        setMessage('');
        const newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        setPrompt(newPrompt);
    };

    const handleKeyDown = (event) => {
        if (event.ctrlKey && event.key === "Enter" && textInputIsFocused.current && message.trim() !== "") {
            handleSendMessage(event);
        }
    };

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
