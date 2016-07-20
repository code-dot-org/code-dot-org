* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promoot het CodeUur

## Een CodeUur hosten? [ Zie de how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Hang deze posters in je school

<%= view :promote_posters %>

<a id="social"></a>

## Post dit op sociale media

[![afbeelding](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![afbeelding](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![afbeelding](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Gebruik het logo van CodeUur om het woord te verspreiden

[![afbeelding](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Download Hi-res versies](http://images.code.org/share/hour-of-code-logo.zip)

**"CodeUur" is een handelsmerk. We willen het gebruik niet voorkomen, maar we willen ervoor zorgen dat het past binnen een paar grenzen:**

  1. Elke verwijzing naar "Uur Code" moet worden gebruikt op een zodanige manier deze niet suggereert dat het uw eigen merknaam is, maar dient te verwijzen naar het Uur Code als een organisatie. Goed voorbeeld: "Neem deel aan het CodeUur op ACMECorp.com". Slecht voorbeeld: "Probeer CodeUur door ACME Corp".
  2. Gebruik een "TM" superscript op de meest prominente plaatsen waar u "CodeUur" opnoemt, zowel op uw website en app beschrijvingen.
  3. Plaats op uw pagina (of in de de voettekst) de volgende tekst, waaronder koppelingen naar de websites van CSEdWeek en Code.org, met de volgende inhoud:
    
    *"Het 'Hour of Code' is een wereldwijd initiatief van de Computer Science Education Week[csedweek.org] en Code.org [code.org] om miljoenen studenten te laten kennismaken met één uur van informatica en programmeren."*

  4. Geen gebruik van "CodeUur" in app namen.

<a id="stickers"></a>

## Print deze stickers om ze aan de leerlingen te geven

(Stickers zijn 1" diameter, 63 per vel)  
[![afbeelding](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Stuur deze e-mails om het Uur Code te promoten

<a id="email"></a>

## Vraag uw school, werkgever of vrienden zich aan te melden:

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. Het goede nieuws is, we zijn op weg om dit te veranderen. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

Dankzij het CodeUur, is programmering op homepages gekomen van Google, MSN, Yahoo! en Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Ga aan de slag op http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Vraag de media uw evenement bij te wonen:

**Onderwerp:** Lokale scholen doen mee met de missie om 100 miljoen leerlingen kennismaken te laten maken met programmering

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Het goede nieuws is, we zijn op weg om dit te veranderen.

Dankzij het CodeUur, is programmering op homepages gekomen van Google, MSN, Yahoo! en Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

Ik nodig je uit om de aftrap bij te wonen en om uw kinderen de activiteit te zien starten op [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Doe alsjeblieft mee.

**Contact:** [YOUR NAME], [TITLE], telefoonnummer

**Wanneer:** [Datum en tijd van uw evenement]

**Waar:** [Adres en routebeschrijving]

Ik kijk uit naar onze kennismaking.

<a id="parents"></a>

## Vertel ouders over het evenement op je school:

Beste ouders,

We leven in een wereld omringd door technologie. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Nodig een politicus uit voor het evenement op jouw school:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]