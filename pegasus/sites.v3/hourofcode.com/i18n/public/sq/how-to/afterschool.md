---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---

<%= view :signup_button %>

# Si të shpjegosh një Orë Kodimi pas shkolle

## 1) Ndiqni këtë video udhëzuese <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 2) Zgjidh një tutorial:

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('/learn') %>) for participants all ages, created by a variety of partners. [Try them out!](<%= resolve_url('/learn') %>)

**Të gjitha tutorialet e Orës së Kodimit:**

  * Kërkojnë kohë minimale përgatitjeje për mësimdhënësit
  * Janë vetë-udhëzuese - duke iu lejuar studentëve të punojnë konform ritmit të punës dhe nivelit të shkathtësive që kanë

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

**Ju nevojitet një plan mësimor për orën e kodimit pas mësimi ?** Shikoni këtë [shembull](/files/AfterschoolEducatorLessonPlanOutline.docx) !

## 3) Promovo Orën tënde të Kodimit

Promovo Orën tënde të Kodimit [me këto mjete](<%= resolve_url('/promote') %>) dhe inkurajoni të tjerët të krijojnë eventet e tyre.

## 4) Planifikoni nevojat tuaja teknologjike — kompjuterët janë opsional

Përvoja më e mirë e Orës së Kodimit përfshin kompjutera të lidhur me Internet. Por ju **nuk** keni nevojë për një kompjuter për çdo pjesmarrës, madje ju mund të realizoni Orën e Kodimit edhe pa asnjë kompjuter.

**Planifikoni përpara!** Realizoni pikat e mëposhtme përpara se të nisni një event: 

  * Testoni tutorialet në kompjuter ose pajisje e pjesmarrësve. Sigurohu që ato punojnë në shfletuesët me tingull dhe video.
  * Në rast se tutoriali juaj funksionon më mirë me zë, vini në dizpozicion kufje për klasën tuaj, ose kërkoni nga studentët t'i kenë me vete kufjet e tyre.
  * **Nuk ke pajisje sa duhet?** Përdor [ programimin në çift](https://www.youtube.com/watch?v=vgkahOzFH2Q). Kur pjesëmarrësit bashkëpunojnë, ata ndihmojnë njëri-tjetrin dhe mbështeten më pak tek mësuesi. Ata gjithashtu do ta kuptojnë që shkencat kompjuterike janë sociale dhe bashkëpunuese.
  * **Keni lidhje të dobët të internetit?** Planifikoni t'i shfaqni videot para klasës, në mënyrë që të mos i shkarkojë secili student videot e veta ose provoni tutorialet e shkëputura/offline.

![](/images/fit-350/group_ipad.jpg)

## 5) Filloni Orën tuaj të Kodimit me një video frymëzuese

Filloje Orën tuaj të Kodimit duke frymëzuar pjesëmarrësit dhe duke diskutuar si shkencat kompjuterike kanë ndikim në çdo pjesë të jetës tuaj.

**Trego një video frymëzuese:**

  * Video origjinale e lancimit të Code.org, ku paraqiten Bill Gates, Mark Zuckerberg, dhe ylli i NBA Chris Bosh (Ka versione [1 minutëshe](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutëshe](https://www.youtube.com/watch?v=nKIu9yen5nc), dhe [9 minutëshe](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * [Videoja e lançimit të Orës së Kodimit 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw), apo <% if @country == 'uk' %>[Video e Orës së Kodimit 2015](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %>[ Videoja e Orës së Kodimit 2015](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [Presidenti i SHBA-së Obama u bën thirrje të gjithë studentëve të mësojnë shkencat kompjuterike](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Gjej më shumë video frymëzuese [këtu](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Nuk ka problem në qoftë se jeni të rinj në fushën e shkencave kompjuterike. Këtu janë disa ide se si mund të prezantoni aktivitetin tuaj të Orës së Kodimit:**

  * Shpjego mënyrat se si teknologjia ndikon në jetët tona, me shembuj në të cilët, vajzat dhe djemtë interesohen (Fol rreth aplikacioneve dhe teknologjisë që është përdorur të shpëtuar jetë, ndihmuar njerëz, lidhur njerëz etj).
  * Listo gjërat që përdorin kodim në jetën e përditëshme.
  * Shiko këshillat për të shtuar interesimin e vajzave në Shkenca Kompjuterike [këtu](<%= resolve_url('https://code.org/girls') %>).

**Keni nevojë për më shumë udhëzime?** Shkarko këtë [plan të mësimit](/files/AfterschoolEducatorLessonPlanOutline.docx).

**Dëshiron më shumë ide për të shpjeguar?** Shiko [praktikat më të mira](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) nga mësues me eksperiencë.

## 6) Kod!

**Pjesëmarrje direkte në aktivitet**

  * Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn') %>) under the number of participants.

**Kur pjesëmarrësit hasin në vështirësi është normale tu përgjigjesh:**

  * "Nuk e di. Le ta zgjidhim së bashku."
  * "Teknologjia nuk punon gjithmon ashtu siç duam ne."
  * "Të mësuarit se si të programosh është si të mësosh një gjuhë të re; nuk do të jesh i rrjedhshëm menjëherë"

**Çfarë të bëj nëse dikush përfundon shpejt?**

  * Encourage participants to try another Hour of Code activity at [hourofcode.com/learn](<%= resolve_url('/learn') %>)
  * Ose, kërkoju atyre që përfunduan herët të ndihmojnë të tjerët që po hasin në pengesa.

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

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * [Printo certifikatat](<%= resolve_url('https://code.org/certificates') %>) për studentët e tu.
  * [Printo "Unë bëra një Orë Kodim!"](<%= resolve_url('/promote/resources#stickers') %>) afishe për studentët e tu.
  * [Porosit bluza ](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more)për shkollën tënde.
  * Shpërndaj fotot dhe videot e Orës tënde të Kodimit në mediat sociale. Përdorni #HourOfCode dhe @codeorg kështu që ne mund të nxjerrim në pah suksesin tuaj!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Burime të tjera për Orën e Kodimit për mësuesit:

  * Shikoni [praktikat më të mira](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) nga mësuesit e Orës së Kodimit më përpara. 
  * Shikoni rregjistrimin e [Guidës tonë të edukimit për Orën e kodimit](https://youtu.be/EJeMeSW2-Mw).
  * [Ndiqni live Q&A](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) me themeluesin tonë Hadi Partovi, për tu përgatitur për Orën e Kodimit. 
  * Vizitoni [Forumin e orës së Kodimit](http://forum.code.org/c/plc/hour-of-code) për të marrë këshilla,njohuri dhe mbështetje nga organizatorët e tjerë. <% if @country == 'us' %>
  * Shiko [FAQ e Orës së Kodimit](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Çfarë vjen pas Orës së Kodimit?

Ora e Kodimit është thjesht hapi i parë i një udhëtimi për të mësuar më shumë se si teknologjia funksionon dhe se si të krijojmë një aplikacion software-ik. Për të vazhduar këtë udhëtim:

  * Inkurajo studentët të vazhdojnë të [mësojnë online](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [Ndiq](<%= resolve_url('https://code.org/professional-development-workshops') %>) një seminar 1-ditor për të marrë më shumë informacion nga një udhëzues me eksperience në shkenca kompjuterike (Vetëm udhëzues britanik)

<%= view :signup_button %>