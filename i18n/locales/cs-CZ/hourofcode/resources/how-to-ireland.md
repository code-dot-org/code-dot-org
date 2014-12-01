* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Jak vyučovat Hodinu kódu
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Přihlaste svoji událost</button></a>
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
  Pro žáky všech věkových kategorií uspořádáme řadu zábavných jednohodinových cvičení, vytvořených celou řadou partnerů. Připravují se nová cvičení, která budou k dispozici před zahájením akce Hodina kódu, která proběhne ve dnech 8.–14. prosince.
</p>

<p>
  <strong>Všechna cvičení Hodiny kódu:</strong>
</p>

<ul>
  <li>
    Vyžadují minimum času vyučujícího na přípravu
  </li>
  <li>
    Řídí se samy, což umožňuje žákům postupovat jejich vlastním tempem a podle jejich úrovně
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
    <strong>Přezkoušejte cvičení na počítačích a zařízeních studentů.</strong> Ujistěte se, že fungují správně (se zvukem a videem).
  </li>
  <li>
    <strong>Prohlédněte si stránku s certifikátem</strong> abyste sami viděli, co obdrží žáci, když výuku dokončí.
  </li>
  <li>
    <strong>Zajistěte své třídě sluchátka</strong> nebo požádejte své žáky, aby si přinesli svá vlastní, pokud vámi zvolená cvičení fungují nejlépe se zvukem.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>Nemáte dostatek počítačů?</strong> Využijte <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">programování ve dvojicích</a>. Pokud se studenti spojí do dvojic, budou si vzájemně pomáhat a budou méně závislí na vyučujícím. Uvidí také, že informatika je společenská a využívá spolupráci.
  </li>
  <li>
    <strong>Máte pomalé připojení?</strong> Naplánujte promítnutí videí před celou třídou, aby si pak studenti nemuseli stahovat každý své vlastní. Nebo zkuste cvičení offline nebo unplugged (bez počítače).
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
    Původní Code.org video, zobrazující Billa Gatese (Microsoft), Marka Zuckerberga (Facebook) a hvězdu basketbakové NBA ligy Chrise Boshe (délka verzí <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">1 minuta</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 minut</a> a <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9 minut</a>)
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">Úvodní video Hodiny kódu 2013</a> nebo <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">video Hodiny kódu 2014</a> <% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">video Hodiny kódu 2014</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">President Obama vyzývá studenty, aby se učili informatiku</a>
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
    Jednoduše jim vysvětlete, že informatiku použijete v případech, o které se zajímají chlapci i dívky (zachraňovat životy, pomáhat lidem, spojovat lidi atd.).
  </li>
  <li>
    Zkuste: "Přemýšlejte o věcech každodenního života, které používají informatiku: mobil, mikrovlnná trouba, počítač, semafory ... všechna tato zařízení potřebují informatiky, aby je pomohli vymyslet a sestrojit."
  </li>
  <li>
    Nebo:"Informatika je umění smíchat lidské myšlenky s digitálními nástroji pro zlepšení našich schopností a sil. Informatici pracují v mnoha rozdílných oblastech: píšou aplikace pro smartphony, léčí nemocné, vytvářejí animované filmy, pracují v sociálních médiích, konstruují roboty, kteří zkoumají jiné planety a ještě daleko více."
  </li>
  <li>
    Podívejte se na několik tipů, jak <a href="http://<%= codeorg_url() %>/girls">zaujmout dívky informatikou</a>.
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
    Napište odkaz na cvičení na tabuli. Odkaz najdete mezi<a href="http://<%= codeorg_url() %>/learn">informacemi o vámi zvoleném materiálu,</a> pod číslem účastníka. <a href="http://hourofcode.com/co">hourofcode.com/co</a>
  </li>
  <li>
    Řekněte žákům, aby si opsali odkaz a zahájili cvičení.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Řekněte studentům: „Zeptejte se tří, potom mě.“ Zeptejte se tří spolužáků a pokud ti nebudou znát odpověď, zeptejte se učitele.
  </li>
  <li>
    Povzbuďte studenty a dodejte jim sebedůvěru: „Jde vám to skvěle, tak pokračujte!“
  </li>
  <li>
    Je v pořádku říct: „Nevím. Pojďme to vymyslet spolu." Pokud nemůžete vyřešit nějaký problém, použijte jej jako dobrou poučku pro třídu: „Technologie ne vždy funguje tak, jak chceme. Společně jsme komunita studentů." A: "Učit se programovat je jako učit se nový jazyk; nepůjde vám to hladce hned."
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Studenti mohou vidět všechny návody a vyzkoušet jinou aktivitu Hodiny kódu na <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
  </li>
  <li>
    Nebo požádejte studenty, kteří jsou hotovi brzi, aby pomohli spolužákům, kteří mají potíže s aktivitou.
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