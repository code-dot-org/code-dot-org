* * *

title: <%= hoc_s(:title_tutorial_guidelines) %> layout: wide

* * *

# Guidelines for øvelser til Hour of Code™ og Computer Science Education Week

Code.org er vært for en række forskellige Hour of Code aktiviteter på Code.org, Hour of Code og CSEdWeek hjemmesiderne. Den nuværende liste kan ses på [<%= resolve_url('code.org/learn') %>](%= resolve_url('https://code.org/learn') %).

Vi vil gerne tilbyde en masse motiverende muligheder, men det primære mål er at optimere oplevelsen for elever og lærere som er helt nye indenfor programmering. Brug venligst dette dokument som retningslinjer for udvikling af aktiviteter, som er målrettet brugere helt uden baggrund indenfor programmering og datalogi.

  


**Efter at have læst retningslinjerne, kan du indsende din øvelse gennem vores [Hour of Code ™-aktivitet indsendelsesside](https://goo.gl/kNrV3l).**

**NYT:** I modsætning til tidligere år planlægger vi at indføre et nyt format for "lærer-styrede" Hour of Code aktiviteter. Disse vil kunne findes under de selvguidede øvelser på elevrettede sider og e-mails. Se detaljer nedenfor.

<a id="top"></a>

## Indhold:

  * [Generelle retningslinjer for Hour of Code øvelser](#guidelines)
  * [Sådan evalueres øvelser med henblik på optagelse](#inclusion)
  * [Sådan indsender du (inden 15. oktober 2015)](#submit)
  * [Forslag til hvordan du kan designe din aktivitet](#design)
  * [Retningslinjer for varemærker](#tm)
  * [Sporings Pixel](#pixel)
  * [Promoting af dine tutorials, CSEdWeek og Hour of Code](#promote)
  * [En note til elever med handicap](#disabilities)

<a id="guidelines"></a>

## New for 2015: two formats of activities: self-guided or *lesson-plan*

Nu hvor titusinder af undervisere har prøvet Hour of Code, er mange klasser klar til at blive endnu mere kreative, end de selvguidede one-size-fits-all øvelser, hvor man lærer det grundlæggende. For at hjælpe lærere med at finde inspiration, vil vi gerne samle og kuratere en-times "lærer-styrede" aktiviteter til Hour of Code-vetaraner. We will continue promoting the "Self-guided" format as well.

**Submit a Teacher-Led Lesson Plan, ideally for different subject areas *(NEW)***: Do you have an engaging or unique idea for an Hour of Code lesson? Some educators may prefer to host Hour of Code activities that follow a traditional lesson format rather than a guided-puzzle/game experience. If facilitated properly, more open-ended activities can better showcase the creative nature of computer science. We would love to collect **one-hour lesson plans designed for different subject areas**. For example, a one-hour lesson plan for teaching code in a geometry class. Or a mad-lib exercise for English class. Or a creative quiz-creation activity for history class. This can help recruit teachers in other subject areas to guide an Hour of Code activity that is unique to their field, while demonstrating how CS can influence and enhance many different subject areas.

You can start with this [empty template](https://docs.google.com/document/d/1zyD4H6qs7K67lUN2lVX0ewd8CgMyknD2N893EKsLWTg/pub) for your lesson plan.

Examples:

  * [Mirror Images (an activity for an art teacher)](https://csedweek.org/csteacher/mirrorimages.pdf)
  * [An arduino activity for a physics teacher](https://csedweek.org/csteacher/arduino.pdf)
  * [A history of technology activity for a history teacher](https://csedweek.org/csteacher/besttechnology.pdf)

[<button>How can I submit my own lesson plan?</button>](#submit)

  
  
**Student-led (Self-Guided) Format**: The original Hour of Code was built mostly on the success of self-guided tutorials or lessons, optionally facilitated by the teacher. There are plenty of existing options, but if you want to create a new one, these activities should be designed so they can be fun for a student working alone, or in a classroom whose teacher has minimal prep or CS background. They should provide directions for students as opposed to an open-ended hour-long challenge. Ideelt set så skal vejledninger og tutorials være integreret direkte i programmerings platformen,for at undgå at skifte faner eller vinduer mellem tutorial´en og programmeringsplatformen.

Note: On student-facing pages we'll list teacher-led activities *below* the self-guided ones, but we'll specifically call them out on pages or emails meant for educators.

## Generelle retningslinjer for Hour of Code aktiviteter

The goal of an Hour of Code is to give beginners an accessible first taste of computer science or programming (not HTML). The tone should be that:

  * Computer science is not just for geniuses, regardless of age, gender, race. Anybody *can* learn!
  * Computer science is connected to a wide variety of fields and interests. Everybody *should* learn!
  * Tilskynd eleverne til at skabe noget der kan deles med venner/online.

**Technical requirements**: Because of the wide variety of school and classroom technology setups, the best activities are Web-based or smartphone-friendly, or otherwise unplugged-style activities that teach computer science concepts without the use of a computer (see <http://csunplugged.com/>). Activities that require an app-install, desktop app, or game-console experiences are ok but not ideal.

[**Tilbage til toppen**](#top)

<a id="inclusion"></a>

## Sådan evalueres øvelser med henblik på optagelse

Et udvalg af computer science lærere vil vurdere de indsendte forslag baseret på kvalitative og kvantitative målinger, herunder undersøgelsesresultater fra et bredere team af lærere.

**Tutorials vil blive vurderet højere hvis de er:**

  * af høj kvalitet
  * designed for beginners - among students AND teachers
  * udformet som en 1 times aktivitet
  * require no sign up
  * require no payment
  * require no installation
  * kan bruges på tværs af platforme, herunder mobil, tablet og pc'er
  * bruge på flere sprog
  * promote learning by all demographic groups (esp. under-represented groups)
  * ikke rent HTML + CSS web design fokus - (vores mål er programmering, ikke kun HTML-kodning)

**Tutorials vil blive vurderet lavere hvis de er:**

  * af lavere kvalitet
  * på et mere avanceret niveau (ikke for begyndere)
  * kun understøtter et begrænset antal OS/device platforme - for Web-baserede platforme bør du sigte mod at kunne understøtte alle de følgende: IE9 +, og den nyeste version af Chrome, Firefox og Safari
  * kun kan bruges på engelsk
  * reinforce stereotypes that hinder participation by under-represented student groups
  * tjene som et link til en læringsplatform der kræver betaling

**Tutorials vil ikke blive vist hvis de:**

  * er ikke designet til at være en (nogenlunde) 1-times aktivitet
  * kræver login 
  * kræver betaling
  * require installation (other than mobile apps)
  * kun fokuserer på HTML og CSS webdesign
  * indsendes efter afsendelsesdeadline, eller med ufuldstændige oplysninger (se nedenfor)

**If your tutorial is student-led** Student-led tutorials need to be designed to be self-directed, not to require significant CS instruction or prep from teachers

I sidste ende er målet med Hour of Code kampagnen er at udbrede deltagelsen i kodning for elever og lærere, og hjælpe med at vise, at programmering er tilgængelig for alle, og "lettere end du tror." På mange måder kan dette mål bedst opnås ved at give elever og lærere færre og enklere valg, med fokus på de bedste kvalitetsoplevelser for en førstegangs bruger. Note also that the 2013 and 2014 Hour of Code campaigns were a fantastic success with over 120M served, with nearly unanimous positive survey responses from participating teachers and students. As a result, the existing listings are certainly good and the driving reason to add tutorials to the Hour of Code listings isn't to broaden the choices, but to continue to raise the quality (or freshness) for students, or to expand the options for non-English speakers given the global nature of the 2015 campaign.

[**Tilbage til toppen**](#top)

<a id="submit"></a>

## Sådan indsender du (inden 15. oktober 2015)

Visit the [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l) and follow the steps to submit your tutorial.

**Hvad du skal bruge:**

  * Dit navn, logo (jpg, png, osv.)
  * URL-adressen til et screenshot eller markedsføringsbillede af HoC aktiviteten. Billeder/screenshots skal være i 446 x 335 opløsning. Hvis et passende billede er ikke medsendt, kan vi tage vores eget screenshot af din tutorial eller vi kan vælge ikke at vise det.
  * URL link til logoet
  * Navnet på aktiviteten
  * URL-Link til aktiviteten
  * URL-Link til lærernoter (valgfri, se detaljer nedenfor)
  * Beskrivelse af aktiviteten (både desktop-visning og mobiltelefon-view) 
      * **Max character for desktop-visning:** 384
      * **Max character for mobiltelefon-Se:** 74
      * Vedlæg i beskrivelsen om det hovedsagligt er elev-styret eller lærer-styret. Derudover er nogle skoler interesseret i at vide om Hour of Code aktiviteten vedrører Common Core eller Next Generation Science Standards. Hvis aktiviteten omhandler specifikke standarder, overvej at medtage dette i informationen.
  * En liste over testede/kompatible platforme: 
      * Web based: Which platforms have you tested 
          * OS - Mac og Win versioner
          * Browsere - IE8, IE9, IE10, Firefox, Chrome, Safari
          * iOS mobile Safari (mobil-optimerede)
          * Android Chrome (mobil-optimerede)
      * Non web-based: specify platform for native code (Mac, Win, iOS, Android, xBox, other)
      * Unplugged
  * En liste over understøttede sprog og passende formater: 
      * Tutorials skal angive hvilket sprog de støtter ved hjælp af 2-karakter sprogkoder, f.eks. en - engelsk; Ja - japansk
      * Hvis nærmere specificering er nødvendig, brug bindestreger, f.eks fr-be - fransk (Belgien) eller fr-ca - fransk (Canada)
      * ***Bemærk: Registrering af sprog er en opgave for udbyderen af tutorials, vi vil omdirigere alle brugere til den enkelte webadresse der er angivet.*** 
  * Hvis du indsender en online tutorial, har vi brug for at vide, om den er [COPPA kompatibel](http://en.wikipedia.org/wiki/Children's_Online_Privacy_Protection_Act) eller ej.
  * Anbefalet klassetrin for de tiltænkte elever. Du kan henvise til den [Computer Science Teachers' Association's K-12 standarder](http://csta.acm.org/Curriculum/sub/K12Standards.html) for passende programmeringsbegreber. Eksempler på klassetrin omfatter: 
      * Indskolingen og mellemtrinet: 0. - 6. klasse
      * Udskolingen: 7.-9. klasse
      * Ungdomsuddannelserne: årgangene 10 -12
      * Alle aldre
  * Vedlæg også anbefalet programmeringsviden inden for følgende kategorier: begynder, øvet eller avanceret. Hour of Codes hjemmeside vil fremhæve begynderaktiviteterne mest fremtrædende. If you’d like to prepare Intermediate and Advanced Hour of Code™ Activities, please include the prior knowledge needed in the description of your activity.
  * Tekniske krav: 
      * For mere præcist at kunne spore elevernes deltagelse, vil vi have tredjeparts tutorial-partnere til også at indbygge 1 pixel sporingsbilleder på den første og sidste side i deres Hour of Code tutorials. Placer et start pixel-billede på startsiden og et afslutnings pixel-billede på sidste side. Placer ikke pixel på mellemliggende sider). Se afsnittet Tracking Pixel nedenfor, for flere detaljer. 
      * Efter afslutningen af aktiviteten skal brugerne ledes videre til [<%= resolve_url('code.org/api/hour/finish') %>](%= resolve_url('https://code.org/api/hour/finish') %) hvor de vil være i stand til at: 
          * Dele på sociale medier, at de færdige Hour of Code
          * Modtage et certifikat, at de har gennemført Hour of Code
          * Se på leaderboards hvilke lande/byer der har de højeste deltager antal i Hour of Code aktiviteterne
          * For users who spend an hour on your activity and don’t complete it, please include a button on your activity that says “I’m finished with my Hour of Code” which links back to [<%= resolve_url('code.org/api/hour/finish') %>](%= resolve_url('https://code.org/api/hour/finish') %) as well. 
  * *(Valgfrit)* We will follow-up with an online survey/form link asking for a report of the following activity metrics for the week of Dec. 7, 12:01 am through Dec. 13, 11:59 pm) 
      * For online aktiviteter (især smartphone/tablet-apps): 
          * Antallet af brugere
          * Hvor mange der fuldført opgaven
          * Gennemsnitlig tid på opgaven
          * Samlet antal af skrevne kodelinjer for alle deltagere
          * Hvor mange fortsatte videre til andre aktiviteter (målt for samtlige brugere, der afslutter opgaven og går ind på yderligere opgaver på dit websted)
      * For offline aktiviteter 
          * Antallet af downloads af papirudgaven af aktivitet (hvis det er nødvendigt)

[**Tilbage til toppen**](#top)

<a id="design"></a>

## Forslag til hvordan du kan designe din aktivitet

You can include either the CSEdWeek logo ([small](https://www.dropbox.com/s/ojlltuegr7ruvx1/csedweek-logo-final-small.jpg) or [big](https://www.dropbox.com/s/yolheibpxapzpp1/csedweek-logo-final-big.png)) or the [Hour of Code logo](https://www.dropbox.com/work/Marketing/HOC2014/Logos%202014/HOC%20Logos) in your tutorial, but this is not required. If you use the Hour of Code logo, see the trademark guidelines below. Under ingen omstændigheder kan Code.org logo og navn bruges. Both are trademarked, and can’t be co-mingled with a 3rd party brand name without express written permission.

**Sørg for at den gennemsnitlige elev kan afslutte inden for en time.** Overvej at tilføje en tidsubestemt aktivitet i slutningen for elever, der er hurtigere gennem lektion. Husk at de fleste børn vil være absolutte begyndere til kodning.

**Vedhæft lærernoter.** De fleste aktiviteter bør være elev-rettet, men hvis en aktivitet skal ledes af en lærer, så inkluder tydelige og enkle anvisninger til læreren i form af lærer-noter på en separat URL indsendt med din aktivitet. Det er ikke kun eleverne der er nybegyndere, det er mange af lærerne også. Medtage også information om:

  * Vores tutorial fungerer bedst på følgende platforme og browsere
  * Does it work on smartphones? Tablets?
  * Vil du anbefale parvis kodning? 
  * Considerations for use in a classroom? E.g. if there are videos, advise teachers to show the videos on a projected screen for the entire classroom to view together

**Indarbejd feedback i slutningen af aktiviteten.** (F.eks.: "du færdig 10 niveauer og lærte om løkker! Great job!")

**Encourage students to post to social media (where appropriate) when they've finished.** For example “I’ve done an Hour of Code with ________ Have you? #HourOfCode"eller"Jeg har gennemført en #HourofCode som en del af #CSEdWeek. Har du? @Scratch." Brug hashtag **#HourOfCode** (med store bogstaver H, O, C)

**Create your activity in Spanish or in other languages besides English.** ]

**Forklaring eller tilslutning til en socialt signifikant sammenhængs aktivitet.** Programmering bliver en supermagt, når eleverne ser, hvordan det kan ændre verden til det bedre!

**Forlang ikke tilmelding eller betaling før eleverne kan prøve din tutorial.** Tutorials der kræver tilmelding eller betaling vil ikke blive vist

**Make sure your tutorial can be used in a [Pair Programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning) paradigm.** The three rules of pair programming in a school setting are:

  * Føreren kontrollerer musen og tastatur.
  * Navigator kommer med forslag, påpeger fejl og stiller spørgsmål. 
  * Eleverne skifter roller mindst to gange i løbet af en session.

Fordelene ved parvis kodning:

  * Eleverne kan hjælpe hinanden, i stedet for at læne sig op ad læreren
  * Vise at kodning ikke er en solo aktivitet, men involverer social interaktion
  * Ikke alle klasser eller it-lokaler har nok computere til en 1:1 aktivitet

[**Tilbage til toppen**](#top)

<a id="tm"></a>

## Retningslinjer for varemærker

After the success of the 2013 campaign, we took steps to make sure we set up the Hour of Code as a movement that can repeat annually with greater fidelity and without confusion.

Én del af dette er, at beskytte varemærket "Hour of Code" for, at forhindre forvirring. Mange af vores tutorial-partnere har brugt "Hour of Code" på deres websteder. Vi ønsker ikke at forhindre denne anvendelse, men vi vil sørge for at det passer inden for nogle grænser:

  1. Enhver reference til "Hour of Code" bør anvendes på en måde, der ikke tyder på, at det er dit eget navn, men snarere henviser til Hour of Code som en græsrodsbevægelse. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Inkluder sprog på siden (eller i den sidefod), herunder links til hjemmesiderne CSEdWeek og Code.org, der siger følgende:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

[**Tilbage til toppen**](#top)

<a id="pixel"></a>

## Sporings Pixel

For mere præcist at kunne spore deltagere, beder vi alle tredjeparts tutorial partnere om også for at indbygge 1 pixel sporingsbilleder på den første og sidste side i deres Hour of Code tutorials (et start pixel-billede på startsiden. og et afsluttende pixel-billede på afslutningssiden. Og ikke på mellemliggende sider).

Dette vil give os mulighed for at tælle brugere, som du får til at besøge din hjemmeside direkte, for at gennemføre deres Hour of Code, eller elever der går direkte ind, hvis en lærer skriver din webadresse på tavlen. Det vil føre til mere præcis tælling af deltagere til din tutorial, og det kan også hjælpe dig med at tiltrække flere brugere. Hvis du integrerer pixel i slutningen, vil det også give os mulighed at måle tutorial gennemførelsesprocenterne.

Hvis din tutorial bliver godkendt og medtages på den endelige tutorial side, vil Code.org give dig en unik tracking pixel til dig, til at integrere på din tutorial. Se nedenstående eksempel.

Bemærk: Dette er ikke vigtigt at gøre for installerbare programmer (iOS/Android apps eller desktop-installere apps)

Eksempel på tracking pixels for AppInventor:

IMG SRC = <http://code.org/api/hour/begin_appinventor.png>   
IMG SRC = <http://code.org/api/hour/finish_appinventor.png>

[**Tilbage til toppen**](#top)

<a id="promote"></a>

## Promoting af dine tutorials, CSEdWeek og Hour of Code

Vi beder alle om at fremme deres egen 1 times tutorial til dine brugere. Please direct them to ***your*** Hour of Code page. Brugerne er langt mere tilbøjelige til at reagere på en mail fra dig om din tutorial. Bruge den internationale Hour of Code kampagne for Computer Science Education Week som en anledning til at opfordre brugerne til at invitere andre til at deltage, hjælpe os med at nå 100 millioner samlede deltagere.

  * Feature Hour of Code and CSEdWeek on your website. Ex: <http://www.tynker.com/hour-of-code>
  * Promover Hour of Code ved hjælp af de sociale medier, traditionelle medier, postlister, osv., ved hjælp af hashtaget **#HourOfCode** (med store bogstaver H, O, C)
  * Være vært for en lokal begivenhed eller spørg dine medarbejdere til at være vært for en begivenhed på den lokale skoler eller lokalgrupper.
  * Se vores resource kit for at få yderligere oplysninger (kommer snart).

[**Tilbage til toppen**](#top)

<a id="disabilities"></a>

## En særlig bemærkning til elever med handicap

Hvis du opretter en øvelse, der er designet til de svagtseende, vil vi gerne fremhæve det for seerne med skærm-læsere. Vi har endnu ikke modtaget sådan en øvelse, men vi vil meget gerne også give disse elever muligheder.

[**Tilbage til toppen**](#top)