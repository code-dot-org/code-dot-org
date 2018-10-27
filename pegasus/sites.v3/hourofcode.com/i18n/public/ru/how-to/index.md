---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# How to teach one Hour of Code with your class

### Присоединяйся к движению и познакомь группу учащихся с их первым часом в информатике с помощью этих шагов. Час Кода легко провести - даже для новичков! Если вам понадобится рука помощи, вы можете найти [местных волонтёров](<%= codeorg_url('/volunteer/local') %>), чтобы помочь запустить Час Кода в вашем классе.

### Take a look at our [participation guide if you still have questions](<%= localized_file('/files/participation-guide.pdf') %>).

---

## 1. Посмотрите эту видео-инструкцию <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Выберите учебное пособие для вашего часа

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Продвигайте свой Час Кода

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Определите вашу потребность в оборудовании - компьютеры не обязательны

Час Кода лучше всего проводить с компьютерами имеющими интернет подключение. Но вам **не** нужен компьютер для каждого ребенка, и вы даже можете провести Час Кода вообще без компьютеров.

Протестируйте уроки на компьютерах или устройствах учеников, чтобы убедиться что они корректно работают в браузерах со звуком и видео. **Низкая скорость интернета?** Запланируйте показать видео всему классу, чтобы каждый ученик не скачивал свое собственное видео. Или попробуйте оффлайн учебные пособия.

Обеспечьте наушниками ваш класс, или попросите учеников принести свои собственные, если урок, который вы выбрали, лучше всего работает со звуком.

**Не хватает компьютеров?** Работайте [парами](https://www.youtube.com/watch?v=vgkahOzFH2Q). Когда ученики становятся партнерами, они помогают друг другу и меньше полагаются на учителя. Также они увидят, что компьютерная наука социальна и кооперативна.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Начните ваш Час Кода с вдохновляющей речи или видео

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Покажите вдохновляющее видео:**

- Оригинальное видео запуска Code.org, с участием Билла Гейтса, Марка Цукерберга, и звезды НБА Криса Боша. ([1 минутная](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 минутная](https://www.youtube.com/watch?v=nKIu9yen5nc), и [9 минутная](https://www.youtube.com/watch?v=dU1xS07N-FA) версии доступны)
- Найдите больше вдохновляющих [ресурсов](<%= resolve_url('https://code.org/inspire') %>) и [видео](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Объясните как технологии влияют на наши жизни, с примерами которые тронут и мальчиков и девочек (расскажите о спасении жизней, помощи людям, объединения людей и т.д.).
- Расскажите, как код в используется повседневной жизни.
- Посмотрите советы как заинтересовать девочек в IT [здесь](<%= codeorg_url('/girls')%>).

## 6. Программируйте!

**Direct students to the activity**

- Запишите на доске ссылку на урок. Найти ссылку можно в [информации для выбранного урока](<%= resolve_url('/learn') %>) под числом участников.

**When your students come across difficulties it's okay to respond:**

- “Я не знаю. Давай разберемся вместе”
- “Технология не всегда работает так, как мы хотим”
- “Изучение программирования - это как изучение нового языка, вы не сразу станете говорить свободно.”

**What if a student finishes early?**

- Ученики могут посмотреть все уроки и [ попробовать другой Час Кода](<%= resolve_url('/learn')%>).
- Или попросите учеников, кто закончил раньше, помочь их товарищам, которые испытывают трудности.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Отпразднуйте

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Распечатайте сертификаты](<%= codeorg_url('/certificates')%>) для своих учеников.
- [Напечатайте наклейки "Час кода: Я сделал это!"](<%= resolve_url('/promote/resources#stickers') %>) для ваших учеников.
- [Закажите специальные футболки](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) для вашей школы.
- Поделитесь фотографиями и видео о вашем Часе Кода в социальных медиа. Используйте хештеги #HourOfCode и @codeorg, чтобы мы тоже смогли отметить ваш успех!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Другие ресурсы для учителей Часа Кода:

- Посетите [Форум учителей Часа Кода](http://forum.code.org/c/plc/hour-of-code), на котором Вы получите советы и поддержку других педагогов. <% if @country == 'us' %>
- Просмотрите [Часто задаваемые вопросы по Часу Кода](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Час Кода: а что дальше?

Час Кода - это только первый шаг на пути изучения того, как работают программные технологии и создаётся программное обеспечение. Для продолжения этого увлекательного путешествия:

- Encourage students to continue to [learn online](<%= codeorg_url('/learn/beyond')%>).
- [Attend](<%= codeorg_url('/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>