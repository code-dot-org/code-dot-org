---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

# Si të shpjegosh një Orë të Kodimit

## 1) Regjistrohu

  * Regjistrohu për të organizuar një [Orë Kodimi](<%= resolve_url('/') %>) gjatë <%= campaign_date('short') %>.
  * Promovo [ Orën tuaj të Kodimit ](<%= resolve_url('/promote') %>) dhe inkurajo të tjerët ta mirëpresin.

## 2) Ndiqni këtë video udhëzuese <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) Zgjidh një tutorial:

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('https://code.org/learn') %>) for students of all ages, created by a variety of partners. *New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.*

**[Student-guided Hour of Code tutorials:](<%= resolve_url("https://code.org/learn") %>)**

  * Kërkojnë kohë minimale përgatitjeje për mësimdhënësit
  * Janë vetë-udhëzuese - duke iu lejuar studentëve të punojnë konform ritmit të punës dhe nivelit të shkathtësive që kanë

**[Teacher-guided Hour of Code tutorials:](<%= resolve_url("https://code.org/educate/teacher-led") %>)**

  * Are lesson plans that require some advance teacher preparation
  * Are categorized by grade level *and* by subject area (eg Math, English, etc)

[![](/images/fit-700/tutorials.png)](<%= resolve_url('https://code.org/learn') %>)

## 4) Planifikoni nevojat tuaja teknologjike — kompjuterat janë opsional

Eksperienca më e mirë e Orës së Kodimit do të ishte me kompjutera të lidhur në internet por **nuk** është e nevojshme që çdo fëmijë të jetë i pajisur me kompjuter. Madje, mund t'a zhvilloni Orën e Kodimit edhe pa kompjuter.

  * Testoni tutorialet në kompjuter ose pajisje. Sigurohu që ato punojnë në shfletuesët me tingull dhe video.
  * Në rast se tutoriali juaj funksionon më mirë me zë Vini në dizpozicion kufje për klasën tuaj, ose kërkoni nga studentët t'i kenë me vete kufjet e tyre.
  * **Nuk ke pajisje sa duhet?** Përdor [ programimin cift](https://www.youtube.com/watch?v=vgkahOzFH2Q). Kur studentët bëhen partnerë, ata i ndihmojnë njëri tjetrit dhe mbështeten më pak te mësimdhënësi. Ata gjithashtu do ta kuptojnë që shkencat kompjuterike janë sociale dhe bashkëpunuese.
  * **Keni lidhje të dobët të internetit?** Planifikoni t'i shfaqni videot para klasës, ashtu që të mos i shkarkojë secili student videot e veta ose provoni tutorialet e shkëputura/offline.

![](/images/fit-350/group_ipad.jpg)

## 5) Inspironi studentet të nisin Orën e Kodimit

**Invite a [local volunteer](https://code.org/volunteer/local) to inspire your students by talking about the breadth of possibilities with computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code. [Use this map](https://code.org/volunteer/local) to find local volunteers who can visit your classroom or join a video chat with your students.

[![](/images/fit-300/volunteer-map.png)](<%= resolve_url('https://code.org/volunteer/local') %>)

**Trego një video inspiruese:**

  * Video origjinale e lancimit të Code.org, ku paraqiten Bill Gates, Mark Zuckerberg, dhe ylli i NBA Chris Bosh (Ka versione [1 minutëshe](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutëshe](https://www.youtube.com/watch?v=nKIu9yen5nc), dhe [9 minutëshe](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the <% if @country == 'uk' %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [Presidenti i SHBA-së Obama duke i bërë thirrje të gjithë studentëve të mësojnë shkencat kompjuterike](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Gjej më shumë video inspiruese [këtu](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Është në rregull nëse ti dhe studentët e tu jeni të rinj në shkencën kompjuterike. Këtu janë disa ide për të njohur me Orën e Kodimit:**

  * Shpjego mënyrat se si teknologjia ka inpakt në jetën tonë, me shembujt do merren djemtë si dhe vajzat (Flisni rreth aplikacioneve dhe për teknologjitë që përdoren për të shpëtuar jetën, që ndryshojnë botën, bashkojnë njerzit, etj).
  * Si klasë, listoni gjëra që përdorin kod në jetë e përditshme.
  * Shiko këshillat për të shtuar interesimin e vajzave në Shkenca Kompjuterike [këtu](<%= resolve_url('https://code.org/girls') %>).

** Keni nevojë për udhëzues?** Shkarko këtë [plan të mësimit shabllon](/files/EducatorHourofCodeLessonPlanOutline.docx).

**Dëshiron më shumë ide për të shpjeguar?** Shiko [praktikat më të mira](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) nga mësues me eksperiencë.

## 6) Kod!

**Drejtoi studentët për te aktiviteti**

  * Shkruaje në tabelë (dërrasë të zezë) linkun e tutorialit. Poshtë numrit të pjesëmarrësve gjeni të listuar linkun e [të dhëna rreth tutorialit të zgjedhur](<%= resolve_url('https://code.org/learn') %>) nga ju.

**Kur studentët e tu kanë vështirësi është normale që të përgjigjen:**

  * "Nuk e di. Le ta zgjidhim së bashku."
  * "Teknologjia nuk punon gjithmon ashtu siç duam ne."
  * "Të mësuarit se si të programosh është si të mësosh një gjuhë të re; nuk do të jesh i rrjedhshëm menjëherë"

**[Check out these teaching tips](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**Çfarë të bëni kur një student përfundon më herët?**

  * Studentët mund të ndjekin të gjitha tutorialet dhe të provojnë një aktivitet tjetër të Orës së Kodimit te [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>)
  * Ose, kërkoni nga studentët që mbarojnë më herët të ndihmojnë shokët e klasës që hasin vështirësi me punën.

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

  * [Printo certifikatat](<%= resolve_url('https://code.org/certificates') %>) për studentët e tu.
  * [Printo "Unë bëra një Orë Kodim!"](<%= resolve_url('/promote/resources#stickers') %>) stikerët për studentët e tu.
  * [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for your school.
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

  * Përdor këtë [plan të mësimit shabllon](/files/EducatorHourofCodeLessonPlanOutline.docx) të organizosh Orën tuaj të Kodimit.
  * Shikoni [praktikat më të mira](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) nga mësuesit e Orës së Kodimit më përpara. 
  * Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
  * [Attend a live Q&A](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) with our founder, Hadi Partovi to prepare for the Hour of Code.
  * Vizito [Forumin e Orës së Kodimit](http://forum.code.org/c/plc/hour-of-code) të gjesh këshilla, mbështetje nga mësues të tjerë. <% if @country == 'us' %>
  * Shiko [PTSH të Orës së Kodimit](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Çfarë vjen pas Orës së Kodimit?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey:

  * Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [Attend](<%= resolve_url('https://code.org/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>