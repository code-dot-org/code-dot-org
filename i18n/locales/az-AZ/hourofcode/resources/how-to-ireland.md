* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Kod Saatını necə tədris etməli
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Tədbirinizi qeydiyyatdan keçirin</button></a>
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
  Hər yaşdan olan şagirdlər üçün müxtəlif tərəfdaşlarımızın hazırladığı, cürbəcür əyləncəli, bir saatlıq dərsliklər yerləşdirəcəyik. 8-14 dekabrdan əvvəl Kod Saatına start vermək üçün yeni dərsliklər də olacaq.
</p>

<p>
  <strong>Bütün Kod Saatı dərslikləri:</strong>
</p>

<ul>
  <li>
    Hazırlıq üçün müəllimlərin az vaxtını alır
  </li>
  <li>
    Müstəqil tədris üçün yararlıdır - hər kəsə öz tempi və bacarığına uyğun iş seçməyə imkan verir
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
    <strong>Şagirdlərin kompüter və avadanlığında çalışmaları test edin.</strong> Əmin olun ki, hər şey qaydasındadır (video və səslə bağlı).
  </li>
  <li>
    <strong>Təbrik səhifələrinə baxın,</strong> çalışma yekunlaşdıqda şagirdlərin nə ilə rastlaşacaqlarıyla tanış olun.
  </li>
  <li>
    <strong>Əgər seçdiyiniz çalışmalar səslidirsə</strong>, şagirdləri qulaqcıqlarla təmin edin, yaxud evdən özlərininkini gətirməyi tapşırın.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>Kifayət qədər qurğunuz yoxdur?</strong> Onda <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">cüt-cüt proqramlaşdırma</a>dan istifadə edin. Şagirdlər yoldaşlı işləyəndə bir-briniə kömək edirlər və müəllimdən daha az asılı olurlar. Onlar həm də görərlər ki, informatika ictimai və kollektiv bir sahədir.
  </li>
  <li>
    <strong>Şəbəkənizin ötürmə sürəti azdır?</strong> Videoları sinfin qarşısında göstərməyi planlaşdırın ki, hər şagird özü üçün videoları endirməsin, ya da avadanlıqsız, oflayn dərslikləri sınayın.
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
    "Code.org"un Bill Qeyts, Mark Tsukerberq və NBA basketbol ulduzu Kris Boşun iştirakı ilə çəkilmiş ilk açılış videosu (Uzunluğu <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">1 dəqiqə</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 dəqiqə</a> və <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9 dəqiqə</a> olan versiyalar var)
  </li>
  <li>
    Kod Saatı 2013 <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">açılış videosu</a> və ya <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">Kod Saatı 2014 videosu</a> <% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">Kod Saatı 2014 videosu</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">Prezident Obamanın bütün şagirdləri infromatikanı öyrənməyə çağırması</a>
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
    Sadə üsulla bunu izah edin, həm oğlanlara, həm də qızlara maraqlı olan tətbiq sahələrini misal çəkin (xilasetmə işləri, insanlara yardım etmək, onların arasında ünsiyyət yaratmaq və s.).
  </li>
  <li>
    Sınaqdan keçirin: "Gündəlik həyatınızda informatikadan istifadə edən əşyalar barədə düşünün: mobil telefon, mikrodalğalı soba, kompüter, svetofor... bunların hamısını düzəltmək üçün informatika mütəxəssisləri lazım olub".
  </li>
  <li>
    Yaxud: "İnformatika bizim gücümüzü artırmaq üçün insani ideyalar və rəqəmli alətləri qovuşduran bir sənətidir. İnformatika sahəsinin alimləri olduqca müxtəlif sahələrdə işləyirlər: telefonlar üçün tətbiqi prooqramlar yazır, xəstəlikləri sağaldır, animasiyalı filmlər düzəldir, sosial media üzərində işləyir, başqa planetləri tədqiq edən robotlar düzəldir, daha nələr edirlər".
  </li>
  <li>
    Qızları informatika ilə maraqlandırmaq üçün məsləhətlərə <a href="http://<%= codeorg_url() %>/girls">burada</a> baxın.
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
    Dərsliyin keçidini lövhədə yazın. <a href="http://<%= codeorg_url() %>/learn">Seçdiyiniz dərsliyə aid məlumatda</a> iştirakçıların sayından aşağıdakı siyahıda göstərilən keçidi tapın. <a href="http://hourofcode.com/co">hourofcode.com/az</a>
  </li>
  <li>
    Şagirdlərə deyin ki, həmin ünvana keçərək dərsliyi işə salsınlar.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Şagirdlərinizə deyin ki, "3-ündən soruşun, sonra məndən". Üç sinif yoldaşınızdan soruşun və əgər onlar cavabı bilmirsə, müəllimdən soruşun.
  </li>
  <li>
    Şagirdləri təşviq edin və müsbət rəylərlə həvəsləndirin: "Səndə əla alınır, cəhd etməyə davam et."
  </li>
  <li>
    Belə də cavab vermək olar: "Bilmirəm. Gəlin, bundan birlikdə baş çıxardaq." Problemi həll edə bilmirsinizsə, bunu sinif üçün yaxşı təcrübə dərsi kimi istifadə edin: "Texnologiya həmişə biz istədiyimiz kimi işləmir. Birlikdə biz bir tələbə kollektiviyik". Əlavə: "Proqramlaşdırmanı öyrənmək yeni bir dili öyrənmək kimidir, həmən dəqiqə axıcı danışmaq olmur".
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Şagirdlər <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>burada</a> bütün dərsliklərə baxıb, başqa bir Kod Saatı fəaliyyətini sınaqdan keçirə bilərlər.
  </li>
  <li>
    Yaxud da fəaliyyəti vaxtından əvvəl bitirmiş şagirdlərdən çətinliyi olan sinif yoldaşlarına kömək etməyi xahiş edin.
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