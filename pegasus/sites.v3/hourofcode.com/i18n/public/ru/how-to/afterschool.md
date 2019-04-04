---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# Как преподавать Час Кода на внеклассных занятиях и в кружках

### Присоединяйся к движению и познакомь группу учащихся с их первым часом в информатике с помощью этих шагов. Час Кода легко провести - даже для новичков! Если тебе понадобится дополнительная помощь, ты можешь найти [ местного волонтера ](<%= codeorg_url('/volunteer/local') %>), который поможет провести Час Кода в твоем классе или кружке.

---

## 1. Посмотрите эту видео-инструкцию <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Выберите учебное пособие

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('/learn') %>) for participants all ages, created by a variety of partners. [Попробуй их!](<%= resolve_url('/learn') %>)

**All Hour of Code tutorials** require minimal prep-time for organizers, and are self-guided - allowing kids to work at their own pace and skill-level.

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

**Need a lesson plan for your afterschool Hour of Code?** Check out this [template](/files/AfterschoolEducatorLessonPlanOutline.docx)!

## 3. Продвигайте свой Час Кода

Promote your Hour of Code [with these tools](<%= resolve_url('/promote') %>) and encourage others to host their own events.

## 4. Определите вашу потребность в оборудовании - компьютеры не обязательны

Час Кода лучше всего проводить с компьютерами имеющими интернет подключение. Но вам **не** нужен компьютер для каждого ребенка, и вы даже можете провести Час Кода вообще без компьютеров.

Протестируйте уроки на компьютерах или устройствах учеников, чтобы убедиться что они корректно работают в браузерах со звуком и видео. **Низкая скорость интернета?** Запланируйте показать видео всему классу, чтобы каждый ученик не скачивал свое собственное видео. Или попробуйте оффлайн учебные пособия.

Обеспечьте наушниками ваш класс, или попросите учеников принести свои собственные, если урок, который вы выбрали, лучше всего работает со звуком.

**Не хватает компьютеров?** Работайте [парами](https://www.youtube.com/watch?v=vgkahOzFH2Q). Когда ученики становятся партнерами, они помогают друг другу и меньше полагаются на учителя. Также они увидят, что компьютерная наука социальна и кооперативна.

## 5. Начните ваш Час Кода с вдохновляющего видео

Сделайте Час Кода более эффективным, рассказывая о роли компьютерной науки в жизни каждого и вдохновляя учеников.

**Покажите вдохновляющее видео:**

- Оригинальное видео запуска Code.org, с участием Билла Гейтса, Марка Цукерберга, и звезды НБА Криса Боша - [1 минутная](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 минутная](https://www.youtube.com/watch?v=nKIu9yen5nc), и [9 минутная](https://www.youtube.com/watch?v=dU1xS07N-FA) версии доступны.
- [Всемирный Час Кода](https://www.youtube.com/watch?v=KsOIlDT145A)
- [Президент Обама призывает всех учеников изучать компьютерные науки](https://www.youtube.com/watch?v=6XvmhE1J9PY).
- Найти больше вдохновляющих видео можно [здесь](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if you are all brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Объясните как технологии влияют на наши жизни, с примерами которые тронут и мальчиков и девочек (Расскажите о приложениях и технологиях, которые используются для спасения жизней, помощи людям, объединения людей и т.д.).
- Составьте список вещей, немыслимых в повседневной жизни без программирования.
- Посмотрите советы как заинтересовать девочек в компьютерных науках [здесь](<%= resolve_url('https://code.org/girls')%>).

**Need more guidance?** Download this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx).

## 6. Программируйте!

**Direct participants to the activity** - Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn') %>) under the number of participants.

**When someone comes across difficulties it's okay to respond:** - “I don’t know. Let’s figure this out together.” - “Technology doesn’t always work out the way we want.” - “Learning to program is like learning a new language; you won’t be fluent right away.”

**What to do if someone finishes early?** - Encourage participants to try another Hour of Code activity at [hourofcode.com/learn](<%= resolve_url('/learn') %>) - Or, ask those who finish early to help others who are having trouble.

## 7. Отпразднуйте

- [Print certificates](<%= codeorg_url('/certificates') %>) for your students.
- [Напечатайте наклейки "Час кода: Я сделал это!"](<%= resolve_url('/promote/resources#stickers') %>) для ваших учеников.
- [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for participants.
- Поделитесь фотографиями и видео о вашем Часе Кода в социальных медиа. Используйте хештеги #HourOfCode и @codeorg, чтобы мы тоже смогли отметить ваш успех!

## Другие материалы для учителей Часа Кода

- Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from past Hour of Code organizers.
- Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
- Visit the [Hour of Code Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other organizers. <% if @country == 'us' %>
- Просмотрите [Часто задаваемые вопросы по Часу Кода](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Час Кода: а что дальше?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. Help students continue their journey and encourage them to [learn more online](<%= codeorg_url('/learn/beyond') %>)!

<%= view :signup_button %>