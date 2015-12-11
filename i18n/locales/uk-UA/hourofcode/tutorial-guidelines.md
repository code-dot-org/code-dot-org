* * *

title: <%= hoc_s(:title_tutorial_guidelines) %> layout: wide

* * *

<%= view :signup_button %>

# Tutorial guidelines for the Hour of Code™ and Computer Science Education Week

Code.org will host a variety of Hour of Code™ activities on the Code.org, Hour of Code, and CSEdWeek website(s). The current list is at [<%= resolve_url('code.org/learn') %>](%= resolve_url('https://code.org/learn') %).

Ми б хотіли організувати різноманітні зацікавлюючі заходи, але основною метою є оптимізація досвіду для учнів та вчителів, котрі є новачками в інформатиці. Скористайтесь цим документом в якості шаблону для своїх заходів, спрямованих на користувачів, котрі не мають досвіду вивчення програмування та інформатики.

  


**After reading the guidelines, you can submit your tutorial through our [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l).**

**NEW:** Unlike past years, we plan to introduce a new format for "teacher-led" Hour of Code activities. These will be listed below the self-guided activities in student-facing pages and emails. Details below.

<a id="top"></a>

## Зміст:

  * [General guidelines for creating an Hour of Code™ activity](#guidelines)
  * [Як буде оцінено підручники](#inclusion)
  * [How to submit (Due 10/15/2015)](#submit)
  * [Пропозиції для розробки заходів](#design)
  * [Рекомендації щодо торгової марки](#tm)
  * [Точка стеження](#pixel)
  * [Сприяння підручникам, тижню інформатики та Годині коду](#promote)
  * [Примітка для учнів з особливими потребами](#disabilities)

<a id="guidelines"></a>

## New for 2015: two formats of activities: self-guided or *lesson-plan*

Now that tens of thousands of educators have tried the Hour of Code, many classrooms are ready for more creative, less one-size-fits-all activities that teach the basics of computer science. To help teachers find inspiration, we'd like to collect and curate one-hour "Teacher-Led" lesson and activity plans for Hour of Code veterans. We will continue promoting the "Self-guided" format as well.

**Submit a Teacher-Led Lesson Plan, ideally for different subject areas *(NEW)***: Do you have an engaging or unique idea for an Hour of Code lesson? Some educators may prefer to host Hour of Code activities that follow a traditional lesson format rather than a guided-puzzle/game experience. If facilitated properly, more open-ended activities can better showcase the creative nature of computer science. We would love to collect **one-hour lesson plans designed for different subject areas**. For example, a one-hour lesson plan for teaching code in a geometry class. Or a mad-lib exercise for English class. Or a creative quiz-creation activity for history class. This can help recruit teachers in other subject areas to guide an Hour of Code activity that is unique to their field, while demonstrating how CS can influence and enhance many different subject areas.

You can start with this [empty template](https://docs.google.com/document/d/1zyD4H6qs7K67lUN2lVX0ewd8CgMyknD2N893EKsLWTg/pub) for your lesson plan.

Examples:

  * [Mirror Images (an activity for an art teacher)](https://csedweek.org/csteacher/mirrorimages.pdf)
  * [An arduino activity for a physics teacher](https://csedweek.org/csteacher/arduino.pdf)
  * [A history of technology activity for a history teacher](https://csedweek.org/csteacher/besttechnology.pdf)

[<button>How can I submit my own lesson plan?</button>](#submit)

  
  
**Student-led (Self-Guided) Format**: The original Hour of Code was built mostly on the success of self-guided tutorials or lessons, optionally facilitated by the teacher. There are plenty of existing options, but if you want to create a new one, these activities should be designed so they can be fun for a student working alone, or in a classroom whose teacher has minimal prep or CS background. They should provide directions for students as opposed to an open-ended hour-long challenge. В ідеалі, завдання та підручники мають бути інтегровані безпосередньо у платформу програмування, щоб уникнути незручного перемикання вікон чи закладок.

Note: On student-facing pages we'll list teacher-led activities *below* the self-guided ones, but we'll specifically call them out on pages or emails meant for educators.

## Загальні рекомендації створення заходів Години коду

The goal of an Hour of Code is to give beginners an accessible first taste of computer science or programming (not HTML). The tone should be that:

  * Computer science is not just for geniuses, regardless of age, gender, race. Anybody *can* learn!
  * Computer science is connected to a wide variety of fields and interests. Everybody *should* learn!
  * Заохочуйте учнів створювати проекти, якими можна поділитись з друзями/онлайн.

**Technical requirements**: Because of the wide variety of school and classroom technology setups, the best activities are Web-based or smartphone-friendly, or otherwise unplugged-style activities that teach computer science concepts without the use of a computer (see <http://csunplugged.com/>). Activities that require an app-install, desktop app, or game-console experiences are ok but not ideal.

[**На початок**](#top)

<a id="inclusion"></a>

## Як буде оцінено підручники

Комісія вчителів інформатики розгляне надіслані матеріали за якісними та кількісними характеристиками, включно з опитуванням широкого кола педагогів.

**Підручники отримають вищі оцінки, якщо:**

  * вони мають високу якість
  * designed for beginners - among students AND teachers
  * розраховані на ~1 годину занять
  * не вимагають реєстрації
  * не вимагають оплати
  * не вимагають встановлення
  * працюють на різних ОС/платформах, включаючи мобільні пристрої
  * перекладені різними мовами
  * promote learning by all demographic groups (esp. under-represented groups)
  * спрямовані не лише на веб-дизайн HTML+CSS (наша мета - інформатика, а не HTML-код)

**Підручники отримають нижчі оцінки, якщо:**

  * вони низької якості
  * призначені для вищого рівня (не для початківців)
  * обмежені у підтримуваних ОС/платформах - для веб-базованих платформ потрібна підтримка усіх браузерів: IE9+, останніх версій Chrome, Firefox та Safari
  * представлені лише англійською
  * reinforce stereotypes that hinder participation by under-represented student groups
  * пропонуються на платформі, яка бере плату за навчання

**Підручники НЕ відображатимуться, якщо:**

  * не створені як (приблизно) одно-годинне заняття
  * вимагають реєстрації 
  * вимагають оплати
  * require installation (other than mobile apps)
  * спрямовані лише на веб-дизайн HTML+CSS
  * подані після останнього терміну, або містять неповну інформацію (див.нижче)

**If your tutorial is student-led** Student-led tutorials need to be designed to be self-directed, not to require significant CS instruction or prep from teachers

Загалом, метою кампанії Година коду є залучення учнів та вчителів до інформатики та програмування, а також популяризація доступності предмету для всіх, у легшому, ніж уявляється вигляді. Зокрема, ця мета досягається тим, що учням та вчителям пропонується якомога простіший та якісніший вибір навчальних ресурсів, зрозумілих для новачків. Note also that the 2013 and 2014 Hour of Code campaigns were a fantastic success with over 120M served, with nearly unanimous positive survey responses from participating teachers and students. As a result, the existing listings are certainly good and the driving reason to add tutorials to the Hour of Code listings isn't to broaden the choices, but to continue to raise the quality (or freshness) for students, or to expand the options for non-English speakers given the global nature of the 2015 campaign.

[**На початок**](#top)

<a id="submit"></a>

## How to submit (Due 10/15/2015)

Visit the [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l) and follow the steps to submit your tutorial.

**Що вам знадобиться:**

  * Ваше ім'я, емблема (jpg, png, і т. д.)
  * URL для знімка екрану або рекламного зображення підручника Години коду. Зображення/скріншоти повинні бути точно 446 х 335 пікселів. Якщо відповідне зображення не буде надано, ми зробимо власний знімок екрану АБО виключимо Ваш підручник зі списку.
  * URL-адреса посилання на емблему
  * Назва підручника
  * URL-посилання на підручник
  * URL-посилання на нотатки для вчителя (факультативно, див подробиці нижче)
  * Опис підручника (для комп'ютера і мобільного пристрою) 
      * **Максимальна кількість символів для комп'ютерної версії:** 384
      * **Максимальна кількість символів для мобільної версії:** 384
      * Будь ласка, додайте опис того, чи діяльність є самостійною, чи потребує керівництва вчителя. Додатково, деякі школи хотіли б знати, чи вправи з Години коду відповідають новим державним стандартам освіти (Common Core чи Next Generation Science Standards). Якщо завдання відповідають певним державним стандартам, додайте інформацію про це.
  * Перелік перевірених/сумісних платформ: 
      * Web based: Which platforms have you tested 
          * ОС - Mac, Win і версії
          * Браузери - IE8, IE9, IE10, Firefox, Chrome, Safari
          * iOS мобільний Safari (оптимізований для мобільних пристроїв)
          * Android Chrome (оптимізований для мобільних пристроїв)
      * Non web-based: specify platform for native code (Mac, Win, iOS, Android, xBox, other)
      * Безмашинні вправи
  * Перелік підтримуваних мов і відповідний формат: 
      * Для посібника потрібно вказати, які мови підтримуються, використовуючи 2-символьне позначення мови, наприклад en - Англійська; ja - Японська
      * Якщо необхідна більша точність, використовуйте дефіси, наприклад fr-be- французька (Бельгія) або fr-ca - французька (Канада)
      * ***Примітка: Визначення мови є обов'язком автора підручника, ми перенаправляємо всіх користувачів до єдиної URL-адреси.*** 
  * Якщо ви надсилаєте онлайн-підручник, нам потрібно знати, чи він є [COPPA-сумісний](http://en.wikipedia.org/wiki/Children's_Online_Privacy_Protection_Act) .
  * Рекомендовані класи потенційних користувачів. Ви можете звернутись до [стандартів К-12 Асоціації вчителів інформатики Computer Science Teachers’ Association](http://csta.acm.org/Curriculum/sub/K12Standards.html) для визначення понять, що відповідають певному класу. Наприклад, рівнями класів є: 
      * Початкова школа: класи 1-2 або 3-5
      * Середня школа: класи 6-8
      * Старша школа: класи 9-12
      * Різний вік
  * Будь ласка, вкажіть рекомендований попередній рівень знань з інформатики: Початківець, Аматор чи Експерт. Сайт Години коду першочергово висвітлюватиме завдання для Початківців. If you’d like to prepare Intermediate and Advanced Hour of Code™ Activities, please include the prior knowledge needed in the description of your activity.
  * Технічні вимоги: 
      * Для того, щоб точніше відстежувати участь, ми хочемо, щоб кожен партнер-розробник підручника, розмістив 1-піксельне зображення для відстеження у свою першу та останню вправу. Розмістіть однопіксельне зображення на початку першої та в кінці останньої сторінки. Не розміщуйте пікселів на проміжних сторінках). Перегляньте розділ Піксель відстеження нижче для із детальнішою інформацією. 
      * Після завершення Вашої діяльності, користувачів потрібно направити [<%= resolve_url('code.org/api/hour/finish') %>](%= resolve_url('https://code.org/api/hour/finish') %) де вони зможуть: 
          * Поділитися у соціальних мережах тим, що вони завершили Годину коду
          * Отримати сертифікат про завершення Годину коду
          * Переглянути таблицю лідерів країн/міст, з яких найбільше учасників виконали Годину коду
          * For users who spend an hour on your activity and don’t complete it, please include a button on your activity that says “I’m finished with my Hour of Code” which links back to [<%= resolve_url('code.org/api/hour/finish') %>](%= resolve_url('https://code.org/api/hour/finish') %) as well. 
  * *(Необов'язково)* We will follow-up with an online survey/form link asking for a report of the following activity metrics for the week of Dec. 7, 12:01 am through Dec. 13, 11:59 pm) 
      * Для онлайнових завдань (особливо для смартфонів та планшетів): 
          * Кількість користувачів
          * Кількість тих, хто завершили завдання
          * Середній час на завдання
          * Загальна кількість рядків коду, написаних усіма користувачами
          * Продовжили подальше вивчення (визначається як кількість користувачів, які завершили завдання і перейшли до інших ресурсів сайту)
      * Для оффлайнових завдань 
          * Кількість завантажень паперової версії діяльності (за наявності)

[**На початок**](#top)

<a id="design"></a>

## Пропозиції для розробки заходів

You can include either the CSEdWeek logo ([small](https://www.dropbox.com/s/ojlltuegr7ruvx1/csedweek-logo-final-small.jpg) or [big](https://www.dropbox.com/s/yolheibpxapzpp1/csedweek-logo-final-big.png)) or the [Hour of Code logo](https://www.dropbox.com/work/Marketing/HOC2014/Logos%202014/HOC%20Logos) in your tutorial, but this is not required. If you use the Hour of Code logo, see the trademark guidelines below. Ні за яких обставин не можна використовувати логотип і назву Code.org. Both are trademarked, and can’t be co-mingled with a 3rd party brand name without express written permission.

**Переконайтесь, що середньостатистичний учень може завершити завдання за 1 годину.** Розгляньте варіант додавання відкритого завдання у кінці для тих учнів, котрі пройдуть урок швидше. Пам'ятайте, що більшість дітей будуть абсолютними новачками в інформатиці та програмуванні.

**Додайте рекомендації для вчителів.** Більшість завдань мають бути спрямованими на самостійну роботу учнів, але якщо завдання потребує допомоги чи супроводу вчителя, додайте чіткі та прості вказівки у формі рекомендацій за окремим посиланням. Новачками будуть не лише учні, але й деякі вчителі. Включіть наступну інформацію:

  * Наш підручник найкраще працює на наступних платформах і браузерах
  * Does it work on smartphones? Tablets?
  * Ви рекомендуєте парне програмування? 
  * Considerations for use in a classroom? E.g. if there are videos, advise teachers to show the videos on a projected screen for the entire classroom to view together

**Включіть зворотний зв'язок в кінці діяльності.** (Наприклад: "Ви завершили 10 рівнів і дізналися про цикли! Чудова робота!")

**Encourage students to post to social media (where appropriate) when they've finished.** For example “I’ve done an Hour of Code with ________ Have you? #HourOfCode" або "Я пройшов #HourofCode в рамках #CSEdWeek. А ви? @Scratch.” Використовуйте хеш-тег **#HourOfCode** (з великими літерами H, O, C)

**Create your activity in Spanish or in other languages besides English.** ]

**Поясніть або прив'яжіть своє завдання до соціально значущого контексту.** Програмування стає суперсилою, коли учні бачать, як вони можуть змінити світ на краще!

**Не вимагайте реєстрації чи платежу, перед тим як учні спробують ваш підручник.** Підручники, які вимагають реєстрації або оплати, не будуть включені у список

**Make sure your tutorial can be used in a [Pair Programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning) paradigm.** The three rules of pair programming in a school setting are:

  * Виконавець працює з мишкою та клавіатурою.
  * Керівник вносить пропозиції, вказує на помилки та задає питання. 
  * Учні повинні мінятися ролями принаймні двічі за заняття.

Переваги парного програмування:

  * Учні можуть допомогти один одному, не покладаючись на вчителя
  * Ілюстрація того, що програмування є не індивідуальним заняттям, а включає соціальну взаємодію
  * Не у всіх кабінетах є достатньо комп'ютерів для моделі 1:1

[**На початок**](#top)

<a id="tm"></a>

## Рекомендації щодо торгової марки

After the success of the 2013 campaign, we took steps to make sure we set up the Hour of Code as a movement that can repeat annually with greater fidelity and without confusion.

Одним з аспектів цього є захист торгової марки "Hour of Code" з метою запобігання плутанини. Багато наших партнерів-розробників завдань використали "Hour of Code" на своїх сайтах. Ми не хочемо забороняти таке використання, але воно має перебувати в межах вимог:

  1. Будь-яке посилання на Годину коду має використовуватись таким чином, щоб не створювати враження про те, що це Ваша власна торгова марка, натомість посилаючись на масовий рух Години коду. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Додайте на сторінку (або в колонтитул) текстовий блок з посиланнями на сайти CSEdWeek та Code.org, з наступним змістом:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

[**На початок**](#top)

<a id="pixel"></a>

## Точка стеження

Для того, щоб мати точнішу статистику участі, ми хочемо, щоб кожен партнер-розробник підручника, розмістив 1-піксельне зображення для відстеження у свою першу та останню вправу (перший піксель стартової сторінки та останній піксель фінальної сторінки вправи. Не на проміжних сторінках).

Це дозволить нам порахувати користувачів, яких ви безпосередньо залучите до відвідування свого сайту для проходження Години коду, або користувачів, які відвідають сторінку за посиланням вчителя. Це призведе до більш точного підрахунку учнів, котрі скористались вашим посібником, і допоможе вам залучити користувачів. Якщо ви вставите піксель в кінці, це дозволить нам вимірювати відсоток повного опрацювання підручника.

Якщо Ваш підручник буде затверджено і розміщено у переліку посібників, Code.org надасть унікальний піксель відстеження для додавання на сторінки цього ресурсу. Див. приклад нижче.

Примітка: для встановлюваних додатків це робити не обов'язково (для iOS/Android додатків або комп'ютерних програм)

Приклад пікселя відстеження для AppInventor:

IMG SRC = <http://code.org/api/hour/begin_appinventor.png>   
IMG SRC = <http://code.org/api/hour/finish_appinventor.png>

[**На початок**](#top)

<a id="promote"></a>

## Сприяння підручникам, тижню інформатики та Годині коду

Ми просимо усіх поширювати власні одно-годинні підручники для своїх користувачів. Please direct them to ***your*** Hour of Code page. Знайомі користувачі ймовірніше відреагують на особисте запрошення спробувати Ваш підручник. Використовуйте міжнародну кампанію тижня інформатики Година коду для того, щоб запросити інших приєднатися. Допоможіть нам зібрати 100 мільйонів учасників.

  * Feature Hour of Code and CSEdWeek on your website. Ex: <http://www.tynker.com/hour-of-code>
  * Поширюйте інформацію про Годину коду через соціальні мережі, традиційні медіа, списки розсилки тощо, використовуючи хеш-тег **#HourOfCode** (з великими літерами H, O, C)
  * Організуйте місцевий захід або попросіть співробітників провести захід у найближчій школі чи спільноті.
  * Ознайомтесь з нашим ресурсним комплектом з подальшою інформацією (скоро).

[**На початок**](#top)

<a id="disabilities"></a>

## Спеціально для учнів з обмеженими можливостями

Якщо ви створюєте підручник, призначений для учнів з проблемами зору, ми будемо раді виділити його для користувачів з активованим озвученням екрану. Ми ще не отримували такого підручника, але хотіли б мати такий варіант для цих учнів.

[**На початок**](#top)

<%= view :signup_button %>