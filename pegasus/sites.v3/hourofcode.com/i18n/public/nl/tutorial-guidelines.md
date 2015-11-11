---

title: <%= hoc_s(:title_tutorial_guidelines) %>
layout: wide

---

<%= view :signup_button %>

# Tutorial guidelines for the Hour of Code™ and Computer Science Education Week

Code.org will host a variety of Hour of Code™ activities on the Code.org, Hour of Code, and CSEdWeek website(s). The current list is at [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>).

We bieden een verscheidenheid aan boeiende mogelijkheden, maar we willen vooral leerlingen en leraren zonder ervaring met informatica enthousiasmeren. Je kunt dit document gebruiken om een programma van activiteiten samen te stellen. Dit document houdt rekening met gebruikers die geen achtergrond in programmeren en informatica hebben.

  


**After reading the guidelines, you can submit your tutorial through our [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l).**

**NEW:** Unlike past years, we plan to introduce a new format for "teacher-led" Hour of Code activities. These will be listed below the self-guided activities in student-facing pages and emails. Details below.

<a id="top"></a>

## Index:

  * [General guidelines for creating an Hour of Code™ activity](#guidelines)
  * [Evaluatieproces voor het opnemen van opdrachten](#inclusion)
  * [How to submit (Due 10/15/2015)](#submit)
  * [Tips voor het ontwerpen van een activiteit](#design)
  * [Richtlijnen voor gebruik van het handelsmerk](#tm)
  * [Bijhouden van Pixel](#pixel)
  * [Het promoten van uw tutorials, CSEdWeek en Hour of Code](#promote)
  * [Opmerking voor studenten met een beperking](#disabilities)

<a id="guidelines"></a>

## New for 2015: two formats of activities: self-guided or *lesson-plan*

Now that tens of thousands of educators have tried the Hour of Code, many classrooms are ready for more creative, less one-size-fits-all activities that teach the basics of computer science. To help teachers find inspiration, we'd like to collect and curate one-hour "Teacher-Led" lesson and activity plans for Hour of Code veterans. We will continue promoting the "Self-guided" format as well.

**Submit a Teacher-Led Lesson Plan, ideally for different subject areas *(NEW)***: Do you have an engaging or unique idea for an Hour of Code lesson? Some educators may prefer to host Hour of Code activities that follow a traditional lesson format rather than a guided-puzzle/game experience. If facilitated properly, more open-ended activities can better showcase the creative nature of computer science. We would love to collect **one-hour lesson plans designed for different subject areas**. For example, a one-hour lesson plan for teaching code in a geometry class. Or a mad-lib exercise for English class. Or a creative quiz-creation activity for history class. This can help recruit teachers in other subject areas to guide an Hour of Code activity that is unique to their field, while demonstrating how CS can influence and enhance many different subject areas.

You can start with this [empty template](https://docs.google.com/document/d/1zyD4H6qs7K67lUN2lVX0ewd8CgMyknD2N893EKsLWTg/pub) for your lesson plan.

Examples:

  * [Mirror Images (an activity for an art teacher)](https://csedweek.org/csteacher/mirrorimages.pdf)
  * [An arduino activity for a physics teacher](https://csedweek.org/csteacher/arduino.pdf)
  * [A history of technology activity for a history teacher](https://csedweek.org/csteacher/besttechnology.pdf)

[<button>How can I submit my own lesson plan?</button>](#submit)

  
  
**Student-led (Self-Guided) Format**: The original Hour of Code was built mostly on the success of self-guided tutorials or lessons, optionally facilitated by the teacher. There are plenty of existing options, but if you want to create a new one, these activities should be designed so they can be fun for a student working alone, or in a classroom whose teacher has minimal prep or CS background. They should provide directions for students as opposed to an open-ended hour-long challenge. In het ideale geval zijn de instructies en tutorials rechtstreeks geïntegreerd in het programmeringsplatform, om te voorkomen er geschakeld moet worden tussen tabs of windows van de tutorial en het programmeringsplatform.

Note: On student-facing pages we'll list teacher-led activities *below* the self-guided ones, but we'll specifically call them out on pages or emails meant for educators.

## Algemene richtlijnen voor het samenstellen van een Uur Code-activiteit

The goal of an Hour of Code is to give beginners an accessible first taste of computer science or programming (not HTML). The tone should be that:

  * Computer science is not just for geniuses, regardless of age, gender, race. Anybody *can* learn!
  * Computer science is connected to a wide variety of fields and interests. Everybody *should* learn!
  * Motiveer leerlingen om iets te creëren dat met vrienden/online gedeeld kan worden.

**Technical requirements**: Because of the wide variety of school and classroom technology setups, the best activities are Web-based or smartphone-friendly, or otherwise unplugged-style activities that teach computer science concepts without the use of a computer (see <http://csunplugged.com/>). Activities that require an app-install, desktop app, or game-console experiences are ok but not ideal.

[**Terug naar de top**](#top)

<a id="inclusion"></a>

## Evaluatieproces voor het opnemen van opdrachten

Een commissie van informatica docenten zal inzendingen beoordelen op basis van kwalitatieve en kwantitatieve criteria, waarbij de resultaten van een enquête onder docenten meegenomen zullen worden.

**Opdrachten zullen hoger op de lijst komen als zij:**

  * van hoge kwaliteit zijn
  * designed for beginners - among students AND teachers
  * als een 60 minuten activiteit ontworpen zijn
  * require no sign up
  * require no payment
  * require no installation
  * op vele OS/apparaatplatforms, inclusief mobiele en tablets werken
  * in meerdere talen werken
  * promote learning by all demographic groups (esp. under-represented groups)
  * zich niet enkel focussen op zuiver HTML + CSS web ontwerp (ons doel is informatica, niet alleen HTML-code)

**Opdrachten zullen lager op de lijst komen als zij:**

  * van lagere kwaliteit zijn
  * voor gevorderden zijn bedoeld (niet voor beginners)
  * slechts op een beperkt aantal OS/apparaatplatforms werken - voor Web-gebaseerde platforms moeten de volgende browsers ondersteund worden: IE9 +, en de nieuwste Chrome, Firefox en Safari
  * alleen in het Engels werken
  * reinforce stereotypes that hinder participation by under-represented student groups
  * dienen als promotie voor een betaald leerplatform

**Opdrachten zullen NIET worden opgenomen als zij:**

  * niet ontworpen zijn voor een activiteit van (ongeveer) één uur
  * inschrijving vereisen 
  * betaling vereisen
  * require installation (other than mobile apps)
  * zich alleen focussen op HTML + CSS webdesign
  * ingediend worden na de termijn van indiening, of met onvolledige informatie (zie hieronder)

**If your tutorial is student-led** Student-led tutorials need to be designed to be self-directed, not to require significant CS instruction or prep from teachers

Het uiteindelijke doel van de Een Uur Code campagne is om betrokkenheid van leerlingen en docenten bij informatica te vergroten, en te laten zien dat informatica toegankelijk is voor iedereen, en "makkelijker dan je denkt." Dit doel is het best te bereiken door leerlingen en docenten een beperkt aantal eenvoudige opties te bieden, die tegelijkertijd van hoge kwaliteit zijn. Note also that the 2013 and 2014 Hour of Code campaigns were a fantastic success with over 120M served, with nearly unanimous positive survey responses from participating teachers and students. As a result, the existing listings are certainly good and the driving reason to add tutorials to the Hour of Code listings isn't to broaden the choices, but to continue to raise the quality (or freshness) for students, or to expand the options for non-English speakers given the global nature of the 2015 campaign.

[**Terug naar de top**](#top)

<a id="submit"></a>

## How to submit (Due 10/15/2015)

Visit the [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l) and follow the steps to submit your tutorial.

**Wat u nodig heeft:**

  * Uw naam, logo (jpg, png, etc.)
  * URL voor de afbeelding van een screenshot of marketing van de HoC activiteit. Beelden/screenshots moeten precies een resoltutie 446 x 335 hebben. Als er geen geschikte afbeelding wordt aangeleverd , kunnen wij onze eigen screenshot van je tutorial maken, of we kunnen er voor kiezen deze niet aan de lijst toe te voegen.
  * URL-link voor het logo
  * Naam van de activiteit
  * URL-Link naar de activiteit
  * URL-koppeling naar docent aantekeningen (optioneel, zie details hieronder)
  * Beschrijving van de activiteit (zowel desktop-weergave en mobiele-weergave) 
      * **Max aantal tekens voor Bureaublad-weergave:** 384
      * **Max aantal tekens voor mobiele-weergave:** 74
      * Vermeld in de beschrijving of het een voornamelijk student-geleide of leraar-begeleide opgave is. Bovendien, zijn sommige scholen er in geïnteresseerd of de Uur Code activiteiten aansluiten bij gemeenschappelijke basis Science Standards. Als de activiteit specifieke normen ondersteunt, kunt u overwegen deze informatie toe te voegen.
  * Een lijst van geteste/compatibele platforms: 
      * Web based: Which platforms have you tested 
          * OS - Mac, Win, en versies
          * Browsers - IE8, IE9, IE10, Firefox, Chrome, Safari
          * iOS mobiele Safari (mobiele-geoptimaliseerde)
          * Androïde Chrome (mobiele-geoptimaliseerde)
      * Non web-based: specify platform for native code (Mac, Win, iOS, Android, xBox, other)
      * Unplugged
  * Een lijst van ondersteunde talen en de juiste indeling: 
      * Tutorials moeten opgeven welke talen ze ondersteunen met behulp van 2-teken taal codes, b.v. en - Engels; ja - Japans
      * Als meer specificiteit nodig is, met behulp van streepjes, bijvoorbeeld fr-worden - Frans (België) of fr-ca - Frans (Canada)
      * ***Opmerking: Taaldetectie is de taak van de tutorial provider, we zullen alle gebruikers naar de verstrekte URL leiden.*** 
  * Als u een on line zelfstudie opdracht instuurt, willen we weten of het [COPPA compatibel](http://en.wikipedia.org/wiki/Children's_Online_Privacy_Protection_Act) of niet is.
  * Aanbevolen niveau (s) voor de beoogde gebruikers. U kan verwijzen naar de [Computer Science Teachers' Association K-12 normen](http://csta.acm.org/Curriculum/sub/K12Standards.html) voor niveau-geschikte informatica begrippen. Voorbeeld niveaus omvatten: 
      * Basisschool: rangen K-2 of 3-5
      * Basis school: rangen 6-8
      * Middelbare School: rangen 9-12
      * Alle leeftijden
  * Geef ook een aanbeveling voor het informatica niveau met de termen: beginner, gevorderde of expert. De Uur Code website zal activiteiten voor beginners het meest prominent plaatsen. If you’d like to prepare Intermediate and Advanced Hour of Code™ Activities, please include the prior knowledge needed in the description of your activity.
  * Technische eisen: 
      * Om zo nauwkeurig mogelijk de deelname te kunnen volgen willen we iedere partner vragen om 1-pixel volg plaatjes op de eerste en laatste pagina van hun Uur Code opdrachten te plaatsen. Plaats een 1-pixel startplaatje op de eerste pagina en een 1-pixel einde-plaatje op de laatste pagina. Plaats geen 1-pixel plaatjes op tussenliggende pagina's. Zie de Tracking Pixel alinea hieronder voor meer details. 
      * Na afsluiting van uw activiteit, moeten gebruikers worden doorgestuurd naar [<%= resolve_url('code.org/api/hour/finish') %>](<%= resolve_url('https://code.org/api/hour/finish') %>) where they will be able to: 
          * Delen op sociale media dat zij het Uur Code voltooid hebben
          * Een certificaat ontvangen voor het voltooien van het Uur Code
          * Het bekijken van leaderboards waar te vinden is welke landen/steden de hoogste participatiegraad van Uur Code activiteiten hebben
          * For users who spend an hour on your activity and don’t complete it, please include a button on your activity that says “I’m finished with my Hour of Code” which links back to [<%= resolve_url('code.org/api/hour/finish') %>](<%= resolve_url('https://code.org/api/hour/finish') %>) as well. 
  * *(Optioneel)* We will follow-up with an online survey/form link asking for a report of the following activity metrics for the week of Dec. 7, 12:01 am through Dec. 13, 11:59 pm) 
      * Voor online activiteiten (met name smartphone/Tablet PC apps): 
          * Aantal gebruikers
          * Hoeveel hebben de taak voltooid
          * Gemiddelde tijd op de taak
          * Aantal totale lijnen code die is geschreven over alle gebruikers
          * Hoeveel gebruikers verder zijn gegaan met leren (gemeten als: elke gebruiker die de taak heeft voltooid en doorgaat met extra taken op uw site)
      * Voor offline activiteiten 
          * Aantal downloads van papieren versie van de activiteit (indien van toepassing)

[**Terug naar de top**](#top)

<a id="design"></a>

## Tips voor het ontwerpen van een activiteit

You can include either the CSEdWeek logo ([small](https://www.dropbox.com/s/ojlltuegr7ruvx1/csedweek-logo-final-small.jpg) or [big](https://www.dropbox.com/s/yolheibpxapzpp1/csedweek-logo-final-big.png)) or the [Hour of Code logo](https://www.dropbox.com/work/Marketing/HOC2014/Logos%202014/HOC%20Logos) in your tutorial, but this is not required. If you use the Hour of Code logo, see the trademark guidelines below. Onder geen enkele omstandigheid mogen het Code.org logo en de naam worden gebruikt. Both are trademarked, and can’t be co-mingled with a 3rd party brand name without express written permission.

**Zorg er voor dat de gemiddelde student comfortabel in een uurtje kan eindigen.** Overweeg het toevoegen van een open activiteit aan het einde voor studenten die sneller door de les gaan. Hou in gedachten dat de meeste kinderen geen enkele basiskennis hebben van informatica en coderen.

**Leraar aanbevelingen opnemen.** De meeste activiteiten zouden student-gestuurd moeten zijn, maar als een activiteit wordt ondersteund door een leerkracht, geef dan duidelijke en eenvoudige aanwijzingen voor de leraar in de vorm van leraar-opmerkingen, biedt deze aan via een afzonderlijke URL bij uw activiteit. Niet alleen de studenten zijn beginners, sommige van de leraren zijn dat net zo goed. Voeg info toe zoals:

  * Onze tutorial werkt het beste op de volgende platforms en browsers
  * Does it work on smartphones? Tablets?
  * Raadt u het programmeren in groepjes van twee leerlingen aan? 
  * Considerations for use in a classroom? E.g. if there are videos, advise teachers to show the videos on a projected screen for the entire classroom to view together

**Voeg feedback toe aan het einde van de activiteit.** (Bijvoorbeeld: "u voltooide 10 levels en leerde over lussen! Knap gedaan!")

**Encourage students to post to social media (where appropriate) when they've finished.** For example “I’ve done an Hour of Code with ________ Have you? #HourOfCode" of "Ik heb een #HourofCode uur gedaan als onderdeel van #CSEdWeek. En jij? @Scratch." Gebruik de hashtag **#HourOfCode** (met hoofdletters H, O, C)

**Create your activity in Spanish or in other languages besides English.** ]

**Verbind de activiteit aan een maatschappelijk relevante context.** Leerlingen zullen programmeren als een machtig middel ervaren als ze zien dat het problemen in de wereld kan helpen oplossen!

**Zorg dat studenten zich niet hoeven in te schrijven of dat ze moeten betalen om de tutorial te kunnen volgen.** Tutorials die inschrijving of betaling vereisen, zullen niet opgenomen worden in de lijst

**Make sure your tutorial can be used in a [Pair Programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning) paradigm.** The three rules of pair programming in a school setting are:

  * De chauffeur is de baas over de muis en het toetsenbord.
  * De navigator geeft suggesties, merkt fouten op en stelt vragen. 
  * Studenten moeten minstens twee keer per sessie van rol wisselen.

Voordelen van het programmeren in paren:

  * Leerlingen kunnen elkaar helpen en zijn niet afhankelijk van de docent.
  * Het laat zien dat "coding" geen solo-activiteit is, maar dat sociale interactie nodig is.
  * Niet alle klaslokalen of labs hebben genoeg computers voor een 1op1 ervaring.

[**Terug naar de top**](#top)

<a id="tm"></a>

## Richtlijnen voor gebruik van het handelsmerk

After the success of the 2013 campaign, we took steps to make sure we set up the Hour of Code as a movement that can repeat annually with greater fidelity and without confusion.

Een van de middelen hiertoe is de bescherming van het label "Uur Code" om verwarring te vermijden. Veel van onze opdracht partners hebben "Uur Code" op hun websites gebruikt. We willen dit gebruik niet stoppen, maar we willen wel een paar grenzen stellen:

  1. Elke verwijzing naar "Uur Code" moet worden gebruikt op een zodanige manier deze niet suggereert dat het uw eigen merknaam is, maar dient te verwijzen naar het Uur Code als een organisatie. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Slecht voorbeeld: "Probeer Uur Code door ACME Corp"
  2. Een "TM" superscript gebruiken in de meest prominente plaatsen waar u "Uur Code" gebruikt, zowel op uw website als in app omschrijvingen
  3. Plaats op uw pagina (of in de de voettekst) de volgende tekst, waaronder koppelingen naar de websites van CSEdWeek en Code.org, met de volgende inhoud:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. Geen gebruik van "Uur Code" in app namen

[**Terug naar de top**](#top)

<a id="pixel"></a>

## Bijhouden van Pixel

Om nauwkeuriger deelname te kunnen bijhouden, verzoeken wij dat elke derde partij opdracht partners, zoals u,1-pixel afbeeldingen wil plaatsen op de eerste en de laatste pagina van hun uur van Code tutorials (een begin pixel-afbeelding op de startpagina. en een laatste pixel-afbeelding op de pagina einde. En niet op tussentijdse pagina's).

Dit maakt het ons mogelijk om gebruikers te volgen die u rechtstreeks aantrekt voor een bezoek aan uw website om mee te doen aan hun Uur Code, of gebruikers die u bezoeken wanneer een leraar uw URL rechtstreeks op hun whiteboard typt. Het zal leiden tot meer accurate deelnemersaantallen voor uw opdrachten, wat u helpt om meer gebruikers aan te trekken. Als u de pixel op het einde toevoegt laat het ons ook toe om te meten hoeveel opdrachten volledig werden afgewerkt.

Als je opdracht is goedgekeurd en op de definitieve pagina van de opdrachtenpagina wordt opgenomen, zal Code.org u voorzien van een unieke tracking pixel. Zie het voorbeeld hieronder.

Opmerking: dit is niet belangrijk voor installeerbare apps (iOS/Android apps of desktop-install apps)

In het volgende voorbeeld tracking pixels voor AppInventor:

IMG SRC = <http://code.org/api/hour/begin_appinventor.png>   
IMG SRC = <http://code.org/api/hour/finish_appinventor.png>

[**Terug naar de top**](#top)

<a id="promote"></a>

## Het promoten van uw tutorials, CSEdWeek en Hour of Code

Wij vragen iedereen om hun eigen 1-uur-tutorial te promoten bij uw gebruikers. Please direct them to ***your*** Hour of Code page. Uw gebruikers zullen veel sneller reageren op een mailing van u over uw opdracht. Gebruik de internationale Uur Code campagne voor de onderwijs Week van de informatia als een excuus om hen aan te moedigen anderen te vragen mee te doen en ons te helpen het aantal van 100 miljoen deelnemers in totaal te bereiken.

  * Feature Hour of Code and CSEdWeek on your website. Ex: <http://www.tynker.com/hour-of-code>
  * Promote Uur Code met behulp van sociale media, traditionele media, mailinglijsten, enz., met behulp van hashtag **#HourOfCode** (met hoofdletters H, O, C)
  * Organiseer een lokaal evenement of vraag uw werknemers voor het hosten van een evenement op lokale scholen.
  * Zie onze resourcekit voor meer informatie (volgt binnenkort).

[**Terug naar de top**](#top)

<a id="disabilities"></a>

## Een speciale opmerking voor studenten met een handicap

Als u een opdracht maakt die ontworpen is voor slechtzienden willen we deze graag markeren voor personen met schermlezers. We hebben nog geen dergelijke opdracht ontvangen en willen graag zo'n opdracht toevoegen voor de slechtziende leerlingen.

[**Terug naar de top**](#top)

<%= view :signup_button %>