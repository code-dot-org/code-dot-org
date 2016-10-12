* * *

title: <%= hoc_s(:title_how_to) %> layout: wide nav: how_to_nav

* * *

<%= view :signup_button %>

# Как обучать "Часу Программирования"

Join the movement and introduce a group of students to their first hour of computer science with these steps:

## 1) смотрете это видео <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 2) Выберите учебник для вашего часа:

We provide a variety of [fun, hour-long tutorials](%= resolve_url('https://code.org/learn') %) for students of all ages, created by a variety of partners.

**[Student-guided Hour of Code tutorials:](%= resolve_url("https://code.org/learn") %)**

  * Требуют от учителя минимальное время на подготовку
  * Являются интуитивными, позволяя ученикам работать в их собственном темпе и уровне квалификации

**[Teacher-guided Hour of Code tutorials:](%= resolve_url("https://code.org/educate/teacher-led") %)**

  * Are lesson plans that require some advance teacher preparation
  * Are categorized by grade level *and* by subject area (eg Math, English, etc)

[![](/images/fit-700/tutorials.png)](%= resolve_url('https://code.org/learn') %)

## 3) продвигайте свой час кода

Продвигате свой час кода[с помощью этих инструментов](%= resolve_url('/promote') %)и поощряйте других, чтобы размещать свои собственные события.

## 4) Выберите, какую технику вы будете использовать. Наличие компьютеров не обязательно

Наилучший вариант "Часа кода" - с компьютерами, подключенными к интернету. Но вы**не**нуждаетесь в компьютере для каждого ребенка, и вы можете даже сделать "час кода" без компьютера вообще.

**Планируйте Заранее!**Выполните следующие действия, прежде чем событие начнётся:

  * Test tutorials on student computers or devices. Make sure they work properly on browsers with sound and video.
  * Обеспечьте наушники для вашего класса, или попросите учеников принести свои собственные, если учебник, который вы выбрали лучше всего работает со звуком.
  * **Don't have enough devices?** Use [pair programming](https://www.youtube.com/watch?v=vgkahOzFH2Q). Когда ученики становятся партнерами, они помогают друг другу и меньше полагаются на учителя. Также они увидят, что компьютерная наука социальна и кооперативна.
  * **Низкая пропускная способность интернет соединения?** Покажите видео всему классу, чтобы каждый ученик не загружал видео на свое устройство. Или попробуйте оффлайн учебники.

![](/images/fit-350/group_ipad.jpg)

## 5) Начните свой Час Кода с вдохновляющей речи или видео

**Invite a [local volunteer](https://code.org/volunteer/local) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code. [Use this map](https://code.org/volunteer/local) to find local volunteers who can visit your classroom or join a video chat with your students.

[![](/images/fit-300/volunteer-map.png)](%= resolve_url('https://code.org/volunteer/local') %)

**Покажите им вдохновляющее видео:**

  * Оригинальное начальное видео от Code.org, в котором вы сможете увидеть Билла Гейтса, Марка Цукерберга и звезду NBA Криса Боша ([1минутная версия](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5-минутная версия](https://www.youtube.com/watch?v=nKIu9yen5nc) и [9-минутная версия](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the <% if @country == 'uk' %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [ПРезидент Обама призывает всех учеников изучать компьютерные науки](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Найдите еще больше вдохновляющих видео [здесь](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

  * Расскажите о том, как технология влияет на нашу жизнь, приводя примеры, которые понравятся как мальчикам, так и девочкам (побеседуйте о спасении жизней, помощи другим людям, поиске новых знакомств и так далее).
  * As a class, list things that use code in everyday life.
  * Смотрите советы для девушек, интересующихся информатикой[здесь](%= resolve_url('https://code.org/girls') %).

**Need more guidance?** Download this [template lesson plan](/files/EducatorHourofCodeLessonPlanOutline.docx).

**Хотите узнать больше идей о том, как провести занятие?** Почитайте[лучшие советы](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466)от опытных преподавателей.

## 6) Программируйте!

**Direct students to the activity**

  * Напишите ссылку на Учебное пособие на доске. Найти ссылку на[информация для учебника](%= resolve_url('https://code.org/learn') %)под количество участников.

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

**When your students come across difficulties it's okay to respond:**

  * “Я не знаю. Давай разберемся вместе”
  * “Технология не всегда работает так, как мы хотим”
  * “Обучение на программе -это как изучение нового языка, Вы не будете свободно пользоваться прямо сейчас.”

**[Check out these teaching tips](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**What to do if a student finishes early?**

  * Ученики могут просмотреть все учебники и попробовать другой Час Кода на [<%= resolve_url('code.org/learn') %>](%= resolve_url('https://code.org/learn') %)
  * Или попросите учеников, кто закончил раньше, помочь их товарищам, которые испытывают трудности.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Отпразднуйте

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * [Распечатайте сертификаты](%= resolve_url('https://code.org/certificates') %)для ваших учеников.
  * [Напечатайте наклейки "Час кода: Я сделал это!"](%= resolve_url('/promote/resources#stickers') %) для ваших учеников.
  * [Закажите специальные футболки](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) для вашей школы.
  * Делитесь фотографиями и видео в социальных сетях. Используйте #HourOfCode и @codeorg чтобы вы могли подчеркнуть Ваш успех тоже!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Другие ресурсы для учителей Часа Кода:

  * Воспользуйтесь этим [примером плана урока](/files/EducatorHourofCodeLessonPlanOutline.docx) для организации Часа Кода.
  * Просмотрите [лучшие советы](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) от учителей прошлых мероприятий Часа Кода. 
  * Посмотрите запись[вебинара о том, как провести Час Кода](https://youtu.be/EJeMeSW2-Mw).
  * [Задавайте вопросы в режиме онлайн &](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) основателю проекта Хади Партови касаемо того, как подготовиться к проведению Часа Кода.
  * Посетите [Форум учителей Часа Кода](http://forum.code.org/c/plc/hour-of-code), на котором Вы получите советы и поддержку других педагогов. <% if @country == 'us' %>
  * Просмотрите [Часто задаваемые вопросы по Часу Кода](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Что происходит после "Часа программирования"?

Час кода-это только первый шаг в путешествие, чтобы узнать больше о том, как технология работает и создаёт программные приложения. Для продолжения этого путешествия:

  * Encourage students to continue to [learn online](%= resolve_url('https://code.org/learn/beyond') %).
  * [Attend](%= resolve_url('https://code.org/professional-development-workshops') %) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>