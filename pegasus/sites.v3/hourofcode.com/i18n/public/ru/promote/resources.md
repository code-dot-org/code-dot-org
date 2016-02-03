---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Повесьте эти плакаты у себя в школе

<%= view :promote_posters %>

<a id="social"></a>

## Разместите в социальных сетях:

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. Любые ссылки на Час Программирования должны использоваться не как ваше собственное название, а как отсылка к Часу Программирования как общественному движению. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Включите в описание страницы абзац, включая ссылки на сайты Недели Образования в Информатике (CSEdWeek) и Code.org, содержащий следующую информацию:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Отправляйте эти письма, чтобы помочь рекламировать "Час кода"

<a id="email"></a>

## Попросите вашу школу, работодателя и друзей зарегистрироваться:

Компьютеры везде, но сейчас меньше школ учат информатике, чем 10 лет назад. Но есть и хорошие новости: мы можем это изменить. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! и Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Выступите с речью. Организуйте мероприятие. Предложите местной школе принять участие. Или попробуйте сами поучаствовать в "Часе Кода" - понять основы программирования полезно любому.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Пригласите СМИ на ваше мероприятие:

**Subject line:** Local school joins mission to introduce students to computer science

Компьютеры везде, но сейчас школы учат информатике меньше чем 10 лет назад. Хорошая новость состоит в том, что мы собираемся изменить это.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! и Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Я хочу пригласить вас посетить наше вводное собрание, и посмотреть на детей на мероприятии, которое состоится [DATE].

"Час Кода", организуемый некоммерческой организацией Code.org и более 100 другими, это признак того, что сегодняшнее поколение учеников готово приобретать критически важные для успеха в 21-м веке навыки. Пожалуйста, присоединяйтесь.

**Контакт:** [YOUR NAME], [TITLE], моб.: (212) 555-5555

**Когда:** [Дата и время вашего мероприятия]

**Где:** [Адрес и маршруты]

Буду рад возможности пообщаться.

<a id="parents"></a>

## Расскажите родителям о событии в вашей школе:

Уважаемые родители,

Мы живём в мире, окружённом технологиями. И мы знаем, что, какую бы область обучения ни выбрали наши ученики, их способность добиваться успеха будет всё больше зависеть от понимания того, как работает технология. Но только крошечная часть учеников обучается компьютерным технологиям, даже меньше, чем десять лет назад.

Вот почему вся наша школа присоединяется к крупнейшему в истории обучения событию: Часу Программирования, в рамках Недели Образования в Информатике (с 8 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Час Программирования - это утверждение, что [ИМЯ ШКОЛЫ] готова к обучению основным навыкам XXI века. Чтобы продолжить привлекать учеников к программированию, мы хотим сделать наше мероприятие "Час Программирования" огромным. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Это шанс изменить будущее образования в [НАЗВАНИЕ ГОРОДА].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

С уважением,

Ваш директор

<a id="politicians"></a>

## Пригласите местного политика на мероприятие в вашей школе:

Уважаемый [ФАМИЛИЯ Мэра/Губернатора/Депутата]:

Знаете ли Вы, что в сегодняшней экономике количество вакансий в сфере компьютерных технологий превышает число выпускников в отношении 3 к 1? А также, что компьютерные технологии являются основой для *каждой* сферы. Yet most of schools don’t teach it. Мы пытаемся изменить это в [НАЗВАНИЕ ШКОЛЫ].

Вот почему вся наша школа присоединяется к крупнейшему в истории обучения событию: Часу Программирования, в рамках Недели Образования в Информатике (с 8 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Мы приглашаем Вас принять участие в нашем мероприятии под названием "Час Программирования" и выступить на нашем стартовом собрании. Оно будет проходить [ЧИСЛО, ВРЕМЯ, МЕСТО] и даст понять, что в [Название области или города] готовы обучать навыкам критики XXI века. Мы хотим быть уверенными в том, что наши ученики находятся в передних рядах создания технологии будущего, а не потребления.

Пожалуйста, свяжитесь со мной по [НОМЕР ТЕЛЕФОНА ИЛИ АДРЕС ЭЛ. ПОЧТЫ]. С нетерпением жду Ваше сообщение.

С уважением, [NAME], [TITLE]

