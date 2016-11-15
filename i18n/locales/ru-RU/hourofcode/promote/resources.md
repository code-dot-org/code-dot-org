* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Содействовие с Час кода

## Проходит Час кода?[См. руководство](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Повесьте эти плакаты у себя в школе

<%= view :promote_posters %>

<a id="social"></a>

## Разместите в социальных сетях:

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Используйте Час кода Логотип, чтобы распространить его

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Скачать бесплатную версию](http://images.code.org/share/hour-of-code-logo.zip)

**"Час кода" является торговой маркой. Мы не хотим прекратить использование этой марки, но хотим убедиться, что оно отвечает нескольким требованиям:**

  1. Любые ссылки на Час кода должны использоваться не как ваше собственное название, а как отсылка к Часу кода как общественному движению. Хороший пример: "Принимайте участие в Часе кода на ACMECorp.com". Плохой пример: "Попробуйте Час кода от корпорации ACME".
  2. Используйте надстрочный знак "TM" в самых видных местах при упоминании Часа кода как на веб-сайтах, так и в описании приложений.
  3. Включите в описание страницы абзац, включая ссылки на сайты Недели Образования в Информатике (CSEdWeek) и Code.org, содержащий следующую информацию:
    
    *"Час кода - это общенациональная инициатива CsedWeek.org \[csedweek.org\] (Недели образования в Информатике) и Code.org [code.org] с целью вовлечения миллионов учеников в один час информатики и программирования." (“The 'Hour of Code' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org [code.org] to introduce millions of students to one hour of computer science and computer programming.”)*

  4. Не допускается использование "Час кода" в названиях приложений.

<a id="stickers"></a>

## Печатать эти наклейки, чтобы дать вашим ученикам

(Стикеры 1" Диаметр, 63 на листе)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Отправляйте эти письма, чтобы помочь рекламировать "Час кода"

<a id="email"></a>

## Попросите вашу школу, работодателя и друзей зарегистрироваться:

Компьютеры есть везде, они меняют каждую отрасль на планете. But fewer than half of all schools teach computer science. Но есть и хорошие новости: мы можем это изменить. Если вы слышали о прошлогоднем "Часе Кода", то вы возможно знаете, что он вошел в историю. Час Кода посетили более 100 миллиона учащихся.

С Час кода, компьютерные науки на страницах Google, MSN, Yahoo! и Disney. Более 100 партнеров собрались вместе, чтобы поддержать это движение. В каждом магазине Apple в мире прошел Час кода. Президент Обама написал свою первую строчку кода в рамках кампании.

В этом году, давайте сделаем его еще больше.Я прошу вас присоединиться к Час кода 2016. Просьба, связываться с мероприятием в течение образовательной недели компьютерных наук, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Пригласите СМИ на ваше мероприятие:

**Subject line:** Local school joins mission to introduce students to computer science

Computers are everywhere, changing every industry on the planet, but fewer than half of all schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Но есть и хорошие новости: мы можем это изменить.

С Час кода, компьютерные науки на страницах Google, MSN, Yahoo! и Disney. Более 100 партнеров собрались вместе, чтобы поддержать это движение. В каждом магазине Apple в мире прошел Час кода. Президент Обама написал свою первую строчку кода в рамках кампании.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly, and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Please join us.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555

**When:** [DATE and TIME of your event]

**Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch.

<a id="parents"></a>

## Расскажите родителям о событии в вашей школе:

Dear Parents,

We live in a world surrounded by technology. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Fewer than half of all schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Пригласите местного политика на мероприятие в вашей школе:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]

<%= view :signup_button %>