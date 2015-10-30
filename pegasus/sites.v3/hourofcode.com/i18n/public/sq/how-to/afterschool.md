---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# How to teach one Hour of Code in After-school

## 1) Regjistrohu

  * Regjistrohu për të organizuar një [Orë Kodimi](<%= resolve_url('/') %>) gjatë <%= campaign_date('short') %>.
  * Promote your [Hour of Code](<%= resolve_url('/promote') %>) and encourage others to host.

## 2) Ndiqni këtë video udhëzuese <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) Zgjidh një tutorial:

We’ll host a variety of [fun, hour-long tutorials](<%= resolve_url('https://code.org/learn') %>) for participants all ages, created by a variety of partners. *Tutoriale të reja po vinë në Orën e Kodimit përpara <%= campaign_date('full') %>.* [ Provo tutorialin e tanishëm ](<%= resolve_url("https://code.org/learn") %>)

**Të gjitha tutorialet e Orës së Kodimit:**

  * Kërkojnë një përgatitje kohore minimale për organizatorët
  * Janë vetë-udhëzuese - duke iu lejuar studentëve të punojnë konform ritmit të punës dhe nivelit të shkathtësive që kanë

[![](/images/fit-700/tutorials.png)](<%= resolve_url('https://code.org/learn') %>)

## 4) Planifikoni nevojat tuaja teknologjike — kompjuterat janë opsional

Eksperienca më e mirë e Orës së Kodimit do të ishte me kompjutera të lidhur në internet por **nuk** është e nevojshme që çdo fëmijë të jetë i pajisur me kompjuter. Madje, mund t'a zhvilloni Orën e Kodimit edhe pa kompjuter.

  * Testoni tutorialet në kompjuter ose pajisje. Sigurohu që ato punojnë në shfletuesët me tingull dhe video.
  * Siguroni kufje, ose kërkoni pjesëmarrësve të sjellin të tyret, nëse tutoriali që ju zgjidhni punon shumë mirë me zë.
  * **Nuk ke pajisje sa duhet?** Përdor [ programimin cift](https://www.youtube.com/watch?v=vgkahOzFH2Q). Kur femijët bashkëpunojnë, ata ndihmojnë njëri-tjetrin dhe mbështeten pak te organizuesi. Ata gjithashtu do ta kuptojnë që shkencat kompjuterike janë sociale dhe bashkëpunuese.
  * **Have low bandwidth?** Plan to project videos onto a big screen, so everyone isn't downloading their own videos. Or try the unplugged / offline tutorials.

![](/images/fit-350/group_ipad.jpg)

## 5) Inspiro pjesëmarrësit për të filluar Orën e Kodimit

Kick off your Hour of Code by inspiring participants and discussing how computer science impacts every part of our lives.

**Trego një video inspiruese:**

  * Video origjinale e lancimit të Code.org, ku paraqiten Bill Gates, Mark Zuckerberg, dhe ylli i NBA Chris Bosh (Ka versione [1 minutëshe](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutëshe](https://www.youtube.com/watch?v=nKIu9yen5nc), dhe [9 minutëshe](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the <% if @country == 'uk' %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [Presidenti i SHBA-së Obama duke i bërë thirrje të gjithë studentëve të mësojnë shkencat kompjuterike](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Gjej më shumë video inspiruese [këtu](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Eshtë në rregull nëse je i ri në shkencat kompjuterike. Këtu janë disa ide se si të prezantosh Orën tënde të Kodimit:**

  * Explain ways technology impacts our lives, with examples both boys and girls will care about (Talk about apps and technology that is used to save lives, help people, connect people etc).
  * Listo gjërat që përdorin kod në jetën e përditëshme.
  * See tips for getting girls interested in computer science [here](<%= resolve_url('https://code.org/girls') %>).

**Need more guidance?** Download this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx).

**Dëshiron më shumë ide për të shpjeguar?** Shiko [praktikat më të mira](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) nga mësues me eksperiencë.

## 6) Kod!

**Pjesëmarrje direkte në aktivitet**

  * Shkruaje në tabelë (dërrasë të zezë) linkun e tutorialit. Poshtë numrit të pjesëmarrësve gjeni të listuar linkun e [të dhëna rreth tutorialit të zgjedhur](<%= resolve_url('https://code.org/learn') %>) nga ju.

**Kur dikush ka vështirsi është në rregull të përgjigjesh:**

  * "Nuk e di. Le ta zgjidhim së bashku."
  * "Teknologjia nuk punon gjithmon ashtu siç duam ne."
  * "Të mësuarit se si të programosh është si të mësosh një gjuhë të re; nuk do të jesh i rrjedhshëm menjëherë"

**Çfarë të bëj nëse dikush përfundon shpejt?**

  * Encourage participants to try another Hour of Code activity at [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>)
  * Or, ask those who finish early to help others who are having trouble.

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
  * [Print "I did an Hour of Code!"](<%= resolve_url('/promote/resources#stickers') %>) stickers.
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

  * Use this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx) to organize your Hour of Code.
  * Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from past Hour of Code organizers. 
  * Merr pjesë në [Educator's Guide to the Hour of Code webinar](http://www.eventbrite.com/e/an-educators-guide-to-the-hour-of-code-tickets-17987415845).
  * Visit the [Hour of Code Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other organizers. <% if @country == 'us' %>
  * Shiko [PTSH të Orës së Kodimit](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Çfarë vjen pas Orës së Kodimit?

Ora e Kodimit është thjesht hapi i parë i një udhëtimi për të mësuar më shumë se si teknologjia funksionon dhe se si të krijojmë një aplikacion software-ik. Për të vazhduar udhëtimin, [inkurajo fëmijët e tu të mësojnë online](<%= resolve_url('https://code.org/learn/beyond') %>).

<%= view :signup_button %>