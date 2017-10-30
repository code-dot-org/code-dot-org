---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Кодтау сағатын жарнамалауға көмектесу

## Кодтау Сағатын жүргізбекшімісіз? [ Нұсқауды қара ](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Мына постерлерді өз мектепте іліп қойыңыз

<%= view :promote_posters %>

<a id="social"></a>

## Мынаны әлеуметтік желіге салып қойыңыз

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Кодтау Сағатының логотипін, осы сөзді тарату үшін қолданыңыз

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Кез келген "Кодтау Сағатының" сілтемесі ешқандай сауда белгісін білдіртпейтіндей қолдану керек, керісінше "Кодтау сағаты" әлеуметтік қозғалысына сілтеу керек.
    
    - Жақсы мысал: "ACMECorp.com-да Кодтау Сағатына™ қатысыңыз". 
    - Жаман мысал: "Кодтау Сағатын ACME Corp арқылы байқап көріңіз".
2. Веб-сайтта және қосымшалардағы сипаттамаларда, "ТМ" жоғарғы индексті ең көп байқалатын жерде қолданыңыз.
3. Веб-парақшаға (немесе парақшаның астына) CSEdWeek және Code.org веб-сайтының сілтемелерін қосыңыз және оның мағынасы келесідегідей болсын:
    
    *" 'Кодтау Сағаты™' бір сағаттың ішінде, миллиондаған студенттерді информатика мен компьютер бағадарламарын жазуменен таныстыру мақсатында, халықаралық Информатика Аптасы[csedweek.org] және Code.org[code.org] ұжымының ықыласы арқасында ұйымдастырылған."*

4. Телефон қосымшаларында "Кодтау Сағаты" сөзін қолдану тиым салынады.

<a id="stickers"></a>

## Бұл жапсырмаларды студенттерге тарату үшін басып шығарыңыз

(Жапсырмалардың диаметрі 1", 63 жапсырма әрбір бетке)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Бұл e-mail-дарды Кодтау Сағатын тарату үшін басқалараға жіберіңіз

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

Компьютерлер барлық жерде тарлған және кез келген саланы түбегейлі өзгертуде. Алайда мектептердің жартысынан кемі, компьютер ғылымдары сабақтарын жүргізеді. Good news is, we’re on our way to change this! Егер де, сіз Кодтау Сағаты жайлы бұрын естіп көрсеңіз, демек, бұл шара тарихқа енгенін де білерсіз. 100 миллионнан астам студенттер Кодтау Сағатына қатысып көрді.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. 100ден астам серіктестіктер бұл шараны қолдау мақсатында бірікті. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Сөзді есіңе сақтаңыз. Осы шараға қатысыңыз. Тіркелу үшін жергілікті мектепті сұраңыз. Немесе Кодтау Сағатына өз бетінше қатысып көріңіз. Әрбір қатысушы негіздерді үйренгеннен, пайда көре алады.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

### БАҚ-ты сіздің шараңызға қатысу үшін шақырыңыз:

**Пәннің аты:** Студенттерді компьютер ғылымдарымен таныстыру үшін, жергілікті мектептер күштерін біріктірді

Компьютерлер барлық жерде тарлған және кез келген саланы түбегейлі өзгертуде. Алайда, компьютер ғылымдары сабақтарын мектептердің тек жартысынан кемі ғана жүргізеді. Информатика сыныптарында және жалпы техника саласында, қыздар мен кейбір ерекше топтар аз көрсетілген. Дегенімен, жақсы хабар да бар, біз бұны өзгерту жолындамыз.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. 100ден астам серіктестіктер бұл шараны қолдау мақсатында бірікті. Әлемнің әрбір Apple дүкенінде Кодтау Сағаты аталып өтті. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Бізгі қосылуға өтінеміз.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### Өзіңіздің ата-аналарыңызға бұл шара жайында айтыңыз:

**Subject line:** Our students are changing the future with an Hour of Code

Құрметті ата-аналар,

Біз технология заманында өмір сүреміз. Және оқушы, болашақта ересек болғанда, кез келген салада неғұрлым технологияны жақсы білсе, соғұрлым үлкен жетістіктерге жетеді.

Бірақ арамыздағы тек кейбір адмадар ғана **қалай** технологияның жұмыс істейтініне үйренеді. Өкінішке орай, жартысынан кем мектпетерде ғана информатика сабағы жүргізіледі.

Сол себепті біздің мектеп түгелдей, білім саласы тарихындағы ең ауқымды оқиғаға қосылып отыр. Информатика Апттсаының көлеміндегі, Кодтау сағаты. Бүкіл әлемдегі 100 миллионнан астам оқушылар, Кодтау Сағатын байқап көрді.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. Сіздің оқушыларыңызға бағадарламаларды жазу шараларын өткізуді жалғастыру үшін, біз Кодтау Сағатын өте ауқымды шара еткіміз келеді. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Бұл сіздің [ҚАЛАНЫҢ АТЫ] білім саласының болашағын өзгертуге деген мүмкіндігіңіз.

http://hourofcode.com/<%= @country %> сайтына толығырақ білу үшін кіріп, осы оқиғаны таратуға көмектесіңіз.

Ізгі тілекпен,

Сіздің бағытберушіңіз

<a id="politicians"></a>

### Жергілікті саясаткерді сіздің мектептегі шараға шақырыңыз:

**Subject line:** Join our school as we change the future with an Hour of Code

Құрметті [ӘКІМ/ГУБЕРНАТОР/ӨКІЛ/СЕНАТОР ТЕГІ]:

Did you know that computing is the #1 source of wages in the U.S.? Ел көлемінде 500,000-нан астам есептеу жұмыстары ашық, алайда, былтыр тек қана 42,969 компьютер ғылымдарының студенттері бітіріп, жұмыс күшіне енді.

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

Сол себепті біздің мектеп түгелдей, білім саласы тарихындағы ең ауқымды оқиғаға қосылып отыр. Информатика Апттсаының көлеміндегі, Кодтау сағаты. Бүкіл әлемдегі 100 миллионнан астам оқушылар, Кодтау Сағатын байқап көрді.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Ізгі тілекпен,

[NAME], [TITLE]

<%= view :signup_button %>