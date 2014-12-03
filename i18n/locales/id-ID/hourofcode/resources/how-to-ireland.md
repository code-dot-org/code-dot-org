* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    How to teach one Hour of Code
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
  Kami akan menyelengarakan berbagai hal asyik, tutorial-tutorial untuk pelajar dari semua umur yang dibuat oleh mitra-mitra kerja kami. Tutorial-tutorial baru akan hadir pada Hour of Code sebelum 8-14 Desember.
</p>

<p>
  <strong>Semua tutorial Hour of Code:</strong>
</p>

<ul>
  <li>
    Minimal memerlukan waktu persiapan untuk guru
  </li>
  <li>
    Tutorial mandiri - memungkinkan pelajar untuk bekerja sesuai kecepatan dan tingkat keahlian mereka sendiri
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
    <strong>Tes tutorial pada perangkat atau komputer pelajar.</strong> Pastikan itu bekerja dengan baik (dengan suara dan gambar).
  </li>
  <li>
    <strong>Tinjau ulang halaman keberhasilan menyelesaikan tutorial</strong> untuk melihat apa yang pelajar akan lihat ketika menyelesaikannya.
  </li>
  <li>
    <strong>Sediakan headphone untuk kelas anda</strong>, atau minta pelajar untuk membawanya sendiri, jika tutorial bekerja dengan baik jika disertai suaranya.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>Tidak memiliki perangkat yang cukup?</strong> Gunakan <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">pemrograman berpasangan</a>. Ketika pelajar bekerja sama, mereka dapat saling membantu dan dapat mengurangi beban kerja pada guru. Mereka juga akan melihat ilmu komputer adalah sosial dan kolaboratif.
  </li>
  <li>
    <strong>Mempunyai bandwidth kecil?</strong> Rencanakan untuk menunjukan video di depan kelas, supaya setiap pelajar tidak mengunduh video mereka sendiri. Atau cobalah tutorial offline atau tanpa komputer.
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
    Video orginal peluncuran Code.org, yang menampilkan Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh (Ada versi <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">1 menit</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 menit</a>, dan <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9 menit</a>)
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">Video peluncuran Hour of Code 2013</a>, atau <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">Video Hour of Code 2014</a> <% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">Video Hour of Code 2014</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">Presiden Obama menyerukan semua pelajar untuk belajar ilmu komputer</a>
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
    Explain it in a simple way that includes examples of applications that both boys and girls will care about (saving lives, helping people, connecting people, etc.).
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