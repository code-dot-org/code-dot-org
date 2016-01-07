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

## Повісьте плакати у школі

<%= view :promote_posters %>

<a id="social"></a>

## Розмістіть у соціальних мережах

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. Будь-яке посилання на Годину коду має використовуватись таким чином, щоб не створювати враження про те, що це Ваша власна торгова марка, натомість посилаючись на масовий рух Години коду. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Додайте на сторінку (або в колонтитул) текстовий блок з посиланнями на сайти CSEdWeek та Code.org, з наступним змістом:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Розішліть ці листи, щоб поширити інформацію про Годину коду

<a id="email"></a>

## Запросіть підписатись свою школу, працедавця чи друзів:

Комп'ютери поширені повсюдно, але все менше шкіл викладають інформатику, аніж 10 років тому. Хорошою новиною є те, що ми можемо це змінити. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! та Діснею. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Поширюйте інформацію. Проведіть захід. Запросіть місцеву школу приєднатися. Або спробуйте Годину коду самі - кожен може вивчити основи.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Запросіть ЗМІ на свій захід:

**Subject line:** Local school joins mission to introduce students to computer science

Комп'ютери поширені повсюдно, але все менше шкіл викладають інформатику, аніж 10 років тому. Дівчатка та національні меншини представлені у галузі надто мало. Хороша новина полягає у тому, що ми можемо це змінити.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! та Діснею. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Я хочу запросити Вас відвідати наші вступні збори і побачити, як діти починають роботу [DATE].

Година коду, що проводиться некомерційною організацією Code.org і більш як сотнею інших, є доказом того, що нинішнє покоління учнів готове вчитися необхідним навичкам для успіху в 21-му столітті. Приєднуйтеся.

**Контакт:** [YOUR NAME], [TITLE], тел.: (212) 555-5555

**Коли:** [Дата і час Вашого заходу]

**Де:** [Адреса і вказівки з добирання]

Якщо є питання, будь ласка, звертайтесь.

<a id="parents"></a>

## Повідомте батьків про заходи у вашій школі:

Шановні батьки,

Ми живемо у світі, наповненому технологіями. І ми знаємо, що яку б професію не обрали наші учні у майбутньому, їхній успіх залежатиме від розуміння принципів роботи цих технологій. Але лише невеликий відсоток з нас вивчають інформатику і це менше, ніж десять років тому.

Тому вся наша школа приєднується до найбільшої освітньої події в історії: Години коду, протягом тижня інформатики (8-14 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Наша Година коду є доказом того, що [Назва школи] готова навчати цих базових навичок 21го століття. Щоб продовжити вивчення програмування з нашими учнями, ми хочемо посилити важливість заходів Години коду. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Це шанс змінити майбутнє освіти в [місто].

Див http://hourofcode.com/<%= @country %> для детальнішої інформації та поширення її.

З повагою,

Директор

<a id="politicians"></a>

## Запросіть місцевих політиків на захід у Вашій школі:

Шановний [Прізвище мера, депутата, губернатора]:

Чи знаєте ви, що в умовах сучасної економіки, робочих місць у сфері інформаційних технологій утричі більше, ніж студентів-випускників? А інформатика сьогодні є основоположною для *усіх* сфер діяльності. Yet most of schools don’t teach it. Ми, у школі [SCHOOL NAME], намагаємося це змінити.

Тому вся наша школа приєднується до найбільшої освітньої події в історії: Години коду, протягом тижня інформатики (8-14 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Я хочу запросити Вас взяти участь в нашому заході Години коду і виступити на вступних зборах. Вони відбудуться [Дата, Час, Місце], і ми хотіли б наголосити, що [Місто] готове навчати учнів критичним навичкам 21-го століття. Ми хочемо, щоб переконатися, що наші перебувають в авангарді створення технологій майбутнього – а не просто їх споживання.

Будь ласка, зв'яжіться зі мною за [номер телефону чи електронна адреса]. Чекатиму Вашої відповіді.

З повагою, [NAME], [TITLE]

