* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Heng opp disse plakatene på din skole

<%= view :promote_posters %>

<a id="social"></a>

## Post these on social media

[![bilde](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![bilde](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![bilde](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![bilde](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

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
[![bilde](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Send disse e-postene for å promotere Kodetimen

<a id="email"></a>

## Be om at skole, arbeidgiver eller venner registrerer seg:

Datamaskiner er overalt, men færre skoler underviser i informatikk nå enn for 10 år siden. De gode nyhetene er at vi jobber for å endre dette. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! og Disney, Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Snakk om det! Lag et arrangement! Be din skole om å melde seg på! Eller prøv Kodetimen selv! Alle kan ha nytte av å lære det grunnleggende.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Inviter media til å dekke arrangementet:

**Subject line:** Local school joins mission to introduce students to computer science

Datamaskiner er overalt, men færre skoler underviser data nå enn for 10 år siden. Jenter og minoriteter er sterkt underrepresentert. Den gode nyheten er at nå skal det bli en forandring.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! og Disney, Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Jeg vil invitere deg til å delta bli med og se barna starte aktiviteten den [dato].

Kodetimen er organisert av den ideelle organisasjonen Code.org og over 100 andre anser at det er nødvendig at dagens elever må lære seg kritiske ferdigheter for å lykkes i fremtiden. Vennligst bli med oss.

**Kontakt:** [Ditt navn], [tittel], mobil: 55 55 55 55

**Når:** [Dato og klokkeslett for hendelsen]

**Hvor:** [Adresse og veibeskrivelse]

Jeg ser frem til å snakke med dere.

<a id="parents"></a>

## Informere foreldrene om skolens arrangement:

Kjære foreldre!

Vi lever i en verden omgitt av teknologi. Og vi vet at uansett hvilket område våre elever vil satse på som voksne, vil deres evne til å lykkes være avhengig av at de forstår hvordan teknologi fungerer. Men bare en lite brøkdel av oss lærer informatikk, og ferre studerer velger det nå enn for ti år siden.

Derfor vil hele skolen våren bli med på det største lærearrangementet i historien: Kodetimen som arrangeres 8. til 14. desember. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Vår Kodetime er et uttrykk for at [navn på skole] er opptatt av å lære eleven ferdigheter for framtida. For at våre elever skal fortsette med programmering, så vil vil lage Kodetimen til et stort arrangement. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Dette er en mulighet til å forande innholdet i skolene i [navn på sted eller by].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Vennlig hilsen

Rektor

<a id="politicians"></a>

## Inviter en lokalpolitiker til skolens arrangement:

Kjære [ordfører/bystyrerepresentant Etternavn]:

Visste du at i dagens arbeidsliv er det tre ganger så mange ledige IT-jobber som uteksaminerte kandidater innen fagområdet? Og programmering er i dag viktig for *alle* bransjer. Yet most of schools don’t teach it. På [navn på UTDANNINGSINSTITUSJON] prøver vi å endre på dette.

Derfor vil hele skolen våren bli med på det største lærearrangementet i historien: Kodetimen som arrangeres 8. til 14. desember. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Jeg skriver for å invitere deg til å delta i vårt arrangement Kodetimen og holde en apell ved åpningen. Det vil foregå på [dato, tidspunkt, sted], og vil gi et viktig signal om at [delstat eller byen navn] vil lære elvene viktige ferdighetene for det 21. århundret. Vi ønsker å sikre at våre elever går i bresjen med å skape teknologi for fremtiden og ikke bare forbruker den.

Vennligst kontakt meg på [telefon eller epost]. Jeg ser frem til å høre fra deg.

Med vennlig hilsen [navn], [tittel]

<%= view :signup_button %>