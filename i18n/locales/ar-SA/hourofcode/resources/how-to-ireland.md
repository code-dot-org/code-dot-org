* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    كيف تدرس ساعة واحدة لتعلم البرمحة
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Sign up your event</button></a>
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
  سوف نستضيف مجموعة متنوعة من الدروس الممتعة، و التي تدوم ساعة واحدة لطلاب من جميع الإعمار، تم إنشاؤها بواسطة مجموعة من الشركاء. دروس جديدة تأتي لاطلاق حدث "ساعة البرمجة" قبل 8-14 كانون الأول/ديسمبر.
</p>

<p>
  <strong>جميع دروس ساعة البرمجة:</strong>
</p>

<ul>
  <li>
    تتطلب الحد الأدنى من الوقت للاعداد بالنسبة للمعلمين
  </li>
  <li>
    ذات توجيه ذاتي - و هو ما يمكن التلاميذ من العمل حسب نسقهم و مهارتهم
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
    <strong>اختبر الدروس على حواسيب أو أجهزة الطلبة.</strong> تأكد من أنها تعمل بشكل صحيح (مع الصوت والفيديو).
  </li>
  <li>
    <strong>عاين صفحة التهاني </strong> لترى ما سيشاهده الطلاب عندما ينتهون.
  </li>
  <li>
    <strong>وفر السماعات للقسم</strong>، أو أطلب من الطلاب إحضار سماعاتهم، إذا اخترت برنامجا تعليميا يعمل بشكل أفضل مع الصوت.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>ليس لديك ما يكفي من الأجهزة؟</strong> استخدم <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">البرمجة في مجموعات تضم فردين</a>. عندما يتعاون الطلبة، يقل الاعتماد على المعلم. سيعرفون ان علوم الحاسوب اجتماعية و تعاونية.
  </li>
  <li>
    <strong>سرعة الانترنات منخفضة ؟</strong> قم بعرض أشرطة الفيديو امام كل القسم، بحيث لا يستحق كل طالب تحميل أشرطة الفيديو. أو حاول الدروس الغير موصولة.
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
    الفيديو الرسمي ل Code.org، من تقديم بيل غاتس Bill Gates , مارك زوكربيرج Mark Zuckerberg و نجم إن بي أي NBA كريس بوش (توجد نسح <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">1 دقيقة واحدة</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 دقائق</a>, and <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9 دقائق</a> )
  </li>
  <li>
    The <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">Hour of Code 2013 launch video</a>, or the <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">Hour of Code 2014 video</a> <% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">Hour of Code 2014 video</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">الرئيس الأمريكي أوباما يدعو جميع الطلاب لتعلم علوم الحاسب الآلي</a>
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
    إشرحها بطريقة سهلة تتخلها أمثلة برامج يهتم بها كل من الصبيان والصبيات مثل ( إنقاذ حياة، مساعدة آخرين، تواصل مع الآخرين، إلخ...).
  </li>
  <li>
    Try: "Think about things in your everyday life that use computer science: a cell phone, a microwave, a computer, a traffic light… all of these things needed a computer scientist to help build them.”
  </li>
  <li>
    Or: “Computer science is the art of blending human ideas and digital tools to increase our power. Computer scientists work in so many different areas: writing apps for phones, curing diseases, creating animated movies, working on social media, building robots that explore other planets and so much more."
  </li>
  <li>
    See tips for getting girls interested in computer science <a href="http://<%= codeorg_url() %>/girls">here</a>.
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
    Write the tutorial link on a whiteboard. Find the link listed on the <a href="http://<%= codeorg_url() %>/learn">information for your selected tutorial</a> under the number of participants. <a href="http://hourofcode.com/co">hourofcode.com/co</a>
  </li>
  <li>
    Tell students to visit the URL and start the tutorial.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Tell students, “Ask 3 then me.” Ask 3 classmates, and if they don’t have the answer, then ask the teacher.
  </li>
  <li>
    Encourage students and offer positive reinforcement: “You’re doing great, so keep trying.”
  </li>
  <li>
    It’s okay to respond: “I don’t know. Let’s figure this out together.” If you can’t figure out a problem, use it as a good learning lesson for the class: “Technology doesn’t always work out the way we want. Together, we’re a community of learners.” And: “Learning to program is like learning a new language; you won’t be fluent right away.“
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Students can see all tutorials and try another Hour of Code activity at <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
  </li>
  <li>
    Or, ask students who finish early to help classmates who are having trouble with the activity.
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