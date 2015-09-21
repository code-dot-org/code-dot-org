* * *

titulli: <%= hoc_s(:title_tutorial_guidelines) %> shtrirje: e gjerë

* * *

<%= view :signup_button %>

# Udhëzime tutoriali për Orën e Kodimit dhe Javës së Arsimimit në Shkencat Kompjuterike

Code.Org do të jetë nikoq i disa aktiviteteve të Orës së Kodimit në Code.org, Orën e Kodimit dhe website-in CSEdWeek. Lista aktuale është në[<%= resolve_url('code.org/learn') %>](%= resolve_url('https://code.org/learn') %).

Do të donim të organizonim një sërë aktivitetesh, por qëllimi kryesor është optimizimi i përvojave të nxënësve dhe mësuesve, të cilët janë të rinj në shkencat kompjuterike. Ju lutem përdorni këtë dokument si udhëzues për zhvillimin e aktivitetit tuaj, që i drejtohet përdoruesve të cilët nuk kanë njohuri në kodim, programim kompjuterik apo në shkencat kompjuterike.

  


**Pasi të lexosh udhëzimet, mund të dorëzosh tutorialin tënd përmes Orës sonë të Kodimit[ faqes sonë të Paraqitjes së Veprimtarisë](http://goo.gl/forms/6GSklaO9Oa).**

** E RE:** Ndryshe nga vitet e shkuara, planifikojmë të paraqesim një tjetër format për "mësues udhëheqës" në Aktivitet e Orës së Kodimit. These will be listed below the self-guided activities in student-facing pages and emails. Details below.

<a id="top"></a>

## Indeksi:

  * [General guidelines for creating an Hour of Code™ activity](#guidelines)
  * [Si vlerësohen tutorialet për tu përfshirë](#inclusion)
  * [How to submit (Due 10/15/2015)](#submit)
  * [Sugjerime për të projektuar aktivitetin tuaj](#design)
  * [Udhëzime mbi markat e regjistruara](#tm)
  * [Pixel-ët përcjellës](#pixel)
  * [Promovimi i tutorialeve tuaj, CSEdWeek dhe Ora e Kodimit](#promote)
  * [Shënim për nxënësit me aftësi të kufizuara](#disabilities)

<a id="guidelines"></a>

## New for 2015: two formats of activites: self-guided or *lesson-plan*

Now that tens of thousands of educators have tried the Hour of Code, many classrooms are ready for more creative, less one-size-fits-all activities that teach the basics of computer science. To help teachers find inspiration, we'd like to collect and curate one-hour "Teacher-Led" lesson and activity plans for Hour of Code veterans. We will continue promoting the "Self-guided" format as well.

**Submit a Teacher-Led Lesson Plan, ideally for different subject areas *(NEW)***: Do you have an engaging or unique idea for an Hour of Code lesson? Some educators may prefer to host Hour of Code activities that follow a traditional lesson format rather than a guided-puzzle/game experience. If facilitated properly, more open-ended activities can better showcase the creative nature of computer science. We would love to collect **one-hour lesson plans designed for different subject areas**. For example, a one-hour lesson plan for teaching code in a geometry class. Or a mad-lib exercise for English class. Or a creative quiz-creation activity for history class. This can help recruit teachers in other subject areas to guide an Hour of Code activity that is unique to their field, while demonstrating how CS can influence and enhance many different subject areas.

You can start with this [empty template](https://docs.google.com/document/d/1zyD4H6qs7K67lUN2lVX0ewd8CgMyknD2N893EKsLWTg/pub) for your lesson plan.

Examples:

  * [Mirror Images (an activity for an art teacher)](https://csedweek.org/csteacher/mirrorimages.pdf)
  * [An arduino activity for a physics teacher](https://csedweek.org/csteacher/arduino.pdf)
  * [A history of technology activity for a history teacher](https://csedweek.org/csteacher/besttechnology.pdf)

[<button>How can I submit my own lesson plan?</button>](#submit)

  
  
**Student-led (Self-Guided) Format**: The original Hour of Code was built mostly on the success of self-guided tutorials or lessons, optionally facilitated by the teacher. There are plenty of existing options, but if you want to create a new one, these activities should be designed so they can be fun for a student working alone, or in a classroom whose teacher has minimal prep or CS background. They should provide directions for students as opposed to an open-ended hour-long challenge. Në mënyrë ideale, udhëzimet dhe mësimet janë të integruar direkte në platformën e programit, për të shmangur ndryshimet në tabe apo dritaret në mes të tutorialit dhe platformës së programimit.

Note: On student-facing pages we'll list teacher-led activities *below* the self-guided ones, but we'll specifically call them out on pages or emails meant for educators.

## Udhëzime të përgjithshme për të krijuar aktivitetin Ora e Kodimit

The goal of an Hour of Code is to give beginners an accessible first taste of computer science or programming (not HTML). The tone should be that:

  * Computer science is not just for geniuses, regardless of age, gender, race. Anybody *can* learn!
  * Computer science is connected to a wide variety of fields and interests. Everybody *should* learn!
  * Inkurajoni studentët të krijojnë diçka që mund ta shpërndajnë me shokët/online.

**Technical requirements**: Because of the wide variety of school and classroom technology setups, the best activities are Web-based or smartphone-friendly, or otherwise unplugged-style activities that teach computer science concepts without the use of a computer (see <http://csunplugged.com/>). Activities that require an app-install, desktop app, or game-console experiences are ok but not ideal.

[**Përsëri në krye**](#top)

<a id="inclusion"></a>

## Si vlerësohen tutorialet për tu përfshirë

Komisioni me instruktor të shkencave kompjuterike do të rendis materialet bazuar në matje sasiore dhe cilësore, duke perfshirë dhe rezutate të vlerësimeve nga instruktorë të tjerë.

**Tutorialet do të listohen më lart nëse janë:**

  * të cilësisë së lartë
  * designed for beginners - among students AND teachers
  * të përcaktuara si aktivitet 1~orësh
  * require no sign up
  * require no payment
  * require no installation
  * operojnë nëpër shumë SO/platforma pajisjesh, përfshirë celularët dhe tabletët
  * funksionojnë në gjuhë të shumta 
  * promote learning by all demographic groups (esp. under-represented groups)
  * jo vetëm tek HTML+CSS web design - (qëllimi është tek shkencat kompjuterike dhe jo thjesht kodimi HTML)

**Tutorialet do të listohen më poshtë nëse janë:**

  * të cilësisë së ulët
  * të nivelit më të përparuar (jo për fillestar)
  * me numër të kufizuar të platformave të OS/pajisjeve të përkrahura - për platformat e bazuara në Ueb duhet të synohet që të kenë IE9+, dhe versionet e fundme të Chrome, Firefox, e Safari
  * funksionojnë vetëm në Anglisht
  * reinforce stereotypes that hinder participation by under-represented student groups
  * paraqiten si platformë mësimi me pagesë

**Tutorialet që NUK listohen fare nëse:**

  * nuk janë të dizajnuara për të qenë aktivitet një-orësh
  * kerkojnë regjistrim 
  * kërkojnë pagesë
  * require installation (other than mobile apps)
  * përqëndrohet vetëm në dizajnin e uebit HTML + CSS
  * dorëzohen pas afatit të dorëzimit, apo me informacion jo të kompletuar (shiko më poshtë)

**If your tutorial is student-led** Student-led tutorials need to be designed to be self-directed, not to require significant CS instruction or prep from teachers

Në fund të fundit, qëllimi i fushtës së Orës Kodimit është për të zgjeruar pjesëmarrjen në shkencat kompjuterike nga ana e nxënësve dhe mësuesve, dhe për të ndihmuar të tregojnë se shkenca kompjuterike është i arritshëm për të gjithë, dhe "më e lehtë se sa mendoni." Në shumë mënyra, ky qëllim është më e mirë të arrihet duke i dhënë nxënësit dhe mësuesit më pak dhe zgjedhje të thjeshta, me një fokus në opsionet e cilësisë më të lartë për një përdorues për herë të parë. Note also that the 2013 and 2014 Hour of Code campaigns were a fantastic success with over 120M served, with nearly unanimous positive survey responses from participating teachers and students. As a result, the existing listings are certainly good and the driving reason to add tutorials to the Hour of Code listings isn't to broaden the choices, but to continue to raise the quality (or freshness) for students, or to expand the options for non-English speakers given the global nature of the 2015 campaign.

[**Përsëri në krye**](#top)

<a id="submit"></a>

## How to submit (Due 10/15/2015)

Visit the [Hour of Code™ Activity Submission page](http://goo.gl/forms/6GSklaO9Oa) and follow the steps to submit your tutorial.

**Çfarë do ju duhet:**

  * Emri juaj, stema (jph, png, etj.)
  * URL për një elrankapje apo imazh marketingu për aktivitetin OrK. Imazhet/fotot duhet të jenë me rezolucion ekzaktësisht 446 x 335. Nëse një imazh i duhur nuk është aprovuar, ne mund të marrim fotot tona të tutorialit tuaj OSE ne mund të zgjedhim mos e listojmë atë.
  * Vjegëza URL e stemës
  * Emri i aktivitetit
  * Vjegëza URL për tek aktiviteti
  * Vjegëza URL për tek shënimet e mësuesve (opsionale, shiko detajet më poshtë)
  * Përshkrimin e aktivitetit (të dyja desktop-pamje dhe mobile-pamje) 
      * **Max karaktereve të llogaritura për pamjen desktop:**384
      * **Max karaktereve të llogaritura për pamjen mobile:**74
      * Ju lutemi të përfshini në përshkrimin nëse kjo është kryesisht udhëzues drejtuar për nxënësit ose lehtësim për mësues. Përveç kësaj, disa shkolla janë të interesuara të dinë nëse aktivitetet e Orës së Kodimit janë të adresuara si një trung i përbashkët ose Gjenerata Tjetër e Standarteve të Shkencës. Nëse aktiviteti i drejtohet standardeve specifike, e konsiderojeni duke e përfshirë edhe këtë informacion.
  * Një listë e platformave të testuara/përshtatshme: 
      * Web based: Which platforms have you tested 
          * OS - Mac, Win, dhe versionet
          * Browser-at - IE8, IE9, IE10, Firefox, Chrome, Safari
          * iOS mobile Safari ( e përshtatur për mobile)
          * Android Chrome (e përshtatur për mobile)
      * Non web-based: specify platform for native code (Mac, Win, iOS, Android, xBox, other)
      * Shkëputur
  * Një listë e gjuhëve të suportueshme dhe formati përshtatshëm: 
      * Tutorialet do të specifikojnë cilat gjuhë ata përkrahin duke përdorur kodin e gjuhës me 2-karaktere, p.sh. en - Anglisht; al - shqip
      * Nëse më shumë specifika janë të nevojshme, përdor vizat lidhëse, p.sh. fr-be-frëngjisht (Belgjikë) ose fr-ca - frëngjisht (Kanada)
      * ***Shënim: Gjuha-zbuluese është punë e aprovuesit të tutorialit, ne do të përcjellim të gjithë përdoruesit në një URL të vetme të aprovuar.*** 
  * Nëse ju dorzoni një tutorial online, ne kemi nevojë të dimë se a [përputhet COPPA ](http://en.wikipedia.org/wiki/Children's_Online_Privacy_Protection_Act) ose jo.
  * Niveli(et) i klasës i rekomanduar për përdoruesit e synuara. Ju mund t'i referoheni [Computer Science Teachers’ Association’s K-12 Standards](http://csta.acm.org/Curriculum/sub/K12Standards.html) për konceptet e klasës së përshtatshme për shkenca kompjuterike. Shembuj të niveleve të klasës përfshijnë: 
      * Shkollat fillore: notat K-2 ose 3-5
      * Shkollat 8-vjeçare: notat 6-8
      * Shkollat e mesme: notat 9-12
      * Të gjithë moshat
  * Ju lutemi gjithashtu përfshini njohuritë e rekomanduara në shkenca kompjuterike brenda nivelit të klasës: fillestar, i ndërmjetëm, ose të avancuar. Website Ora e Kodimit do të nxjerrë më në pah aktivitetet për fillestarët. If you’d like to prepare Intermediate and Advanced Hour of Code™ Activities, please include the prior knowledge needed in the description of your activity.
  * Kërkesat teknike: 
      * Në mënyrë për të gjetur më shumë pjesmarrës me saktësi ne duam që cdo palë e tretë e partnerve të përfshijë 1-pixel të shoqëruar me foto në faqen e parë dhe të fundit të tutorialeve të tyre të Orës së Kodimit. Vendos një pixel-foto fillestare në faqen e parë dhe një pixel-foto finale në faqen e fundit. Mos vendos pixel-a në faqet e përkohshme). Shih seksionin Tracking Pixel më poshtë për më shumë detaje. 
      * Me të përfunduar aktivitetin tuaj, përdoruesit duhet të drejtohen për [<%= resolve_url('code.org/api/hour/finish') %>](%= resolve_url('https://code.org/api/hour/finish') %) where they will be able to: 
          * Të shpërndajnë në mediat sociale që kanë përfunduar Orën e Kodimit
          * Merrni një çertifikatë që keni përfunduar Orën e Kodimit
          * Shih bordet udhëheqëse se cilat nga vendet/qytetet kanë normat më të larta të pjesëmarrjes në aktivitetet e Orës së Kodimit
          * For users who spend an hour on your activity and don’t complete it, please include a button on your activity that says “I’m finished with my Hour of Code” which links back to [<%= resolve_url('code.org/api/hour/finish') %>](%= resolve_url('https://code.org/api/hour/finish') %) as well. 
  * *(Opsionale)* We will follow-up with an online survey/form link asking for a report of the following activity metrics for the week of Dec. 7, 12:01 am through Dec. 13, 11:59 pm) 
      * Për aktivitetet online (kryesisht smartphone/tablet app): 
          * Numrin e përdoruesve
          * Sa kanë përfunduar punën
          * Koha mesatare e detyrës
          * Numri total i rreshtave të kodit të shkruara nga të gjithë përdoruesit
          * Sa vazhdojnë rrugën për të mësuar më tej (e matur si çdo përdorues i cili përfundon detyrën dhe shkon në detyra shtesë në faqen tuaj)
      * Për aktivitetet jashtë linjës 
          * Numri i shkarkimeve të versionit letër të aktiviteteve (nëse aplikohen)

[**Përsëri në krye**](#top)

<a id="design"></a>

## Sugjerime për të projektuar aktivitetin tuaj

You can include either the CSEdWeek logo ([small](https://www.dropbox.com/s/ojlltuegr7ruvx1/csedweek-logo-final-small.jpg) or [big](https://www.dropbox.com/s/yolheibpxapzpp1/csedweek-logo-final-big.png)) or the [Hour of Code logo](https://www.dropbox.com/work/Marketing/HOC2014/Logos%202014/HOC%20Logos) in your tutorial, but this is not required. If you use the Hour of Code logo, see the trademark guidelines below. Në asnjë rrethanë nuk mund të përdoret stema e Code.org dhe emri. Both are trademarked, and can’t be co-mingled with a 3rd party brand name without express written permission.

**Sigurohuni që studenti mesatar mund të përfundojë i qetë në një orë. **Konsideroni duke shtuar një aktivitet të pakufizuar në fund për studentët të cilët ecin më shpejt në mësime. Mos harroni se shumica e fëmijëve do të jenë fillestar absolut në shkenca kompjuterike dhe kodim.

**Përfshini shënimet e mësuesve.**Shumica e aktiviteteve duhet të jenë të drejtuar për nxënës, por në qoftë se një aktivitet është lehtësuar ose menaxhohet nga një mësues, ju lutem të përfshijë udhëzime të qarta dhe të thjeshta për mësuesit në formën e shënimeve të mësuesve në një URL të veçantë dorëzuar me aktivitetin tuaj. Jo vetëm studentët janë fillestar, disa prej mësuesve janë gjithashtu. Përfshi informacion si:

  * Tutorialet tonë punojnë më mirë në platformat dhe shfletuesit e mëposhtme
  * Does it work on smartphones? Tablets?
  * A ju rekomandojmë programimin çift? 
  * Considerations for use in a classroom? E.g. if there are videos, advise teachers to show the videos on a projected screen for the entire classroom to view together

**Inkorporoni reagime në fund të aktivitetit** (p.sh: "Ju përfunduat 10 nivele dhe mësuat për ciklet! Punë e shkëlqyer!")

**Encourage students to post to social media (where appropriate) when they've finished.** For example “I’ve done an Hour of Code with ________ Have you? #HourOfCode" ose Unë kam bërë një #HourOfCode si pjesë e #CSEdWeek. A keni ju? @Scratch." Përdor hashtag-un**#HourOfCode**(me shkronja kapitale O, C)

**Create your activity in Spanish or in other languages besides English.** ]

**Shpjegoni ose lidheni aktivitetin në një kontekst të rëndësishme shoqërore.** Programimi kompjuterik bëhet një superfuqi kur studentët shohin se si ajo mund të ndryshojë botën për më mirë!

**Nuk kërkojmë regjistrim ose pagesë para se studentët mund të provojnë tutorialet tuajs.** Tutorialet që kërkojnë regjistrim ose pagesa nuk do të listohen

**Make sure your tutorial can be used in a [Pair Programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning) paradigm.** The three rules of pair programming in a school setting are:

  * Drejtuesi kontrollon mouse-in dhe tastierën.
  * Udhëheqësi bën sugjerime, vë në dukje gabimet, dhe bën pyetje. 
  * Studentët duhet të ndryshojnë rolet të paktën dy herë në seancë.

Përfitimet e programimit në çift:

  * Studentët mund të ndihmojnë njëri-tjetrin në vend se duke u mbështetur tek mësuesit
  * Trego se kodimi nuk është një aktivitet i vetëm, por një që përfshin ndërveprimin social
  * Jo të gjitha klasat ose laboratorët kanë kompjutera të mjaftueshme për një përvojë 1:1

[**Përsëri në krye**](#top)

<a id="tm"></a>

## Udhëzime mbi markat e regjistruara

After the success of the 2013 campaign, we took steps to make sure we set up the Hour of Code as a movement that can repeat annually with greater fidelity and without confusion.

Një pjesë e kësaj është për të mbrojtur markën "Ora e Kodimit" për të parandaluar konfuzionin. Shumë nga partnerët tanë kanë përdorur "Orën e Kodimit" në faqet e tyre të web-it. Ne nuk duam të parandalojmë këtë përdorim, por ne duam të sigurohemi se përshtatet brenda disa kufijve:

  1. Çdo referencë për "Orën e Kodimit" duhet të përdoret në një mënyrë që nuk sugjeron që është emri i markës suaj, por më tepër referenca për Orën e Kodimit si një lëvizje bazë. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Shembull i keq: "Provo Orën e Kodimit nga ACME Corp"
  2. Përdorni një "TM" sipërshkrim në vendet më të dukshme që ju përmendni "Orën e Kodimit", në faqen tuaj web dhe në përshkrimet e aplikacionit
  3. Përfshini gjuhën në faqe (ose në fund), duke përfshirë edhe lidhjet me faqet e web-it të CSEdWeek dhe Code.org, që thonë si në vijim:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. Nuk ka përdorimi të "Orës së Kodimit" në emrat e aplikacioneve

[**Përsëri në krye**](#top)

<a id="pixel"></a>

## Pixel-ët përcjellës

Në mënyrë për të gjetur më saktësisht pjesëmarrjen ne i kërkojmë çdo partneri të tutorialeve të palëve të treta për të përfshirë imazhet 1-pixel në faqen e parë dhe të fundit të tutorialeve të Orës së tyre të Kodimit (Një pixel-imazh në faqen fillestare dhe një pixel-imazhi përfundimtar në faqen e fundit. Dhe jo në faqet e përkohshme).

Kjo do të na lejojë ne për të numëruar përdoruesit që ju rekrutuat për të vizituar faqen tuaj të uebit për të bërë Orën e tyre të Kodimit, ose përdoruesit të cilët vizituan kur një mësues shkruajti URL-në tuaj në tabelë. Kjo do të çojë në pjesmarrje më të saktë për tutorialet tuaja, e cila do t'ju ndihmojë për të tërhequr përdoruesit. Nëse ju integroni pixel në fund ai do të na lejojë ne për të matur vlersimet për tutorialet.

Nëse tutoriali juaj është aprovuar dhe është përfshirë në faqen e fundit të tutorialit, Code.org do t'ju ofrojë një pixel unik ndjekjeje për ju që ta integroni në tutorialin tuaj. Shiko shembullin më poshtë.

SHËNIM: kjo nuk është e rëndësishme për tu bërë për aplikacionet e instaluara (aplikacionet iOS/ Android, ose aplikacionet e instaluara desktop)

Shembulli i pixel-ave për AppInventor:

IMG SRC = <http://code.org/api/hour/begin_appinventor.png>   
IMG SRC = <http://code.org/api/hour/finish_appinventor.png>

[**Përsëri në krye**](#top)

<a id="promote"></a>

## Promovimi i tutorialeve tuaj, CSEdWeek dhe Ora e Kodimit

Ne po kërkojmë nga të gjithë për të promovuar 1-orë tutorial tek përdoruesit tuaj. Please direct them to ***your*** Hour of Code page. Përdoruesit tuaj me më shumë mundësi mund të reagojnë nga një email nga ju për tutorialin tuaj. Përdorni fushatën ndërkombëtare të Orës së Kodimit për Javën Edukative të Shkencave Kompjuterike si një justifikim për të inkurajuar përdoruesit për të ftuar të tjerët të bashkohen, të na ndihmojë të arrijmë 100 milionë pjesëmarrës në total.

  * Feature Hour of Code and CSEdWeek on your website. Ex: <http://www.tynker.com/hour-of-code>
  * Promovo Orën e Kodimit duke përdorur rrjetet sociale, median tradicionale, listën e email-eve, etj, duke përdorur hashtag-un**#HourOfCode**(me shkronja të mëdha O, C)
  * Organizo një ngjarje lokale apo pyesni punonjësit tuaj për të organizuar një event në shkollat lokale apo grupet e komunitetit.
  * Shiko mjetet burimore tona për informacione të mëtejshme (së shpejti).

[**Përsëri në krye**](#top)

<a id="disabilities"></a>

## Një shënim i veçantë për nxënësit me aftësi të kufizuara

Nëse keni krijuar një tutorial që është projektuar për vizionin-e dobët, ne do të duam ta nxjerrim në pah atë për shikuesit. Ne nuk kemi marrë ende një tutorial të tillë, dhe do të jemi të paduruar për të përfshirë një të tillë si një opsion për këta studentë.

[**Përsëri në krye**](#top)

<%= view :signup_button %>