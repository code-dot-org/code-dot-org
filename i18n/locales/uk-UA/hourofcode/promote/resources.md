---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Рекламуйте Годину коду

## Проводите Годину коду? [Перегляньте інструкції](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Повісьте плакати у школі

<%= view :promote_posters %>

<a id="social"></a>

## Розмістіть у соціальних мережах

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Використайте логотип Години коду для поширення інформації

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Завантажити версії з високою роздільністю](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Будь-яке посилання на Годину коду має використовуватись таким чином, щоб не створювати враження про те, що це Ваша власна торгова марка, натомість посилаючись на масовий рух Години коду.
    
    - Добрий приклад: «Візьміть участь у Годині коду™ на ACMECorp.com». 
    - Поганий приклад: «Спробуйте годину коду від ACME Corp».
2. Використовуйте верхній індекс «TM» у найвидніших місцях, де ви згадуєте «Годину коду», як на вашому сайті, так і в описах застосунків.
3. Додайте на сторінку (або в колонтитул) текстовий блок з посиланнями на сайти CSEdWeek та Code.org, з наступним змістом:
    
    *«“Година коду™” — це національна ініціатива від Тижня освіти з інформатики[csedweek.org] та Code.org[code.org] для ознайомлення мільйонів учнів з однією годиною інформатики та програмування.»*

4. Не використовуйте «Година коду» в назвах застосунків.

<a id="stickers"></a>

## Надрукуйте ці наклейки і роздайте учням

(Наліпки мають 2,54 см в діаметрі, 63 на аркуш)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Розішліть ці листи, щоб поширити інформацію про Годину коду

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

Комп'ютери є скрізь, вони змінюють кожну галузь на планеті. Але інформатики вчать менше ніж у половині шкіл. Good news is, we’re on our way to change this! Якщо ви чули про Годину коду раніше, ви можете знати, що вона творить історію. Годину коду спробували понад 100 мільйонів учнів.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Для підтримки цього руху об'єдналися понад 100 партнерів. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Поширюйте інформацію. Проведіть захід. Запросіть місцеву школу приєднатися. Або спробуйте Годину коду самі — від вивчення основ виграти може кожен.

Почніть на http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

### Запросіть ЗМІ на свій захід:

**Заголовок:** Місцева школа приєднується до місії знайомства учнів з інформатикою

Комп'ютери є скрізь, вони змінюють кожну галузь на планеті, але інформатики вчать менше ніж у половині шкіл. Дівчата та представники національних меншин серйозно недостатньо представлені на заняттях з інформатики та в індустрії високих технологій. Доброю новиною є те, що ми змінюємо це.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Для підтримки цього руху об'єдналися понад 100 партнерів. Кожен з магазинів Apple у світі провів Годину коду. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Будь ласка, приєднуйтесь до нас.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### Повідомте батьків про заходи у вашій школі:

**Subject line:** Our students are changing the future with an Hour of Code

Шановні батьки,

Ми живемо у світі, наповненому технологіями. І ми знаємо, що яку б професію не обрали наші учні у майбутньому, їхній успіх все більше залежатиме від розуміння принципів роботи цих технологій.

Але лише невеликий відсоток з нас вивчає, **як** працюють технології. Менше ніж половина шкіл вчать інформатики.

Тому вся наша школа приєднується до найбільшої освітньої події в історії: Години коду, протягом тижня інформатики (<%= campaign_date('full') %>). Понад 100 мільйонів учнів по всьому світу вже пробували Годину коду.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. Щоби пропонувати більше занять з програмування нашим учням, ми хочемо зробити нашу подію Години коду величезною. Я закликаю вас стати волонтером, донести цю інформацію до місцевих ЗМІ, поширити ці новини каналами соціальних мереж та розглянути можливість проведення додаткових подій Години коду в нашій громаді.

Це — шанс змінити майбутнє освіти в [НАСЕЛЕНИЙ ПУНКТ].

Докладніше див. http://hourofcode.com/<%= @country %>, і передайте далі.

З повагою,

Ваш директор школи

<a id="politicians"></a>

### Запросіть місцевих політиків на захід у Вашій школі:

**Subject line:** Join our school as we change the future with an Hour of Code

Шановний [мере/губернаторе/народний депутате ІМ'Я ПРІЗВИЩЕ]:

Чи знали Ви, що інформаційні технології є джерелом №1 зарплат у США? В інформаційних технологіях є понад 500 000 вільних робочих місць, але попереднього року робочу силу поповнили лише 42 969 випускників з інформатики.

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

Тому вся наша школа приєднується до найбільшої освітньої події в історії: Години коду, протягом тижня інформатики (<%= campaign_date('full') %>). Понад 100 мільйонів учнів по всьому світу вже пробували Годину коду.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. Ми хочемо бути впевнені, що наші учні знаходяться на передньому краї створення технологій майбутнього — а не лише споживання їх.

Будь ласка, зв'яжіться зі мною за [НОМЕР ТЕЛЕФОНУ АБО АДРЕСА ЕЛЕКТРОННОЇ ПОШТИ]. Я з нетерпінням чекаю на Вашу відповідь.

З повагою,

[NAME], [TITLE]

<%= view :signup_button %>