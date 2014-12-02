* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Як провести Годину коду
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Зареєструйте свій захід</button></a>
  </div>
</div>

<font size="4">On December 8th, as part of the global Hour of Code movement Microsoft is seeking to enable as many people as possible in Ireland to have the opportunity to learn how to code.</p> 

<p>
  On 19th November Microsoft will run a training session for people hosting events at its campus in Sandyford from 6pm - 8pm.
</p>

<p>
  This will run through the curriculum which can be delivered for Hour of Code on 8th December. If you would like to register to attend this event please email cillian@q4pr.ie. Places are on a first come first served basis. </font>
</p>

<h2>
  Details of the curriculum can be found <a href="https://www.touchdevelop.com/hourofcode2">here</a>
</h2>

<h2>
  1) Try the tutorials:
</h2>

<p>
  Ми запропонуємо кілька цікавих одно-годинних підручників від наших партнерів для учнів різного віку. Готуються нові підручники для цьогорічної Години коду, яка відбудеться 8-14 грудня.
</p>

<p>
  <strong>Всі підручники Години коду:</strong>
</p>

<ul>
  <li>
    Вимагають мінімального підготовчого часу вчителів
  </li>
  <li>
    Призначені для самостійного навчання - дозволяючи учням працювати у власному темпі відповідно до свого рівня знань
  </li>
</ul>

<p>
  <a href="http://<%=codeorg_url() %>/learn"><img src="http://<%= codeorg_url() %>/images/tutorials.png" /></a>
</p>

<h2>
  2) Plan your hardware needs - computers are optional
</h2>

<p>
  The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every child, and can even do the Hour of Code without a computer at all.
</p>

<ul>
  <li>
    <strong>Перевірте підручники на учнівських комп'ютерах чи інших пристроях.</strong> Переконайтесь, що все працює коректно (зі звуком та відео).
  </li>
  <li>
    <strong>Ознайомтесь з вітальною сторінкою</strong>, яку побачать учні після завершення роботи.
  </li>
  <li>
    <strong>Подбайте про навушники</strong>, або попросіть учнів взяти власні, якщо обраний Вами підручник потребує звукового супроводу.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>Мало комп'ютерів?</strong> Застосовуйте <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">парне програмування</a>. Коли учні працюють в парах, вони вчаться допомагати один одному і менше покладатись на вчителя. Таким чином вони дізнаються, що інформатика є соціальною та груповою діяльністю.
  </li>
  <li>
    <strong>Поганий Інтернет?</strong> Сплануйте фронтальний перегляд відео-роликів, щоб зменшити завантаження учнівських комп'ютерів. Або спробуйте безмашинні чи оффлайнові вправи.
  </li>
</ul>

<h2>
  4) Inspire students - show them a video
</h2>

<p>
  Show students an inspirational video to kick off the Hour of Code. Examples:
</p>

<ul>
  <li>
    Перше відео від Code.org, у ролях Біл Гейтс, Марк Цукенберг, зірка НБА Кріс Бош (Існують версії на <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">1 хвилину</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 хвилин</a>, та <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9 хвилин</a>)
  </li>
  <li>
    Відео від <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">Години коду 2013</a>, або <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">Години коду 2014</a> <% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">Години коду 2014</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">Заклик Президента Обами до всіх учнів - вивчати програмування</a>
  </li>
</ul>

<p>
  <strong>Get your students excited - give them a short intro</strong>
</p>

<p>
  Most kids don’t know what computer science is. Here are some ideas:
</p>

<ul>
  <li>
    Пояснюйте простими аналогіями із діяльностями, котрі важливі для хлопців та дівчат (порятунок життя, допомога людям, спілкування тощо).
  </li>
  <li>
    Спробуйте таке: "Подумайте про те, як у вашому житті застосовуються здобутки інформатики: в телефоні, мікрохвильовці, комп'ютері, світлофорі... всі ці речі можливі завдяки тому, що програмісти створили відповідні програми."
  </li>
  <li>
    Або: «Інформатика - це мистецтво поєднання людських ідей та цифрових інструментів для того, щоб розширити наші можливості. Програмісти працюють у різноманітних сферах: пишуть програми для телефонів, здійснюють розробки для медицини, створюють мультфільми, працюють у соціальних медіа, розробляють роботів, які досліджують інші планети та багатьох інших."
  </li>
  <li>
    Поради залучення дівчаток до галузі інформатики <a href="http://<%= codeorg_url() %>/girls"> тут</a>.
  </li>
</ul>

<h2>
  5) Start your Hour of Code
</h2>

<p>
  <strong>Direct students to the activity</strong>
</p>

<ul>
  <li>
    Запишіть веб-адресу підручника на дошці. Знайти посилання можна серед <a href="http://<%= codeorg_url() %>/learn">інформації про обраний підручник</a> під кількістю учасників. <a href="http://hourofcode.com/co">hourofcode.com/co</a>
  </li>
  <li>
    Запросіть учнів відкрити URL-адресу та розпочати навчання.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Оголосіть правило: "Спитай сусідів, тоді мене". Нехай учні запитають трьох однокласників перед тим, як задавати питання вчителеві.
  </li>
  <li>
    Заохочуйте учнів та позитивно підкріплюйте їхній успіх: "У тебе добре виходить, пробуй далі."
  </li>
  <li>
    Нормальною є відповідь: "Я не знаю. Спробуймо розібратись разом." Якщо не вдається знайти рішення задачі, використайте це в якості уроку: "Технології не завжди працюють так, як нам цього хочеться. Ми вчимося разом". І: "Вивчення програмування - це як вивчення нової мови; нею неможливо одразу вільно говорити."
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Учні можуть скористатись іншим підручником Години коду <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
  </li>
  <li>
    Або попросіть учнів, котрі справились швидше, допомогти однокласникам, у яких виникли труднощі з вправами.
  </li>
</ul>

<p>
  <strong>How do I print certificates for my students?</strong>
</p>

<p>
  Each student gets a chance to get a certificate via email when they finish the <a href="http://studio.code.org">Code.org tutorials</a>. You can click on the certificate to print it. However, if you want to make new certificates for your students, visit our <a href="http://<%= codeorg_url() %>/certificates">Certificates</a> page to print as many certificates as you like, in one fell swoop!
</p>

<p>
  <strong>What comes after the Hour of Code?</strong>
</p>

<p>
  The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. <% if @country == 'uk' %> The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey, <a href="http://uk.code.org/learn/beyond">encourage your children to learn online</a>. <% else %> To continue this journey, find additional resources for educators <a href="http://<%= codeorg_url() %>/educate">here</a>. Or encourage your children to learn <a href="http://<%= codeorg_url() %>/learn/beyond">online</a>. <% end %> <a style="display: block" href="<%= hoc_uri('/#join') %>"><button style="float: right;">Sign up your event</button></a>
</p>