---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Hæng disse plakater op på din skole

<%= view :promote_posters %>

<a id="social"></a>

## Del dette på sociale medier

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. Enhver reference til "Hour of Code" bør anvendes på en måde, der ikke tyder på, at det er dit eget navn, men snarere henviser til Hour of Code som en græsrodsbevægelse. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Inkluder sprog på siden (eller i den sidefod), herunder links til hjemmesiderne CSEdWeek og Code.org, der siger følgende:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Send disse e-mails for at fremme Hour of Code

<a id="email"></a>

## Opfordre din skole, arbejdsgiver eller venner om at tilmelde sig:

Computere findes overalt, men langt færre skoler underviser i programmering end for 10 år siden. De gode nyheder er, at vi er på vej til at ændre dette. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! og Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Få dit budskab ud. Vær vært for en begivenhed. Bed en lokal skole om at tilmelde sig. Eller prøve Hour of Code selv – alle kan drage fordel af at lære det grundlæggende.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Inviter medierne til at deltage i dit arrangement:

**Subject line:** Local school joins mission to introduce students to computer science

Der er computere overalt, men færre skoler underviser i programmering end for 10 år siden. Piger og minoriteter er stærkt underrepræsenterede. De gode nyheder er, at vi er på vej til at ændre dette.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! og Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Jeg skriver for at invitere dig til at deltage i vores kickoff på Hour of Code, og at se eleverne gå i gang den [DATE].

Hour of Code, arrangeret af nonprofit-organisationen Code.org og over 100 andre, er et udtryk for at nutidens elever er klar til at lære vigtige færdigheder, som de får brug for i det 21. århundrede. Du kan også være med.

**Kontakt:** [Dit navn], [Titel]

**Hvornår:** [Dato og tidspunkt for din begivenhed]

**Hvor:** [Adresse og kørselsvejledning]

Jeg ser frem til at høre fra dig.

<a id="parents"></a>

## Fortæl forældrene om skolens arrangement:

Kære forældre,

Vi lever i en verden omgivet af teknologi. Og vi ved, at uanset hvilket vej vores elever vælger at gå senere hen, vil det være væsentligt for dem at have en forståelse af hvordan teknologien fungerer. Men kun relativt få af os lærer i øjeblikket at programmere, og færre studerende vælger den vej end for et årti siden.

Det er blandt andet derfor hele vores skole deltager i den største læringsbegivenhed nogensinde: Hour of Code, i Computer Science Education Week (8.-14. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Vores Hour of Code er et udtryk for, at [skolens navn] er klar til at undervise i disse grundlæggende færdigheder i det 21. århundrede. For fortsat at kunne sikre fokus på vigtigheden af programmeringsfærdigheder for eleverne, vil vi gerne gøre vores Hour of Code begivenhed til noget stort - noget der kan huskes. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Dette er et skridt på vejen til at ændre uddannelse i [bynavn].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Med venlig hilsen

Din skoleleder

<a id="politicians"></a>

## Inviter en lokal politiker til din skoles begivenhed:

Kære [borgmester/byrådsmedlem/navn]:

Vidste du, at antallet af it-arbejdspladser langt overstiger de studerende som uddannes indenfor feltet? Og at kendskab til it og programmering er grundlæggende for *alle* brancher i dag. Yet most of schools don’t teach it. På [skolens navn] forsøger vi at ændre dette.

Det er blandt andet derfor hele vores skole deltager i den største læringsbegivenhed nogensinde: Hour of Code, i Computer Science Education Week (8.-14. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Jeg skriver for at invitere dig til at deltage i vores Hour of Code begivenhed og tale på vores kickoff for arrangementet. Det finder sted på [dato, tid, sted], og vil være et godt udtryk for, at [bynavn] er klar til at støtte op om at sikre vores elever grundlæggende færdigheder, som de får brug for i det 21. århundrede. Vi vil at vores elever skal være medskabere og ikke blot forbrugere af fremtidens teknologi.

Venligst kontakt mig på [telefon nummer eller E-mail adresse]. Jeg ser frem til dit svar.

Med venlig hilsen, [navn], [Titel]

<%= view :signup_button %>