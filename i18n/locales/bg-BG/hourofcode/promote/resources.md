* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Насърчаване на Часът на кода

## Домакинли сте на часът на кода? [Вижте помощното ръководство](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Окачете тези плакати във Вашето училище

<%= view :promote_posters %>

<a id="social"></a>

## Постнете това в социалните медии

[![изображение](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![изображение](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![изображение](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Използвайте логото на часът на кода за разпространение на събитието

[![изображение](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Изтегли версии с висока резолюция](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" е търговска марка. Ние не искаме да спираме това използване, но при няколко ограничения:**

  1. Всяко позоваване на "Часът на кодирането" трябва да се използва по начин, който не предполага, че това е ваша собствена търговска марка, но по-скоро да се разбира, че Часът на кодирането е вид масово движение. Добър пример: "Участвайте в Hour of Code на ACMECorp.com". Лош пример: "Опитайте Hour of Code от ACME Corp".
  2. Използвайте "ТМ" с горен индекс на най-видимите места, на които споменавате "Hour of Code", както на вашия уеб сайт така и в описанието на дейността си.
  3. Обяснете нашата кампания на вашият език на страницата ви(или в допълнителна опция), като включите връзки към CSEdWeek и Code.org сайтовете, както и следното:
    
    *"Hour of Code ™" е национална инициатива на Csew [csedweek.org] и Code.org[code.org] да се подпомогнат милиони ученици с един час в компютърните науки и по компютърно програмиране."*

  4. Не се разрешава използването на "Hour of Code" в имена на приложения.

<a id="stickers"></a>

## Разпечатайте тези стикери и ги раздайте на учениците си

(Стикерите са 1' в диаметър, 63 на лист)  
[![изображение](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Изпратете тези имейли, за да подпомогнете провеждането на Часът на кодирането

<a id="email"></a>

## Попитайте Вашето училище, работодател или приятели дали може се регистрирате:

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. Добрата новина е, че ние сме на път да променим това. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

С часа на кода, компютърните науки бяха на началните страници на Google, MSN, Yahoo! и Дисни. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Първи стъпки в http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Поканете медии да присъстват на събитието:

**Тема:** Местното училище се присъединява към мисията да въведе 100 милиона ученици в компютърните науки

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Добрата новина е, че ние сме на път да променим това.

С часа на кода, компютърните науки бяха на началните страници на Google, MSN, Yahoo! и Дисни. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

Аз писмено ви каня да присъствате на нашето откриване и да видите как децата започват дейността на [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Моля, присъединете се към нас.

**Контакт:** [Вашето име], [TITLE], мобилен: (212) 555-5555

**Дата:** [Дата и час на събитието си]

**Място:** [Адрес ]

С нетърпение очаквам да се свържем.

<a id="parents"></a>

## Разкажете на родителите за Вашето училищно събитие:

Уважаеми родители,

Ние живеем в един свят, заобиколени от технологиите. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Поканете местен политик на училищното ви събитие:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]