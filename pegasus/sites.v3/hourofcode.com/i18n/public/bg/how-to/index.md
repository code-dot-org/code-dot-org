---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# Как да преподаватe Hour of Code

Присъединете се към движението и въведете група от ученици в първия им час по компютърни науки с тези стъпки:

## 1) Гледайте видео с примери <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 2) изберете настойнически за вашия час:

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('/learn') %>) for students of all ages, created by a variety of partners.

**[Самонасочващи Hour of Code уроци:](<%= resolve_url('/learn') %>)**

  * Изискват минимална подготовка на учителите
  * Предвиждат смостоятелна работа, което позволява на учениците да работят по собствените си темпове и ниво на умения

**[Учителско ръководство за Hour of Code уроците:](<%= resolve_url('https://code.org/educate/teacher-led') %>)**

  * Това са планове за уроци, които не изискват някаква предварителна подготовка на учителя
  * Ккатегоризирани са по класове *and* по предметна област(напр. математика, английски и др.)

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

## Промотирайте своя Hour of Code

Промотирайте Вашия час на кода [ с тези инструменти](<%= resolve_url('/promote') %>) и насърчете другите да направят техни собствени събития.

## 4) планирай нужните ти технологии - компютрите не са задължителни

Най-добрият Час на кодирането се провежда с Интернет свързани компютри. Но вие **не** се нуждаете от компютър за всяко дете, и можете дори да проведете часът на кода без компютър за всички.

**Предварителен план!** Направете следното, преди вашето събитие да започне:

  * Тествайте уроците на компютри или устройства. Уверете се, че те работят правилно в браузърите със звук и видео.
  * Предоставете слушалки за класа си, или помолете учениците да си донесат, ако изберете уроци за начинаещи -най-добре е със звук.
  * **Няма достатъчно устройства?** Използвайте [ програмиране по двойки](https://www.youtube.com/watch?v=vgkahOzFH2Q). Когато учениците си партнират, те си помагат един на друг и разчитат по-малко на учителя. Те ще се убедят, че компютърните науки се нуждаят от социално сътрудничество.
  * **Имате слаби машини?** Планирайте показване на видео клиповете пред целия клас, така че да няма нужда учениците да ги стартират на техните компютри. Или опитайте дейностите без компютър.

![](/images/fit-350/group_ipad.jpg)

## 5) Започнете Вашия час на кода с вдъхновяващо видео

**Поканете [ местни доброволци](https://code.org/volunteer/local) да вдъхновят учениците като говорят за широките възможности на информатиката.** Има хиляди доброволци по целия свят, готови да помогнат с Hour of Code. [ Използвайте тази карта](https://code.org/volunteer/local), за да намерите местни доброволци, които могат да посетят вашата класна стая или се присъединят към видео чат с вашите ученици.

[![](/images/fit-300/volunteer-map.png)](<%= resolve_url('https://code.org/volunteer/local') %>)

**Покажи вдъхновяващо видео:**

  * Оригиналният стартиращ Code.org клип, с участието на Бил Гейтс, Марк Зукерберг и НБА звезда Крис Бош (има версии за [ 1 минута](https://www.youtube.com/watch?v=qYZF6oIZtfc), [ 5 минути](https://www.youtube.com/watch?v=nKIu9yen5nc) и [ 9 минути](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * Видео[ клипът на първия Hour of Code от 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw), или <% if @country == 'uk' %> [ клипът за часът на кода 2015](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [ Hour of Code 2015 видео](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [Президентът Обама призовава всички ученици да учат компютърни науки](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Намери още вдъхновяващи [ ресурси](<%= resolve_url('https://code.org/inspire') %>) и [ видеа](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Не е лошо ако Вие и Вашите ученици сте новаци в компютърните науки. Ето някои идеи, за да въведете дейността Hour of Code:**

  * Обяснете начините как технологията въздейства на живота ни, с примери, които ще впечатлят момчета и момичета (спасяване на живот, помощ за хората, свързване на хора и др.).
  * В клас направете списък на нещата, които използват код в ежедневния живот.
  * Вижте съвети за въвличане на момичета в компютърните науки [тук](<%= resolve_url('https://code.org/girls') %>).

**Нуждаете се от повече насоки?** Изтеглете този [ шаблон на план на урок](/files/EducatorHourofCodeLessonPlanOutline.docx).

**Искате повече идеи?** Вижте [ най-добрите практики](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) от опитни педагози.

## 6) Кодене!

**Въвеждане на учениците в дейността**

  * Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn') %>) under the number of participants.

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

**Когато учениците срещнат трудности е добре да отговорите:**

  * "Аз не знам. Нека да разберем това заедно."
  * "Технологията не винаги работи по начина, по който ние искаме."
  * "Да се научиш да програмираш е като изучаването на нов език; няма да го овладееш веднага."

**[Вижте тези съвети за учители](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**Какво да направя ако ученик завърши по-рано?**

  * Students can see all tutorials and try another Hour of Code activity at [hourofcode.com/learn](<%= resolve_url('/learn') %>)
  * Или помолете учениците, които са завършили по- рано да помогнат на съучениците си, които имат проблеми с дейността.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Празник

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * [ Отпечатайте сертификати](<%= resolve_url('https://code.org/certificates') %>) за Вашите ученици.
  * [ Разпечатайте "Направих Hour of Code!"](<%= resolve_url('/promote/resources#stickers') %>) стикери за вашите ученици.
  * [ поръчайте тениски](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) за вашето училище.
  * Споделете снимки и видео на събитието си в социалните медии. Използвайте #HourOfCode и @codeorg,, така ще можем да научим за Вашия успех!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Други ресурси за педагози:

  * Използвайте този [ шаблон за урочен план](/files/EducatorHourofCodeLessonPlanOutline.docx) за организиране на Hour of Code.
  * Вижте [ най-добрите практики](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) от миналите събития, споделени от учители. 
  * Гледайте запис от нашето [ ръководство за преподаватели за Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
  * [ Присъствайте на живо Q & А](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) с нашия основател, Хади Partovi да се подготвите за Hour of Code.
  * Посетете [ Hour of Code Форума](http://forum.code.org/c/plc/hour-of-code), за да получите съвети и подкрепа от други преподаватели. <% if @country == 'us' %>
  * Прегледайте [ часът на кода често задавани въпроси](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Какво идва след Hour of Code?

Hour of Code е само първата стъпка в пътешествието в изучаването на това, как технологията работи и как да създавате софтуерни приложения. За да продължите това пътуване:

  * Насърчете учениците да продължават да [ учат онлайн](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [Да се присъединят](<%= resolve_url('https://code.org/professional-development-workshops') %>)към 1-деневен уоркшоп, за да получат обучение от опитни фасилитатори. (Само за учители от САЩ)

<%= view :signup_button %>