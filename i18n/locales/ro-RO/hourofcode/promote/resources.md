* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promoveaza evenimentul Hour of Code

## Organizezi o Ora de Programare? [Iata ghidul cu indrumari](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Afișați aceste postere în școala dvs.

<%= view :promote_posters %>

<a id="social"></a>

## Postați acestea pe rețelele sociale

[![imagine](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imagine](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imagine](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Utilizati logo-ul Hour of Code pentru a răspândi vestea

[![imagine](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Descarcati variantele cu rezoluție mare](http://images.code.org/share/hour-of-code-logo.zip)

**"Ora de cod" este marcă înregistrată. Nu vrem să prevenim utilizarea acesteia, dar vrem să ne asigurăm că se plasează în câteva limite:**

  1. Orice trimitere la "Hour of Code" trebuie facută într-un mod care nu sugerează că este propriul dumneavoastră brand, ci mai degrabă recomandă Hour of Code ca o mişcare/ identitate de bază. Exemplu corect: "Participa la Hour of Code la ACMECorp.com". Exemplu negativ: "Încercaţi Ora de Cod de ACME Corp".
  2. Utilizează un exponent "TM" în locurile cele mai proeminente în care menționezi "Hour of Code", atât pe site-ul tău de web cât şi în descrierea aplicației.
  3. Includeți limba pe pagina (sau în subsol), inclusiv link-uri către CSEdWeek şi Code.org, care spun următoarele:
    
    *"Hour of Code este o iniţiativă internațională a Computer Science Education Week[csedweek.org] şi Code.org [code.org] pentru a iniția milioane de studenţi în tehnologia computerelor și în programare cu ajutorul unei ore globale de programare."*

  4. A nu se utiliza "Hour of Code"/Ora de Cod în nume de aplicații.

<a id="stickers"></a>

## Imprima aceste autocolante pentru le imparti elevilor

(Autocolante sunt 1" diametru, 63 pe foaie)  
[![imagine](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Trimiteți aceste emailuri pentru a ajuta la promovarea Orei de Programare

<a id="email"></a>

## Cereți școlii, angajaților sau prietenilor să se înscrie:

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. Vestea bună e că suntem pe cale să schimbăm acest lucru. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

In cadrul Hour of Code, tehnologia computerelor si programarea a fost pe prima pagina a site-urilor Google, MSN sau Yahoo! și Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Începeți la http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Invitați mass-media la evenimentul dvs.:

**Linia de titlu:** O școală se alătură misiunii de a iniția 100 milioane de elevi în Informatică

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Vestea bună e că suntem pe cale să schimbăm acest lucru.

In cadrul Hour of Code, tehnologia computerelor si programarea a fost pe prima pagina a site-urilor Google, MSN sau Yahoo! și Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

Vă scriu pentru a vă invita să participați la reuniunea noastră de impact și să vedeți cum încep copiii această activitate pe data de [DATA].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Vă rugăm să vă alăturaţi.

**Contact:** [NUMELE DVS.], [TITLE], telefon: (212) 555-5555

**Când:** [DATA şi TIMPUL pentru evenimentul dvs.]

**Unde:** [ADDRESA și DIRECTII]

Aştept cu nerăbdare să comunicăm.

<a id="parents"></a>

## Spuneți-le părinţilor despre evenimentul şcolii dumneavoastră:

Dragi părinți,

Trăim într-o lume a tehnologiei. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Invitați un politician local la evenimentul şcolii dumneavoastră:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]