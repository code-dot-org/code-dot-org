* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Kako poučavati Sat Kodiranja
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Prijavite vaš događaj</button></a>
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
  Imat ćemo raznolike zabavne vodiče u trajanju od jednog sata za učenike svih uzrasta, pripremljene od strane raznih partnera. Novi vodiči bit će ovdje kako bi započeli Sat Kodiranja prije 8-og prosinca.
</p>

<p>
  <strong>Svi vodiči Sata Kodiranja:</strong>
</p>

<ul>
  <li>
    Zahtijevaju minimalno vrijeme pripreme učitelja
  </li>
  <li>
    Prigodni su za samostalno učenje - dozvoljavajući učenicima da rade vlastitim tempom i na svojoj razini
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
    <strong>Isprobajte vodiče na računalima i uređajima učenika.</strong> Osigurajte se da ispravno funkcioniraju (zvuk i slika).
  </li>
  <li>
    <strong>Pregledajte stranicu sa čestitkama (certifikatima)</strong> da biste vidjeli što će učenici vidjeti po završetku.
  </li>
  <li>
    <strong>Opremite razred slušalicama</strong> ili zamolite učenike da donesu svoje vlastite ukoliko vodič koji ste odabrali najbolje radi sa zvukom.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>Nemate dovoljno uređaja?</strong> Koristite <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">programiranje u parovima</a>. Kada učenici rade sa suradnikom, oni pomažu jedan drugome i manje se oslanjaju na učitelja. Tako će uvidjeti da je informatika druževna i dobra za suradnju.
  </li>
  <li>
    <strong>Niska propusnost?</strong> Planirajte prikaz video zapisa u prednjem dijelu učionice, tako da svaki učenik ne mora preuzimati vlastitu kopiju video zapisa. Možete isprobati i vodiče koji ne zahtijevaju upotrebu računala i/ili interneta.
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
    Originalni video zapis kada je Code.org pokrenut, u kome su Bill Gates, Mark Zuckerberg i zvijezda NBA-a Chris Bosh (Možete izabrati verzije u trajanju od <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">1 minute</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 minuta</a> i <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9 minuta</a>)
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw"> Video sa pokretanja Sata Kodiranja 2013</a> ili <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">video Sat Kodiranja 2014</a> <% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">Sat Kodiranja 2014 video</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">Predsjednik Obama poziva sve učenike da nauče informatiku</a>
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
    Objasnite im na jednostavan način pružajući primjere o kojima djeca brinu (spašavanje života, pomaganje ljudima, povezivanje ljudi itd.).
  </li>
  <li>
    Pokušajte ovo:"Razmislite o svakodnevnim uređajima u svom životu koji koriste računala: mobilni telefon, mikrovalna pećnica, semafor... svi ovi uređaji trebaju informatičare koji će ih pomoći izgraditi."
  </li>
  <li>
    Ili ovo: "Informatika je umjetnost stapanja ljudskih ideja i digitalnih alata kako bismo uvećali svoje snage. Informatičari rade u mnogo različitih oblasti: pišu aplikacije za telefone, rade na izliječenju bolesti, stvaraju animirane filmove, rade na društvenim mrežama, grade robote koji istražuju druge planete i još mnogo toga."
  </li>
  <li>
    Pogledajte prijedloge o tome kako zainteresirati djevojke za informatiku<a href="http://<%= codeorg_url() %>/girls">ovdje</a>.
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
    Napišite link za vodič na ploči. Pronađite link izlistan na <a href="http://<%= codeorg_url() %>/learn">informacijama za vaš odabrani vodič</a> pod brojem sudionika. <a href="http://hourofcode.com/co">hourofcode.com/co</a>
  </li>
  <li>
    Recite učenicima da posjete URL i započnu koristiti vodič.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Recite učenicima: "Pitaj tri oko sebe, pa tek onda pitaj mene." Pitajte druge učenike i ukoliko oni ne znaju odgovor, pitajte učitelja.
  </li>
  <li>
    Potaknite učenike i pružite im pozitivnu podršku: "Ide ti odlično, samo nastavi."
  </li>
  <li>
    Sasvim je u redu odgovoriti im sa: "Ne znam. Pokušajmo to riješiti zajedno." Ukoliko vi ne znate riješiti zadatak, upotrijebite to kao lekciju za razred: "Tehnologija ne pruža uvijek rezultate koje mi želimo. Mi smo svi zajedno zajednica učenika." I:"Učenje programiranja je kao učenje stranog jezika; ne možete odmah tečno govoriti."
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Učenici mogu pregledati sve vodiče i isprobati neku drugu aktivnost Sata Kodiranja na <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
  </li>
  <li>
    Ili zamolite učenike koji završe ranije da pomognu svojim kolegama koji imaju poteškoća s aktivnostima.
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