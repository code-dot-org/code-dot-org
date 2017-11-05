---

title: <%= hoc_s(:title_how_to_companies) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# Как приблизить Час кода в Вашей компании

## Вдохновляйте учеников и волонтеров

**Code.org предоставляет сотрудникам компании возможность[объединять](<%= resolve_url('https://code.org/volunteer') %>) классы делать "Час кода", чтобы поделиться своим опытом и вдохновить учеников, чтобы изучать компьютерные науки.**

  * [Регистрация](<%= resolve_url('https://code.org/volunteer') %>)для добровольцев.
  * Дополнительные инструкции по подключению Ваших сотрудников к аудиториям, обратитесь в [руководство для корпоративных партнеров](<%= localized_file('/files/HourOfCodeGuideForCorporatePartners.pdf') %>).

## Дополнительные возможности компании могут поддержать "Час кода":

  * Используйте[маркетинговый инструментарий](<%= localized_file('/files/HourOfCodeInternalMarketingToolkit.pdf') %>)чтобы создать временную шкалу связи и делиться рекламным контентом.
  * Спросите своего директора, чтобы отправить компании по электронной почте подчеркивая важность информатики и поощрения сотрудников, чтобы распространить Час кода. [Посмотреть email](<%= resolve_url('/promote/resources#sample-emails') %>).
  * Host an Hour of Code Happy Hour with coworkers to try the [tutorials](<%= resolve_url('/learn') %>).
  * Host an Hour of Code event for a local classroom of students or non profits partners to do an Hour of Code at your company’s office. See event how-to guide below.

## How to host an Hour of Code event

## 1) Расскажите о Часе Кода

  * Promote your [Hour of Code](<%= resolve_url('/promote') %>) event and encourage others to host.
  * Encourage **software engineers** at your company to visit a local classroom to help lead an Hour of Code and inspire students to study computer science. They can [sign up](<%= resolve_url('https://code.org/volunteer/engineer') %>) to be connected with a classroom.

## 2) Посмотрите видео с информацией <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) Выберите урок:

We’ll host a variety of [fun, hour-long tutorials](<%= resolve_url('/learn') %>) for participants of all ages, created by a variety of partners. [Try them out!](<%= resolve_url('/learn') %>)

**Все уроки Часа Кода:**

  * Require minimal prep-time
  * Are self-guided - allowing participants to work at their own pace and skill-level

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

## 4) Выберите, какую технику вы будете использовать. Наличие компьютеров не обязательно

Наилучший вариант "Часа кода" - с компьютерами, подключенными к интернету. But you **don’t** need a computer for every participant, and you can even do the Hour of Code without a computer at all.

**Планируйте Заранее!**Выполните следующие действия, прежде чем событие начнётся:

  * Test tutorials on computers or devices. Make sure they work properly on browsers with sound and video.
  * Provide headphones, or ask participants to bring their own, if the tutorial you choose works best with sound.
  * **Don't have enough devices?** Use [pair programming](https://www.youtube.com/watch?v=vgkahOzFH2Q). When participants partner up, they help each other and rely less on the organizer. Также они увидят, что компьютерная наука социальна и кооперативна.
  * **Have low bandwidth?** Plan to show videos at the front of the event, so each participant isn't downloading their own videos. Or try the unplugged / offline tutorials.

![](/images/fit-350/group_ipad.jpg)

## 5) Start your Hour of Code off with an inspiring video

Сделайте Час Кода более эффективным, рассказывая о роли компьютерной науки в жизни каждого и вдохновляя учеников. Share more about what inspired you to pursue computer science and your role at your company.

**Покажите им вдохновляющее видео:**

  * Оригинальное начальное видео от Code.org, в котором вы сможете увидеть Билла Гейтса, Марка Цукерберга и звезду NBA Криса Боша ([1минутная версия](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5-минутная версия](https://www.youtube.com/watch?v=nKIu9yen5nc) и [9-минутная версия](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the <% if @country == 'uk' %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [ПРезидент Обама призывает всех учеников изучать компьютерные науки](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Find more inspirational video [here](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Ideas to introduce your Hour of Code activity:**

  * Explain ways technology impacts our lives, with examples both boys and girls will care about (Talk about technology that’s saving lives, helping people, connecting people). 
  * If you are a tech company, demo fun, innovative products your company is working on.
  * If you aren’t a tech company, discuss ways your company uses technology to solve problems and accomplish goals.
  * Invite software engineers from your company to speak about why they decided to study computer science and the projects they work on.
  * Смотрите советы для девушек, интересующихся информатикой[здесь](<%= resolve_url('https://code.org/girls') %>).

## 6) Программируйте!

**Предложите ученикам заняться программированием**

  * Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn') %>) under the number of participants.
  * For younger students, load the tutorial page ahead of time or save it as a bookmark.

**When participants come across difficulties it's okay to respond:**

  * “Я не знаю. Давай разберемся вместе”
  * “Технология не всегда работает так, как мы хотим”
  * “Обучение на программе -это как изучение нового языка, Вы не будете свободно пользоваться прямо сейчас.”

**Что делать, если кто-то справляется раньше всех?**

  * They can try another Hour of Code activity at hourofcode.com/learn
  * Or, ask them to help a friend who are having trouble with the activity.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Отпразднуйте

  * [Print certificates](<%= resolve_url('https://code.org/certificates') %>) for participants.
  * [Print "I did an Hour of Code!"](<%= resolve_url('/promote/resources#stickers') %>) stickers.
  * [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for your employees.
  * Делитесь фотографиями и видео в социальных сетях. Используйте #HourOfCode и @codeorg чтобы вы могли подчеркнуть Ваш успех тоже!

[col-33]

![](/images/fit-250/celebrate2.jpeg)

[/col-33]

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Что происходит после "Часа программирования"?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey, [encourage your participants to learn online](<%= resolve_url('https://code.org/learn/beyond') %>).

<%= view :signup_button %>