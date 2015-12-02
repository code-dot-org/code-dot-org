* * *

title: <%= hoc_s(:title_how_to) %> layout: wide nav: how_to_nav

* * *

<%= view :signup_button %>

# How to teach one Hour of Code in after-school

## 1) Regjistrohu

  * Regjistrohu për të organizuar një [Orë Kodimi](%= resolve_url('/') %) gjatë <%= campaign_date('short') %>.
  * Promovo [ Orën tuaj të Kodimit ](%= resolve_url('/promote') %) dhe inkurajo të tjerët ta mirëpresin.

## 2) Ndiqni këtë video udhëzuese <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) Zgjidh një tutorial:

Ne do të mirëpresim një llojllojshmëri të [knaqësisë, tutorialeve të gjata](%= resolve_url('https://code.org/learn') %) për pjesëmarrësit e të gjitha moshave, të krijuara nga një llojllojshmëri të partnerëve. *Tutoriale të reja po vinë në Orën e Kodimit përpara <%=campaign_date('full') %>.* [ Provo tutorialin e tanishëm ](%= resolve_url("https://code.org/learn") %)

**Të gjitha tutorialet e Orës së Kodimit:**

  * Kërkojnë një përgatitje kohore minimale për organizatorët
  * Janë vetë-udhëzuese - duke iu lejuar studentëve të punojnë konform ritmit të punës dhe nivelit të shkathtësive që kanë

[![](/images/fit-700/tutorials.png)](%= resolve_url('https://code.org/learn') %)

## 4) Planifikoni nevojat tuaja teknologjike — kompjuterët janë opsional

Eksperienca më e mirë e Orës së Kodimit do të ishte me kompjutera të lidhur në internet por **nuk** është e nevojshme që çdo fëmijë të jetë i pajisur me kompjuter. Madje, mund t'a zhvilloni Orën e Kodimit edhe pa kompjuter.

  * Testoni tutorialet në kompjuter ose pajisje. Sigurohu që ato punojnë në shfletuesët me tingull dhe video.
  * Siguroni kufje, ose kërkoni pjesëmarrësve të sjellin të tyret, nëse tutoriali që ju zgjidhni punon shumë mirë me zë.
  * **Nuk ke pajisje sa duhet?** Përdor [ programimin cift](https://www.youtube.com/watch?v=vgkahOzFH2Q). Kur femijët bashkëpunojnë, ata ndihmojnë njëri-tjetrin dhe mbështeten pak te organizuesi. Ata gjithashtu do ta kuptojnë që shkencat kompjuterike janë sociale dhe bashkëpunuese.
  * **Keni bit-normë të ulët?**Planifiko të projektosh videot në një ekran të madh, kështu që të gjithë nuk do të kenë nevojë të shkarkojnë videot e tyre. Apo provo unplugged/tutorialet pa internet.

![](/images/fit-350/group_ipad.jpg)

## 5) Inspiro pjesëmarrësit për të filluar Orën e Kodimit

Filloje Orën tuaj të Kodimit duke inspiruar pjesëmarrësit dhe duke diskutuar si shkencat kompjuterike kanë ndikim në çdo pjesë të jetës tuaj.

**Trego një video inspiruese:**

  * Video origjinale e lancimit të Code.org, ku paraqiten Bill Gates, Mark Zuckerberg, dhe ylli i NBA Chris Bosh (Ka versione [1 minutëshe](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutëshe](https://www.youtube.com/watch?v=nKIu9yen5nc), dhe [9 minutëshe](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the <% if @country == 'uk' %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [Presidenti i SHBA-së Obama duke i bërë thirrje të gjithë studentëve të mësojnë shkencat kompjuterike](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Gjej më shumë video inspiruese [këtu](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Eshtë në rregull nëse je i ri në shkencat kompjuterike. Këtu janë disa ide se si të prezantosh Orën tënde të Kodimit:**

  * Shpjego mënyrat që teknologjia ndikon në jetët tona, me shembuj në të cilët, vajzat dhe djemtë kujdesen (Fol rreth aplikacioneve dhe teknologjisë që është përdorur të ruaj jetë, ndihmojë njerëz, lidh njerëz etj).
  * Listo gjërat që përdorin kod në jetën e përditëshme.
  * Shiko këshillat për ti bërë vajzat të interesuara në shkenca kompjuterike[këtu](%= resolve_url('https://code.org/girls') %).

**Keni nevojë për më shumë udhëzime?**Shkarko këtë [plan të mësimit](/files/AfterschoolEducatorLessonPlanOutline.docx).

**Dëshiron më shumë ide për të shpjeguar?** Shiko [praktikat më të mira](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) nga mësues me eksperiencë.

## 6) Kod!

**Pjesëmarrje direkte në aktivitet**

  * Shkruaje në tabelë (dërrasë të zezë) linkun e tutorialit. Poshtë numrit të pjesëmarrësve gjeni të listuar linkun e [të dhëna rreth tutorialit të zgjedhur](%= resolve_url('https://code.org/learn') %) nga ju.

**Kur dikush ka vështirsi është në rregull të përgjigjesh:**

  * "Nuk e di. Le ta zgjidhim së bashku."
  * "Teknologjia nuk punon gjithmon ashtu siç duam ne."
  * "Të mësuarit se si të programosh është si të mësosh një gjuhë të re; nuk do të jesh i rrjedhshëm menjëherë"

**Çfarë të bëj nëse dikush përfundon shpejt?**

  * Inkurajo pjesëmarrësit të provojnë një tjetër Orë Kodimi në [<%= resolve_url('code.org/learn') %>](%= resolve_url('https://code.org/learn') %)
  * Apo, pyet këta që përfunduan herët të ndihmojnë të tjerët që po hasin në pengesa.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Festo

  * [Printo certifikatat](%= resolve_url('https://code.org/certificates') %) për studentët e tu.
  * [Printo stikerët "Unë bëra një Orë Kodim!"](%= resolve_url('/promote/resources#stickers') %).
  * [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for your students.
  * Shpërnda fotot dhe videot e Orës tuaj të Kodit në mediat sociale. Përdorimi #HourOfCode dhe @codeorg kështu që ne mund të nxjerrim në pah suksesin tuaj!

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

## Burime të tjera për Orën e Kodimit për mësuesit:

  * Përdor këtë[plan të mësimit shabllon](/files/AfterschoolEducatorLessonPlanOutline.docx)të organizosh Orën tënde të Kodimit.
  * Shiko [praktikat më të mia](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) nga organizatorët e kalur të Orës së Kodimit. 
  * Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
  * [Attend a live Q&A](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) with our founder, Hadi Partovi to prepare for the Hour of Code.
  * Vizito [Forumin e Orës së Kodimit](http://forum.code.org/c/plc/hour-of-code) për të marrë këshilla dhe mbështetje nga organizatrët tjerë. <% if @country == 'us' %>
  * Shiko [PTSH të Orës së Kodimit](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Çfarë vjen pas Orës së Kodimit?

Ora e Kodimit është thjesht hapi i parë i një udhëtimi për të mësuar më shumë se si teknologjia funksionon dhe se si të krijojmë një aplikacion software-ik. To continue this journey: - The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey:

  * Encourage students to continue to [learn online](%= resolve_url('https://code.org/learn/beyond') %).
  * [Attend](%= resolve_url('https://code.org/professional-development-workshops') %) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>