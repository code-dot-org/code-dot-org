---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Насърчаване на Часът на кода

## Домакинли сте на часът на кода? [Вижте помощното ръководство](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Окачете тези плакати във Вашето училище

<%= view :promote_posters %>

<a id="social"></a>

## Постнете това в социалните медии

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Използвайте логото на часът на кода за разпространение на събитието

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Изтегли версии с висока резолюция](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Всяко позоваване на "Часът на кодирането" трябва да се използва по начин, който не предполага, че това е ваша собствена търговска марка, но по-скоро да се разбира, че Часът на кодирането е вид масово движение.
    
    - Добър пример: "Участвайте в Hour of Code на ACMECorp.com". 
    - Лош пример: "Опитайте Hour of Code от ACME Corp".
2. Използвайте "ТМ" с горен индекс на най-видимите места, на които споменавате "Hour of Code", както на вашия уеб сайт така и в описанието на дейността си.
3. Обяснете нашата кампания на вашият език на страницата ви(или в допълнителна опция), като включите връзки към CSEdWeek и Code.org сайтовете, както и следното:
    
    *"Hour of Code ™" е национална инициатива на Csew [csedweek.org] и Code.org[code.org] да се подпомогнат милиони ученици с един час в компютърните науки и по компютърно програмиране."*

4. Не се разрешава използването на "Hour of Code" в имена на приложения.

<a id="stickers"></a>

## Разпечатайте тези стикери и ги раздайте на учениците си

(Стикерите са 1'' в диаметър, 63 на лист)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Изпратете тези имейли, за да подпомогнете провеждането на Часът на кодирането

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

Компютрите са навсякъде, променят всеки отрасъл на планетата. Но в по-малко от половината от всички училища се изучават компютърни науки. Good news is, we’re on our way to change this! Ако сте чували за часът на кода преди, може би знаете че той влезе в историята. Повече от 100 милиона ученици са пробвали Часът на кода.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Над 100 партньора се събраха в подкрепа на това движение. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Вземете думата. Организирайте събитие. Помогнете на местното училище да се регистрира. Или пробвайте сами - всеки може да се възползва от изучаването на основите.

Първи стъпки в http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

### Поканете медии да присъстват на събитието:

**Тема:** Местното училище се присъединява към мисията да въведе 100 милиона ученици в компютърните науки

Компютрите са навсякъде, променят всеки отрасъл на планетата, но само в едно от всеки четири училища се изучават компютърни науки. Момичета и малцинствата са много слабо представени в изучаването на компютърни науки и в технологичната индустрия. Добрата новина е, че ние сме на път да променим това.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Над 100 партньора се събраха в подкрепа на това движение. Всеки Apple магазин в света е бил домакин на един час на кода. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Моля, присъединете се към нас.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### Разкажете на родителите за Вашето училищно събитие:

**Subject line:** Our students are changing the future with an Hour of Code

Уважаеми родители,

Ние живеем в един свят, заобиколени от технологиите. И ние знаем, че каквото и поле на изява нашите ученици да изберат когато пораснат, способността им за успех все повече ще зависи от разбирането как технологията работи.

Но само една малка част от нас ще научат **как** технологията работи. Само в 1 на всеки четири училища се изучават компютърни науки.

Ето защо нашето училище се присъединява към най-голямото обучително събитие в историята: часът на кодирането, по време на Csew (<%= campaign_date('full') %>). Над 100 милиона ученици по света вече са пробвали Часът на кода.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. За да продължи провеждането на дейности по програмиране за учениците ни, ние искаме да направим нашият час на кода по-голям. Моля Ви да информирате местните медии, които да споделят новината и да помислим за провеждане на допълнително Час на кодирането събитие в Общността.

Това е шанс да промените бъдещето на образованието в [името на град].

Вижте http://hourofcode.com/<%= @country %> за подробности, както и за помощ в разпространяването на събитието.

Искрено Ваш

Директор

<a id="politicians"></a>

### Поканете местен политик на училищното ви събитие:

**Subject line:** Join our school as we change the future with an Hour of Code

Уважаеми [кмет/управител/представител/сенатор фамилно име]:

Знаете ли, че на компютингът е #1 източник на заплатите в САЩ? Има повече от 500 000 отворени компютърни работни места в национален мащаб, но миналата година само 42,969 студенти са завършили KS.

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

Ето защо нашето училище се присъединява към най-голямото обучително събитие в историята: часът на кодирането, по време на Csew (<%= campaign_date('full') %>). Над 100 милиона ученици по света вече са пробвали Часът на кода.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. Ние искаме да гарантираме, че нашите ученици са в челните редици на създаване на технологията на бъдещето--не само го консумират.

Моля свържете се с мен [ТЕЛЕФОНЕН номер или имейл адрес]. Очаквам с нетърпение вашия отговор.

Искрено Ваш

[NAME], [TITLE]

<%= view :signup_button %>