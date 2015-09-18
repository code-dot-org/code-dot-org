* * *

title: <%= hoc_s(:title_how_to) %> layout: wide nav: how_to_nav

* * *

<%= view :signup_button %>

# Si të shpjegosh një Orë Kodimi pas shkolle

## 1) Regjistrohu

  * Regjistrohu për të organizuar një [Orë Kodimi](%= resolve_url('/') %) gjatë <%= campaign_date('short') %>.
  * Promovoni [Orën tuaj të Kodimit](%= resolve_url('/resources') %) dhe inkurajoni të tjerët për ta organizuar.

## 2) Ndiqni këtë video udhëzuese <iframe width="500" height="255" src="//www.youtube.com/embed/tQeSke4hIds" frameborder="0" allowfullscreen></iframe>
## 3) Zgjidh një tutorial:

Ne ofrojmë [argëtim, tutoriale 1 orëshe](%= resolve_url('https://code.org/learn') %) për studentët e të gjitha moshave, krijuar nga partnerët tanë. *Tutoriale të reja po vinë në Orën e Kodimit përpara <%= campaign_date('full') %>.* [ Provo tutorialin e tanishëm ](%= resolve_url("https://code.org/learn") %)

**Të gjitha tutorialet e Orës së Kodimit:**

  * Kërkojnë një përgatitje kohore minimale për organizatorët
  * Janë vetë-udhëzuese - duke iu lejuar studentëve të punojnë konform ritmit të punës dhe nivelit të shkathtësive që kanë

[![](/images/fit-700/tutorials.png)](%= resolve_url('https://code.org/learn') %)

## 4) Planifikoni nevojat tuaja teknologjike — kompjuterat janë opsional

Eksperienca më e mirë e Orës së Kodimit do të ishte me kompjutera të lidhur në internet por **nuk** është e nevojshme që çdo fëmijë të jetë i pajisur me kompjuter. Madje, mund t'a zhvilloni Orën e Kodimit edhe pa kompjuter.

  * Testoni tutorialet në kompjuter ose pajisje. Sigurohu që ato punojnë në shfletuesët me tingull dhe video.
  * Siguroni kufje, ose kërkoni pjesëmarrësve të sjellin të tyret, nëse tutoriali që ju zgjidhni punon shumë mirë me zë.
  * **Nuk ke pajisje sa duhet?** Përdor [ programimin cift](https://www.youtube.com/watch?v=vgkahOzFH2Q). Kur femijët bashkëpunojnë, ata ndihmojnë njëri-tjetrin dhe mbështeten pak te organizuesi. Ata gjithashtu do ta kuptojnë që shkencat kompjuterike janë sociale dhe bashkëpunuese.
  * **Keni lidhje të dobët të internetit?** Planifikoni t'i shfaqni videot para klasës, ashtu që të mos i shkarkojë secili student videot e veta ose provoni tutorialet e shkëputura/offline.

![](/images/fit-350/group_ipad.jpg)

## 5) Inspiro pjesëmarrësit për të filluar Orën e Kodimit

**Planifiko Orën tënde të Kodimit duke inspiruar fëmijët dhe diskutoni se si shkenca kompjuterike ka impakt në çdo pjesë të jetës.**

**Trego një video inspiruese:**

  * Video origjinale e lancimit të Code.org, ku paraqiten Bill Gates, Mark Zuckerberg, dhe ylli i NBA Chris Bosh (Ka versione [1 minutëshe](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutëshe](https://www.youtube.com/watch?v=nKIu9yen5nc), dhe [9 minutëshe](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * [Videoja e lançimit të Orës së Kodimit 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw), apo <% if @country == 'uk' %> [Video e Orës së Kodimit 2014](https://www.youtube.com/watch?v=96B5-JGA9EQ) <% else %> [Videoja e Orës së Kodimit 2014](https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q) ♪ <% end %>
  * [Presidenti i SHBA-së Obama duke i bërë thirrje të gjithë studentëve të mësojnë shkencat kompjuterike](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Gjej më shumë video inspiruese [këtu](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Eshtë në rregull nëse je i ri në shkencat kompjuterike. Këtu janë disa ide se si të prezantosh Orën tënde të Kodimit:**

  * Shpjego menyrat se si teknologjia ka inpakt në jetën tonë, me shembujt do merren djemtë si dhe vajzat (Flisni rreth aplikacioneve dhe për teknologjit që përdoren për të shpëtuar jetëm që ndryshojnë botën, bashkojnë njerzit, etj).
  * Listo gjërat që përdorin kod në jetën e përditëshme.
  * Shiko [këtu](<%= resolve_url('https://code.org/girls') %>) mënyra se si ta bësh shkencën kompjuterike interesante te vajzat.

**Dëshiron më shumë ide për të shpjeguar?** Shiko [praktikat më të mira](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) nga mësues me eksperiencë.

## 6) Kod!

**Pjesëmarrje direkte në aktivitet**

  * Shkruaje në tabelë (dërrasë të zezë) linkun e tutorialit. Poshtë numrit të pjesëmarrësve gjeni të listuar linkun e [të dhëna rreth tutorialit të zgjedhur](%= resolve_url('https://code.org/learn') %) nga ju.

**Kur dikush ka vështirsi është në rregull të përgjigjesh:**

  * "Nuk e di. Le ta zgjidhim së bashku."
  * "Teknologjia nuk punon gjithmon ashtu siç duam ne."
  * "Të mësuarit se si të programosh është si të mësosh një gjuhë të re; nuk do të jesh i rrjedhshëm menjëherë"

**Çfarë të bëj nëse dikush përfundon shpejt?**

  * Studentët mund të ndjekin të gjitha tutorialet dhe të provojnë një aktivitet tjetër të Orës së Kodimit te [<%= resolve_url('code.org/learn') %>](%= resolve_url('https://code.org/learn') %)
  * Ose, thuaju atyre që përfunduan shpejt që tv ndihmojnë të tjerët që po hasin probleme me aktivitetin.

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
  * [Printo ngjitëset "Unë bëra Orën e Kodimit!"](%= resolve_url('/resources/promote#stickers') %) për studentët e tu.
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

  * Shikoni [praktikat më të mira](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) nga mësuesit e Orës së Kodimit më përpara. 
  * Merr pjesë në [Educator's Guide to the Hour of Code webinar](http://www.eventbrite.com/e/an-educators-guide-to-the-hour-of-code-tickets-17987415845).
  * Vizito [Forumin e Orës së Kodimit](http://forum.code.org/c/plc/hour-of-code) të gjesh këshilla, mbështetje nga mësues të tjerë. <% if @country == 'us' %>
  * Shiko [PTSH të Orës së Kodimit](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Çfarë vjen pas Orës së Kodimit?

Ora e Kodimit është thjesht hapi i parë i një udhëtimi për të mësuar më shumë se si teknologjia funksionon dhe se si të krijojmë një aplikacion software-ik. Për të vazhduar udhëtimin, [inkurajo fëmijët e tu të mësojnë online](%= resolve_url('https://code.org/learn/beyond') %).

<%= view :signup_button %>