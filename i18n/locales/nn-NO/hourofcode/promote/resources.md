* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Heng opp desse plakatane på skulen din

<%= view :promote_posters %>

<a id="social"></a>

## Post desse i sosiale media

[![Bilete](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![Bilete](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![Bilete](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![Bilete](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. En hver referanse til «Kodetimen» burde bli brukt på en slik måte at det ikke tyder på at det er ditt eget merkenavn, men heller reffererer til Kodetimen som en grasrotbevegelse. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Inkluder språk på siden (eller som bunntekst), inkluder lenker til CSEdWeek og Code.org sidene, som sier det følgende:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![Bilete](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Send desse e-postane for å promotere Kodetimen

<a id="email"></a>

## Be skulen, arbeidsgivaren eller vener om å registrere seg:

Datamaskiner er overalt, men færre skular underviser i programmering no enn for 10 år sidan. Den gode nyheita er at me arbeider for å endre dette. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! og Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Spre ordet. Arranger ei hending. Spør ein lokal skule om å registrere seg. Eller prøv Kodetimen sjølv – alle kan ha nytte av grunnleggjande programmering.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Inviter media til å dekke arrangementet:

**Subject line:** Local school joins mission to introduce students to computer science

Datamaskiner er over alt, men færre skular underviser i data no enn for 10 år sidan. Jenter og minoritetar er sterkt underrepresenterte. Den gode nyheita er at det no skal bli ei forandring på dette.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! og Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Eg inviterer deg herved til å delta på vårt kickoff, for å sjå ungane setje i gang den [DATE].

Kodetimen, organisert av nonprofitt-organisasjonen Code.org, og over 100 andre selskap, anser at det er nødvendig at dagens elevar må lære seg ferdigheiter som er kritiske for å lukkast i framtida. Vennligst bli med oss.

**Kontakt:** [Ditt namn], [TITLE], telefon: 55 55 55 55

**Når:** [Dato og klokkeslett]

**Kvar:** [Adresse og vegbeskriving]

Eg ser fram til å høyre frå dykk.

<a id="parents"></a>

## Fortel foreldre om skulen sitt arrangement:

Kjære foreldre,

Me lever i ei verd omringa av teknologi. Og me veit at kvar enn elevane velgjer å gjere som vaksne, er evna til å lukkast knytta til deira forståing av korleis teknologi fungerar. Men kun ein brøkdel lærer om datavitskap, og endå færre elevar studerar det no enn for berre eit tiår sidan.

Difor deltek skulen vår på det største arrangementet i undervisningshistoria: Kodetimen, under Computer Science Education Week (8.-14. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Vår Kodetime er eit uttrykk for at [SCHOOL NAME] er klar for å lære vekk desse grunnleggjande framtidsferdigheitene. For å halde fram med å skape programmeringsaktivitetar for elevane har me lyst til å gjere Kodetimen-arrangementet stort. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Dette er ein sjanse til å ta utdanningsframtida i våre hender her i [kommune/by/stad].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Med venleg helsing,

Rektor

<a id="politicians"></a>

## Inviter ein lokalpolitikar til skulens arrangement:

Kjære [Ordførar/bystyrerepresentant/Namn]:

Visste du at det i dag er tre gongar så mange programmeringsjobbar som det er studentar innan feltet? Og at programmering er grunnleggjande for *alle* bransjar? Yet most of schools don’t teach it. Her på [SCHOOL NAME], forsøker me å endre på dette.

Difor deltek skulen vår på det største arrangementet i undervisningshistoria: Kodetimen, under Computer Science Education Week (8.-14. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Eg skriver til deg for å invitere deg til å delta i vårt Kodetime-arrangement, og til å snakke på vår kickoff. Det finn stad på [DATE, TIME, PLACE], og vil vere eit kraftig signal om at [kommune/by/stad] vil lære elevane viktige ferdigheiter for framtida. Me ynskjer å sikre at våre studentar er i forkant av framtidas teknologiutvikling – ikkje berre forbrukarar av det.

Venligst ta kontakt med meg på [telefon eller epost]. Eg ser fram til å høyre frå deg.

Med venleg helsing, [NAME], [TITLE]

<%= view :signup_button %>