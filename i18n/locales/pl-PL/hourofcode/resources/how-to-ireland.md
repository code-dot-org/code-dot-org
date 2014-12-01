* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Jak przeprowadzić jedną Godzinę Kodowania
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Zarejestruj swoje wydarzenie</button></a>
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
  Umieścimy szeroki wybór zabawnych, godzinnych samouczków dla uczniów w każdym wieku, utworzonych przez naszych partnerów. Nowe samouczki pojawią się, by rozpocząć Godzinę Kodowania, przed 8-14 grudnia 2014 roku.
</p>

<p>
  <strong>Wszystkie samouczki Godziny Kodowania:</strong>
</p>

<ul>
  <li>
    Wymagają od nauczycieli minimalnej ilości czasu na przygotowania
  </li>
  <li>
    Nie wymagają nadzoru, co pozwala uczniom pracować we własnym tempie, zgodnie z ich predyspozycjami
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
    <strong>Przetestuj samouczki na szkolnych komputerach lub urządzeniach.</strong> Upewnij się, że działają prawidłowo (z dźwiękiem i obrazem).
  </li>
  <li>
    <strong>Zrób podgląd strony końcowej z gratulacjami</strong> aby sprawdzić, co uczniowie zobaczą kiedy skończą zadania.
  </li>
  <li>
    <strong>Zapewnij słuchawki dla swojej klasy</strong> lub poproś uczniów, aby sami je przynieśli, jeśli samouczek, który wybrałeś(aś) działa najlepiej z dźwiękiem.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>Nie wystarcza urządzeń dla wszystkich uczniów?</strong> Mogą oni <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">programować w parach</a>. Gdy uczniowie dobierają się w pary, pomagają sobie nawzajem i mniej potrzebują pomocy nauczyciela. Zobaczą także, że praca z komputerem jest działalnością zespołową i uspołeczniającą.
  </li>
  <li>
    <strong>Masz wolne łącze?</strong> Pokazuj filmy całej klasie na projektorze, aby każdy uczeń nie musiał pobierać swojego filmu. Możesz też wypróbować samouczki offline.
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
    Orginalny film inaugurujący Code.org, z udziałem Billa Gatesa, Marka Zuckerberga i gwiazdy koszykówki Chrisa Bosha (Dostępne są wersje trwające <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">1 minutę</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 minut</a> i <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9 minut</a>)
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">Film inaugurujący Godzinę Kodowania w 2013 roku </a>, lub <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">film Godzina Kodowania 2014</a> <% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">film Godzina Kodowania 2014</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">Prezydent Obama zachęcający wszystkich studentów do nauki informatyki</a>
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
    Wyjaśnij to w prosty sposób, używając przykładów zastosowań, które będą bliskie zarówno chłopcom jak i dziewczynkom (ratowanie życia, pomaganie ludziom, komunikacja międzyludzka etc.).
  </li>
  <li>
    Powiedz np. "Pomyślcie o rzeczach w waszym życiu codziennym, które wykorzystują rozwiązania informatyczne: telefon komórkowy, mikrofalówka, komputer, sygnalizacja świetlna... Aby powstały, potrzebny był informatyk"
  </li>
  <li>
    Lub: "informatyka jest sztuką łączenia ludzkich pomysłów i narzędzi cyfrowych, aby zwiększyć nasze możliwości. Informatycy pracują w przeróżnych dziedzinach: piszą aplikacje na telefon, przyczyniają się do leczenia chorób, tworzą filmy animowane, pracują w mediach, budują roboty, które badają inne planety i wiele innych."
  </li>
  <li>
    Zobacz porady jak zainteresować informatyką dziewczyny <a href="http://<%= codeorg_url() %>/ dziewczyny "> tutaj</a>.
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
    Napisz link do samouczka na tablicy. Znajdź link wymieniony w informacji <a href="http://<%= codeorg_url() %>/learn">dla wybranego samouczka</a> pod liczbą uczestników. <a href="http://hourofcode.com/co">hourofcode.com/co</a>
  </li>
  <li>
    Powiedz uczniom, by weszli na podaną stronę i rozpoczęli samouczek.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Powiedz uczniom, "Zapytaj trzech a potem mnie" Zapytaj 3 kolegów i, jeśli oni nie znają odpowiedzi, zapytaj nauczyciela.
  </li>
  <li>
    Zachęcaj uczniów i dawaj im pozytywną informację: "Świetnie ci idzie, próbuj dalej."
  </li>
  <li>
    Nie ma nic złego w odpowiedzi 'Nie wiem'. Spróbujmy razem dojść do rozwiązania. Jeśli nie możesz znaleźć rozwiązania, to jest dobra lekcja nauki dla klasy: "Technologia nie zawsze działa tak jak byśmy chcieli". Razem jesteśmy społecznością uczniów." Oraz: "Nauka programowania jest jak uczenie się nowego języka; biegłość nabywa się z czasem."
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Uczniowie mogą zobaczyć wszystkie samouczki i spróbować innej formy aktywności Godziny Kodowania na <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
  </li>
  <li>
    Albo poproś uczniów którzy skończyli wcześniej, żeby pomogli kolegom, którym idzie nieco wolniej.
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