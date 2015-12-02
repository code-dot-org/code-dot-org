---

title: <%= hoc_s(:title_tutorial_guidelines) %>
layout: wide

---

<%= view :signup_button %>

# Pokyny pro výukové programy Hodinu kódu ™ a Týdne vzdělávání informatiky

Code.org bude pořádat různé aktivity Hodiny kódu na stránkách Code.org, Hodina kódu a CSEdWeek websajt(y). Aktuální seznam je na [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>).

Rádi bychom nabídli různé zajímavé možnosti, ale naším hlavním cílem je zaujmout žáky bez zkušeností v informatice a také jejich učitele. Prosím, použij tento text jako průvodce vytvořením své aktivity, zaměřené na uživatele bez zkušeností s programováním a informatikou.

  


**Po přečtení pokynů, můžete odeslat váš kurz prostřednictvím naší [Hodina kódu ™ stránky zaslání aktivity ](https://goo.gl/kNrV3l).**

**NOVÝ:** Na rozdíl od minulých let, máme v plánu zavést nový formát pro "učitel vede" Hodinu kódu aktivity. Budou uvedeny níže aktivity samouky orientované stránky na studenta a e-maily. Podrobnosti níže.

<a id="top"></a>

## Index:

  * [Všeobecné pokyny pro vytvoření aktivity pro Hodinu kódu](#guidelines)
  * [Jak se hodnotí výukové materiály pro jejich zařazení](#inclusion)
  * [Jak odeslat (do 10/15/2015)](#submit)
  * [Rady pro vytvoření aktivity](#design)
  * [Pokyny k ochranným známkám](#tm)
  * [Sledovací obrázek](#pixel)
  * [Propagujte výukové programy, akce CSEdWeek a Hodina kódu](#promote)
  * [Poznámka pro studenty se zdravotním postižením](#disabilities)

<a id="guidelines"></a>

## Nová pro rok 2015: dva formáty aktivit: průvodce nebo *lekce plán*

Nyní desítky tisíc pedagogů se pokoušeli o Hodinu kódu, mnoho učeben jsou připravené na kreativnější, méně univerzální aktivity k výuce základů informatiky. To help teachers find inspiration, we'd like to collect and curate one-hour "Teacher-Led" lesson and activity plans for Hour of Code veterans. We will continue promoting the "Self-guided" format as well.

**Submit a Teacher-Led Lesson Plan, ideally for different subject areas *(NEW)***: Do you have an engaging or unique idea for an Hour of Code lesson? Some educators may prefer to host Hour of Code activities that follow a traditional lesson format rather than a guided-puzzle/game experience. If facilitated properly, more open-ended activities can better showcase the creative nature of computer science. We would love to collect **one-hour lesson plans designed for different subject areas**. For example, a one-hour lesson plan for teaching code in a geometry class. Or a mad-lib exercise for English class. Or a creative quiz-creation activity for history class. This can help recruit teachers in other subject areas to guide an Hour of Code activity that is unique to their field, while demonstrating how CS can influence and enhance many different subject areas.

You can start with this [empty template](https://docs.google.com/document/d/1zyD4H6qs7K67lUN2lVX0ewd8CgMyknD2N893EKsLWTg/pub) for your lesson plan.

Examples:

  * [Mirror Images (an activity for an art teacher)](https://csedweek.org/csteacher/mirrorimages.pdf)
  * [An arduino activity for a physics teacher](https://csedweek.org/csteacher/arduino.pdf)
  * [A history of technology activity for a history teacher](https://csedweek.org/csteacher/besttechnology.pdf)

[<button>How can I submit my own lesson plan?</button>](#submit)

  
  
**Student-led (Self-Guided) Format**: The original Hour of Code was built mostly on the success of self-guided tutorials or lessons, optionally facilitated by the teacher. There are plenty of existing options, but if you want to create a new one, these activities should be designed so they can be fun for a student working alone, or in a classroom whose teacher has minimal prep or CS background. They should provide directions for students as opposed to an open-ended hour-long challenge. Ideální je, aby instrukce a návody byly zabudované přímo do programovací platformy, aby se zabránilo přepínání karet nebo oken mezi výukovým programem a programovací platformou.

Note: On student-facing pages we'll list teacher-led activities *below* the self-guided ones, but we'll specifically call them out on pages or emails meant for educators.

## Všeobecné pokyny pro vytvoření aktivity pro Hodinu kódu

The goal of an Hour of Code is to give beginners an accessible first taste of computer science or programming (not HTML). The tone should be that:

  * Computer science is not just for geniuses, regardless of age, gender, race. Anybody *can* learn!
  * Computer science is connected to a wide variety of fields and interests. Everybody *should* learn!
  * Povzbuzujte studenty, aby vytvořili něco, co mohou sdílet s přáteli nebo online.

**Technical requirements**: Because of the wide variety of school and classroom technology setups, the best activities are Web-based or smartphone-friendly, or otherwise unplugged-style activities that teach computer science concepts without the use of a computer (see <http://csunplugged.com/>). Activities that require an app-install, desktop app, or game-console experiences are ok but not ideal.

[**Zpět nahoru**](#top)

<a id="inclusion"></a>

## Jak se hodnotí výukové materiály pro jejich zařazení

Výbor složený z pedagogů informatiky bude hodnotit podání, založená na kvalitativních a kvantitativních ukazatelích, zahrnující výsledky průzkumu v širší skupině pedagogů.

**Výukové materiály budou zařazeny výše, když budou splňovat následující kritéria:**

  * vysoká kvalita
  * designed for beginners - among students AND teachers
  * plánované jako hodinová aktivita
  * nevyžaduje se jejich registrace
  * bezplatné
  * není nutná instalace
  * fungují na různých platformách bez ohledu na operační systém a hardware, včetně mobilů a tabletů
  * pracuje ve více jazycích
  * promote learning by all demographic groups (esp. under-represented groups)
  * nejsou zaměřené jen na HTML + CSS webový design - (náš cíl je širší, informatika, nikoliv jen HTML kódování)

**Výukové materiály jsou zařazeny níže, mají-li následující kritéria:**

  * nižší kvalita
  * pokročilejší úroveň výuky (nikoliv pro začátečníky)
  * mají omezený počet podporovaných operačních systémů/hardwaru - webová platforma by měla podporovat všeobecně používané prohlížeče: IE9 a výš, nejnovější verze Chrome, Firefox a Safari
  * pracuje pouze v angličtině
  * reinforce stereotypes that hinder participation by under-represented student groups
  * slouží jako nabídka placené vzdělávací platformy

**Výukové materiály NEBUDOU zařazeny, pokud:**

  * navržená činnost přesahuje jednu hodinu (zhruba)
  * vyžaduje se registrace 
  * požaduje platbu
  * require installation (other than mobile apps)
  * zaměření jen na HTML + CSS webový design
  * zaslány po konečném termínu přijetí, resp. s neúplnými informacemi (viz níže)

**If your tutorial is student-led** Student-led tutorials need to be designed to be self-directed, not to require significant CS instruction or prep from teachers

Koneckonců, cílem kampaně Hodina kódu je širší zapojení žáků a učitelů do informatiky, a pomoci ukázat, že informatika je přístupná pro všechny, "snadnější, než si myslíš". V mnoha směrech lze tohoto cíle dosáhnout snadněji tím, že dáme žákům a učitelům méně a jednodušší volby s důrazem na co nejvyšší kvalitu nabídky pro začínající uživatele. Note also that the 2013 and 2014 Hour of Code campaigns were a fantastic success with over 120M served, with nearly unanimous positive survey responses from participating teachers and students. As a result, the existing listings are certainly good and the driving reason to add tutorials to the Hour of Code listings isn't to broaden the choices, but to continue to raise the quality (or freshness) for students, or to expand the options for non-English speakers given the global nature of the 2015 campaign.

[**Zpět nahoru**](#top)

<a id="submit"></a>

## Jak odeslat (do 10/15/2015)

Visit the [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l) and follow the steps to submit your tutorial.

**Co budete potřebovat:**

  * Vaše jméno, logo (jpg, png atp.)
  * URL pro snímek nebo marketingový obrázek HoC aktivity. Obrázky by měly mít rozlišení přesně 446 x 335. Není-li odpovídající obrázek zadán, můžeme udělat náš vlastní snímek vašeho kurzu nebo se rozhodneme obrázek nezařadit.
  * URL odkaz na logo
  * Název aktivity
  * URL odkaz na činnost
  * URL odkaz na poznámky učitele (volitelné, viz podrobnosti níže)
  * Popis činnosti (zobrazení plochy a mobilní zobrazení) 
      * **Maximální počet znaků pro zobrazení plochy:** 384
      * **Maximální počet znaků pro mobilní náhled:** 74
      * Uveďte prosím v popisu, zda se jedná především o práci studenta nebo je nutná asistence učitele. Kromě toho některé školy mají zájem vědět, zda činnosti Hodina kódu řeší společný základ nebo další generaci vědeckých standardů. Když činnost řeší specifické standardy, zvažte zahrnutí této informace.
  * Seznam testovaných/kompatibilních platforem: 
      * Web based: Which platforms have you tested 
          * OS - verze Mac, Win
          * Prohlížeče - IE8, IE9, IE10, Firefox, Chrome, Safari
          * iOS mobilní Safari (optimalizované na mobil)
          * Android Chrome (optimalizované na mobil)
      * Non web-based: specify platform for native code (Mac, Win, iOS, Android, xBox, other)
      * Nepřipojený
  * Seznam podporovaných jazyků a vhodný formát: 
      * Výukové programy by měly specifikovat, které jazyky podporují s použitím dvouznakového jazykového kódu, například en - anglicky; Ja - japonština
      * Je-li třeba specifikovat jazyk úžeji, provede se to pomlčkou, např. fr-be - francouzština (Belgie) nebo fr-ca - francouzština (Kanada)
      * ***Poznámka: Rozpoznání jazyka je práce zprostředkovatele kurzu, my přesměrujeme všechny uživatele na jednu zadanou URL adresu.*** 
  * Když zasíláte online kurz, musíme vědět, zda je [COPPA kompatibilní](http://en.wikipedia.org/wiki/Children's_Online_Privacy_Protection_Act) nebo nikoliv.
  * Doporučený stupeň úrovně pro zamýšleného uživatele. Můžete se podívat na [Computer Science Teachers’ Association’s K-12 Standards](http://csta.acm.org/Curriculum/sub/K12Standards.html) pro vhodné označení úrovne pojmů informatky. Příklad úrovne obsahuje: 
      * Základní škola: stupeň K-2 nebo 3-5
      * Základní škola: stupeň třídy 6-8
      * Střední školy: stupeň 9-12
      * Všechny věkové kategorie
  * Uveďte též doporučené znalosti informatiky podle úrovně vzdělání: začátečník, pokročilý nebo expert. Webová stránka Hodiny kódu zdůrazňuje především aktivity pro začátečníky. If you’d like to prepare Intermediate and Advanced Hour of Code™ Activities, please include the prior knowledge needed in the description of your activity.
  * Technické požadavky: 
      * Pro přesnější sledování účasti, chceme, aby každý výukový program od třetí partnerské strany měl na první a poslední stránce výukového programu jedno-pixelové sledovací obrázky. Umístěte výchozí pixelový obrázek na úvodní stránku a koncový pixelový obrázek na poslední stránku. Neumísťujte pixely na vnitřní stránky). Více podorbností naleznete v části Sledování Pixelů níže. 
      * Po dokončení vaší činnosti, by uživatelé měli být přesměrováni na [<%= resolve_url('code.org/api/hour/finish') %>](<%= resolve_url('https://code.org/api/hour/finish') %>) kde budou schopni: 
          * Sdílet na sociálních sítích, že dokončili aktivitu Hodiny kódu
          * Získat certifikát o dokončení aktivity Hodiny kódu
          * Podívat se na žebříčky o tom, které země/města mají nejvyšší míru účasti v aktivitách Hodiny kódu
          * For users who spend an hour on your activity and don’t complete it, please include a button on your activity that says “I’m finished with my Hour of Code” which links back to [<%= resolve_url('code.org/api/hour/finish') %>](<%= resolve_url('https://code.org/api/hour/finish') %>) as well. 
  * *(nepovinné)* We will follow-up with an online survey/form link asking for a report of the following activity metrics for the week of Dec. 7, 12:01 am through Dec. 13, 11:59 pm) 
      * Pro online aktivity (zejména smartfounové/tabletové aplikace): 
          * Počet uživatelů
          * Kolik úkol dokončilo
          * Průměrná doba zpracování úkolu
          * Celkový počet řádků kódu zapsaný všemi uživateli
          * Kolik pokračovalo v dalším vzdělávání (měřeno jako každý uživatel, který dokončí úkol a přejde na další úkoly na vaší stránce)
      * Pro offline aktivity 
          * Počet stažení papírové verze aktivity (je-li k dispozici)

[**Zpět nahoru**](#top)

<a id="design"></a>

## Rady pro návrh vaší aktivity

You can include either the CSEdWeek logo ([small](https://www.dropbox.com/s/ojlltuegr7ruvx1/csedweek-logo-final-small.jpg) or [big](https://www.dropbox.com/s/yolheibpxapzpp1/csedweek-logo-final-big.png)) or the [Hour of Code logo](https://www.dropbox.com/work/Marketing/HOC2014/Logos%202014/HOC%20Logos) in your tutorial, but this is not required. If you use the Hour of Code logo, see the trademark guidelines below. Za žádných okolností nelze používat logo ani název Code.org. Both are trademarked, and can’t be co-mingled with a 3rd party brand name without express written permission.

**Ujistěte se, že průměrný student může pohodlně dokončit hodinu.** Zvažte zařazení otevřené aktivity na konec pro studenty, kteří rychleji zvládnou lekci. Nezapomeňte, že většina dětí budou absolutní začátečníci v informatice a programování.

**Vložte poznámky pro učitele.** Většinu aktivit by měl zvládat student samostatně, ale pokud je některá aktivita je podporována nebo řízená učitelem, uveďte jasné a jednoduché pokyny pro učitele ve formě učitelské poznámky na samostatnou URL adresu s vaší činností. Nejenže jsou studenti začátečníci, někteří učitelé také. Vložte informace jako např:

  * Náš kurz pracuje nejlépe na následujících platformách a prohlížečích
  * Does it work on smartphones? Tablets?
  * Doporučuje se programování ve dvojici ? 
  * Considerations for use in a classroom? E.g. if there are videos, advise teachers to show the videos on a projected screen for the entire classroom to view together

**Začleňte zpětnou vazbu na konec aktivity.** (Např.: "dokončil jste 10 úrovní a naučil jste se o něco smyčkách! Skvělá práce!")

**Encourage students to post to social media (where appropriate) when they've finished.** For example “I’ve done an Hour of Code with ________ Have you? #HourOfCode" nebo "udělal jsem #HourofCode jako součást #CSEdWeek. Opravdu? @Scratch." Použijte hashtag**#HourOfCode** (s velkými písmeny H, O, C)

**Create your activity in Spanish or in other languages besides English.** ]

**Vysvětlete nebo spojte aktivitu se sociálně významným kontextem.** Programování se stává super-silou, vidí-li studenti, jak může svět změnit k lepšímu!

**Nepožaduje registraci nebo platbu předem, než si mohou studenti vyzkoušet váš kurz.** Výukové programy vyžadující registraci nebo platbu nebudou zařazeny

**Make sure your tutorial can be used in a [Pair Programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning) paradigm.** The three rules of pair programming in a school setting are:

  * Ovladač řídí myš a klávesnici.
  * Navigátor dělá návrhy, poukazuje na chyby a klade otázky. 
  * Studenti by si měli vyměnit role nejméně dvakrát během lekce.

Výhody programování ve dvojici:

  * Studenti si mohou vypomáhat navzájem, místo spoléhání se na učitele
  * Ukázuje se, že kódování, není sólovou činností, ale zahrnuje sociální interakce
  * Ne vždy učebny nebo laboratoře mají dostatek počítačů, pro 1:1 zážitek

[**Zpět nahoru**](#top)

<a id="tm"></a>

## Pokyny k ochranným známkám

After the success of the 2013 campaign, we took steps to make sure we set up the Hour of Code as a movement that can repeat annually with greater fidelity and without confusion.

Jedna část toho je ochrana ochranné známky "Hour of Code" aby nedošlo k záměně. Mnoho z našich partnerů výukových kurzu používalo "Hour of Code" na vašich webových stránkách. My nechceme bránit tomuto použití, ale chceme se ujistit, že splňuje některá kritéria:

  1. Jakýkoliv odkaz na "Hodinu kódu" by se měl používat způsobem, který nenaznačuje, že je to vaše vlastní značka, ale spíše že odkazuje na Hodinu kódu jako základní hnutí. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Dodržte styl na stránce (nebo zápatí), včetně odkazů na webové stránky CSEdWeek a Code.org s následujícím obsahem:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

[**Zpět nahoru**](#top)

<a id="pixel"></a>

## Sledovací obrázek

Pro přesnější sledování účasti, chceme, aby každý výukový program od třetí partnerské strany měl na první a poslední stránce výukového programu jedno-pixelové sledovací obrázky. (úvodní pixelový obázek na úvodní stránce a konečný pixelový obráyek na poslední stránce. A žádný na vnitřních stránkách).

To nám umožní spočítat uživatele, které jste přímo přiměli navštívit vaše webové stránky, aby si udělali Hodinu kódu, nebo uživatele, kteří navštíví naši stránku, když učitel zadá URL přímo na tabuli. To povede k přesnějšímuení účasti vášho kurzu, co nám pomůže přilákat uživatele. Pokud vložíte pixel na konec, pomůže nám to změřit, kolik studentů ukončilo kurz.

Pokud bude váš kurz schválen a uveden na konečné stránce kurzů, Code.org vám poskytne jedinečný sledovatelný pixel, který integrujete do vašeho kurzu. Viz příklad níže.

Poznámka: Toto není důležité udělat pro instalovatelné aplikace (iOS/Android aplikace, nebo aplikace pro deskto)

Příklad sledovatelných pixelů pro AppInventor:

IMG SRC = <http://code.org/api/hour/begin_appinventor.png>   
IMG SRC = <http://code.org/api/hour/finish_appinventor.png>

[**Zpět nahoru**](#top)

<a id="promote"></a>

## Propagujte výukové programy, akce CSEdWeek a Hodiny kódu

Obracíme se žádostí na každého, aby představili svůj vlastní 1 hodinový kurz svým uživatelům. Please direct them to ***your*** Hour of Code page. Vaši uživatelé budou jistě pravděpodobněji reagovat na váš mail o vašem kurzu. Využívejte mezinárodní kampaň Hodiny kódu pro Computer Science Eucation Week (Týden vzdělávání v informatice) jako záminku pro vybídnutí uživatelů k pozvání dalších, aby se k nám připojili, aby nám pomohli dosáhnout celkového počtu 100 milionů účastníků.

  * Feature Hour of Code and CSEdWeek on your website. Ex: <http://www.tynker.com/hour-of-code>
  * Propagujte akci Hodina kódu pomocí sociálních médií, tradičních médií, katalogů atp., pomocí hashtagu **#HourOfCode** (s písmeny velkými písmeny H, O, C)
  * Hostujte ji jako místní událost nebo požádejte vaše zaměstnance, aby hostili akci v místních školách nebo komunitních skupinách.
  * Viz naši zdrojovou sadu pro další informace (už brzy).

[**Zpět nahoru**](#top)

<a id="disabilities"></a>

## Zvláštní poznámka pro studenty se zdravotním postižením

Pokud vytvoříte výukový materiál pro nevidomé nebo slabozraké, rádi bychom jej zvýraznili pro uživatele se čtečkou obrazovky. Dosud jsme takový výukový materiál neobdrželi a velmi rádi bychom nějaký zařadili jako možnost pro takové žáky.

[**Zpět nahoru**](#top)

<%= view :signup_button %>