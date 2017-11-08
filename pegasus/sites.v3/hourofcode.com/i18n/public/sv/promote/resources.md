---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Marknadsför Hour of Code

## Ska du hålla en Hour of Code? <a href="<%= resolve_url('/how-to') %> Titta på guiden</a>

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Sätt upp dessa affischer på din skola

<%= view :promote_posters %>

<a id="social"></a>

## Posta dessa på sociala medier

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Använd Hour of Code logotypen för att sprida ordet

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Ladda ner högupplösta versioner](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" är varumärkesskyddat. Vi vill inte förhindra denna användning, men vi vill se till att det passar inom några gränser:**

1. Alla hänvisningar till "Hour of Code" bör användas på ett sätt som inte tyder på att det är ditt eget varumärke, hänvisa hellre till Hour of Code som en gräsrotsrörelse. Bra exempel: "Delta i Hour of Code™ på ACMECorp.com". Dåligt exempel: "Prova Hour of Code av ACME Corp".
2. Använd en "TM" upphöjd i de mest framträdande platser du nämner "Hour of Code", både på webbplatsen och i appbeskrivningar.
3. Inkludera språk på sidan (eller i sidfoten), inklusive länkar till webbplatserna CSEdWeek och Code.org, som säger följande:
    
    *"Hour of Code™' är ett rikstäckande initiativ av Computer Science Week[csedweek.org] och Code.org[code.org] för att miljoner elever ska introduceras till en timme av datavetenskap och programmering."*

4. Ingen användning av "Hour of Code" i appnamn.

<a id="stickers"></a>

## Skriv ut dessa klistermärken till dina elever

(Klistermärken är 1" diameter, 63 per ark)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Skicka dessa e-postmeddelanden för att främja Hour of Code

<a id="email"></a>

## Be din skola, arbetsgivare eller vänner att registrera sig:

Datorer finns överallt, och förändrar varje industri på planeten. But fewer than half of all schools teach computer science. Goda nyheter är, vi är på väg att ändra detta. Om du hört talas om Hour of Code, kanske du vet det gjorde historia förra året. Över 100 miljoner elever har provat på Hour of Code.

Med Hour of Code, har datavetenskap har varit på startsidan på Google, MSN, Yahoo! och Disney. Över 100 partners har gått samman för att stödja denna rörelse. Varje Apple Store i världen har varit värd för Hour of Code. President Obama skrev sina första rader kod som en del av kampanjen.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Berätta om det. Håll ett evenemang. Be din lokala skola att registera sig. Eller prova en Hour of Code själv - alla har nytta av att kunna grunderna.

Kom igång på http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Bjud in media att närvara vid evenemanget:

**Ämnesrad:** Lokala skolan går med rörelsen att introducera eleverna till datavetenskap

Dator finns överallt och förändrar allt i vår värld, men färre än hälften av alla skolor lär ut datavetenskap. Tjejer och minoriteter är kraftigt underrepresenterade inom datavetenskap och i den tekniska branschen. Goda nyheter är, vi är på väg att ändra detta.

Med Hour of Code, har datavetenskap har varit på startsidan på Google, MSN, Yahoo! och Disney. Över 100 partners har gått samman för att stödja denna rörelse. Varje Apple Store i världen har varit värd för Hour of Code. President Obama skrev sina första rader kod som en del av kampanjen.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

Jag skriver för att bjuda in dig till vår kick-off och att se när våra elever påbörjar aktiviteterna på [datum].

Hour of Code som organiseras av den ideella föreningen Code.org och över 100 andra partners, är en global rörelse som drivs av övertygelsen att elever är redo för att lära sig de kunskaper som utvecklar dagens samhälle. Please join us.

**Kontakt:** [DITT NAMN], [TITLE], telefon: 212-555 55 55

**När:**[DATUM och TID för ditt event]

**Var:** [ADDRESS and VÄGBESKRIVNING]

I look forward to being in touch.

<a id="parents"></a>

## Berätta för föräldrar om din skolas evenemang:

Kära föräldrar,

We live in a world surrounded by technology. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Fewer than half of all schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Vänliga hälsningar,

Er rektor

<a id="politicians"></a>

## Invite a local politician to your school's event:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]

<%= view :signup_button %>