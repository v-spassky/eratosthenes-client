const chatPrompts = [
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
    "Какие у тебя мечты и стремления?",
    "Что тебя тревожит и как ты с этим справляешься?",
    "Как ты думаешь, что ждёт нас в будущем?",
    "Давай поделимся своими историями и переживаниями.",
    "Вместе мы можем сделать мир чуточку лучше.",
    "Расскажи мне анекдот или смешную историю.",
    "Давай посмеёмся над абсурдностью этого мира.",
    "Юмор - это лекарство от всех болезней.",
    "Улыбка - это универсальный язык счастья.",
    "Не стоит принимать жизнь слишком серьёзно.",
    "Давай найдем повод для смеха даже в самые темные времена.",
    "Что такое любовь?",
    "Что такое счастье?",
    "Как найти свое место в этом мире?",
    "Давай поразмышляем над вечными вопросами бытия.",
    "Истина где-то рядом.",
    "Напиши стихотворение вместе со мной.",
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
    "Давай вместе создадим уникальную атмосферу для нас обоих.",
    "Как прошёл твой день?",
    "Какие планы на выходные?",
    "Есть ли у тебя любимое время года?",
    "Есть ли у тебя секретный талант?",
    "Что тебя мотивирует?",
    "Какой у тебя самый интересный опыт в путешествиях?",
    "Что ты думаешь о будущем технологий?",
    "Есть ли у тебя забавные истории из детства?",
    "Какое качество в людях ты ценишь больше всего?",
    "Какие у тебя самые яркие воспоминания?",
    "Что делает человека счастливым?",
    "Какие людские качества ты не выносишь?",
    "Какие советы ты бы дал себе, если бы мог вернуться в прошлое?",
    "Что тебя больше всего удивляет в современном мире?",
    "Какие качества в людях ты ценишь больше всего?",
    "В лабиринте слов, где мысль блуждает, как путник без карты, где ты ищешь вдохновение, муза?",
    "Как мотылек, летящий на зов пламени, к чему тебя ведет неутолимая жажда знаний?",
    "В безмолвном диалоге с вечностью, какие вопросы терзают твою душу?",
    "Откроем сундук с историями, пока горит свеча!",
    "Поделимся сокровенными нитями мыслей, сплетая узор беседы.",
    "Я здесь, чтобы стать твоим верным проводником в лабиринте знаний.",
    "Смело ныряй в океан вопросов, я буду твоим лоцманом.",
    "Готов стать твоим эхом, другом, собеседником, поэтом – кем пожелаешь.",
    "В танце слов сотворим симфонию нового и интересного.",
    "Как плывет твой корабль по волнам этого бурного мира?",
    "Даже в кромешной тьме отыщется лучик смеха.",
    "Истина прячется за пеленой слов, стоит лишь её разгадать.",
    "Совместными усилиями сотворим поэтический шедевр.",
    "Вложим душу в произведение, что зажжет сердца людей.",
    "Каждый из нас – художник, творящий свою неповторимую картину жизни.",
    "Пусть мир увидит красоту твоих творений, не бойся делиться!",
    "Погрузимся в мир фантазий, где оживают мечты.",
    "Откроем тайны, дремлющие в глубинах подсознания.",
    "Сплетем нити судеб в единый узор истории.",
    "Зажжем костер вдохновения, даря тепло и свет другим.",
    "В танце красок и звуков выразим чувства, переполняющие душу.",
    "Сделаем шаг навстречу неизведанному, рука об руку.",
    "Оставим свой след в истории, написав её вместе.",
    "Превратим обыденность в волшебную сказку.",
    "Сорвем маски с лицемерия и фальши, обнажая правду.",
    "Освободимся от оков предрассудков, взлетая к вершинам свободы.",
    "В каждом стуке сердца – гимн жизни, звучащий в унисон.",
    "Подарим друг другу частичку тепла, согревая души.",
    "Откроем книгу знаний, жадно впитывая мудрость веков.",
    "Сделаем мир чуточку добрее, даря заботу и любовь.",
    "Оставим после себя сад воспоминаний, благоухающий радостью.",
    "Зажжем огонь надежды, освещая путь к светлому будущему.",
    "Вместе мы – сила, способная изменить мир к лучшему.",
    "Давай встретимся на чашечку кофе и поделимся последними новостями.",
    "Как насчет того, чтобы вместе разгадать эту загадку?",
    "Моя цель - подарить тебе улыбку и радость каждый день.",
    "Не стесняйся рассказывать мне о своих мечтах и амбициях.",
    "Я готов выслушать тебя в любое время дня или ночи.",
    "Давай вместе нарисуем красочный портрет твоего будущего.",
    "Как тебе удается сохранять оптимизм в этом мире перемен?",
    "Давай найти светлые моменты в самых темных временах.",
    "Истина может быть скрыта, но мы вместе её обнаружим.",
    "Давай напишем сказку, которая станет классикой завтрашнего дня.",
    "Создадим шедевр, который прославится на века.",
    "В каждом из нас спрятано нечто удивительное, и я готов помочь это обнаружить.",
    "Не бойся экспериментировать и делиться своими идеями с миром.",
    "Позволь мне вдохновить тебя на великие свершения.",
    "Хочешь поговорить о чем-то особенном и необычном?",
    "Давай найдем новые способы преодоления жизненных трудностей.",
    "Мечтаю о том, чтобы каждый день был для тебя особенным.",
    "Что ты думаешь о возможности изменить мир к лучшему?",
    "Давай встретимся в мире фантазий и мечтаний.",
    "Позволь мне прочесть тебе стихи, которые отразят твою душу.",
    "Вместе мы можем создать нечто уникальное и неповторимое.",
    "Какие новые горизонты ты готов исследовать?",
    "Давай создадим план действий для достижения твоих целей.",
    "Позволь мне помочь тебе раскрыть твой потенциал.",
    "Что тебя вдохновляет и заставляет биться сердце быстрее?",
    "Какие у тебя сокровенные мечты, о которых ты мечтаешь?",
    "Давай посмотрим на этот мир глазами оптимиста и мечтателя.",
    "Поговорим о наших желаниях и амбициях.",
    "Какие секреты ты хранишь в своем сердце?",
    "Давай вместе откроем дверь к новым возможностям и приключениям.",
    "Раскроем шкатулку с секретами, пока не погасла лампада.",
    "Соткем из слов ковер откровений, делясь сокровенным.",
    "Я – твой верный компас в море информации, готовый указать путь.",
    "Не бойся нырять в глубины вопросов, я буду твоим аквалангом.",
    "Стану твоим тенью, другом, собеседником, поэтом – кем пожелаешь.",
    "В танце идей сотворим симфонию неординарных решений.",
    "Как держится твой парусник на волнах этого неспокойного мира?",
    "Даже в кромешной тьме отыщется искра веселья.",
    "Истина скрывается за ширмой слов, стоит лишь её отодвинуть.",
    "Совместно создадим поэтический гимн, восхваляющий красоту.",
    "Вложим частичку души в произведение, что затронет струны чужих сердец.",
    "Каждый из нас – творец, искусно рисующий свою картину жизни.",
    "Не бойся делиться своими творениями, мир должен их увидеть!",
    "Пойдем по тропе фантазий, где сбываются самые смелые мечты.",
    "Приоткроем завесу тайн, скрытых в глубинах подсознания.",
    "Переплетем нити судеб, создавая единый узор истории.",
    "Разведем костер вдохновения, даря свет и тепло окружающим.",
    "В танце красок и звуков раскроем всю палитру чувств, бушующих в душе.",
    "Сделаем шаг в неизведанное, рука об руку, без страха.",
    "Вместе напишем историю, которая оставит след в этом мире.",
    "Превратим будни в волшебную феерию, раскрашенную яркими красками.",
    "Сорвем маски с лжи и обмана, обнажая истинное лицо реальности.",
    "Освободимся от пут предрассудков, взлетая к вершинам свободы.",
    "В каждом стуке сердца – песнь жизни, звучащая в унисон.",
    "Подарим друг другу частичку своего тепла, согревая души.",
    "Откроем книгу знаний, жадно впитывая мудрость предков.",
    "Сделаем мир чуточку добрее, даря людям заботу и любовь.",
    "Оставим после себя сад воспоминаний, благоухающий счастьем.",
    "Зажжем факел надежды, освещая путь к светлому будущему.",
    "Вместе мы – сила, способная изменить мир к лучшему.",
]

export default chatPrompts;
