* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promujte Hodinu kódu

## Organizujete Hodinu kódu? [Podívejte se na příručku](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Tyto plakáty vyvěste ve své škole

<%= view :promote_posters %>

<a id="social"></a>

## Publikujte na sociálních sítích

[![obrázek](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![obrázek](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![obrázek](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Používejte logo Hodiny kódu

[![obrázek](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Stáhněte hi-res verzi](http://images.code.org/share/hour-of-code-logo.zip)

**"Hodina kódu" je obchodní značka. My nechceme zastavit její používání, ale chceme, aby byla udržena pod pár limity:**

  1. Jakýkoliv odkaz na "Hodinu kódu" by se měl používat způsobem, který nenaznačuje, že je to vaše vlastní značka, ale spíše odkazuje na Hodinu kódu jako základní hnutí. Dobrý příklad: "Účastněte se Hodiny kódu v ACMECorp.com". Špatný příklad: " Vyzkoušejte Hodina Kódu od ACME korporace".
  2. Použijte "TM" v místech kde nejvíce jde vidět "Hodina kódu", jak na vaší webové stránce, tak v popisu aplikace.
  3. Dodržte styl na stránce (nebo zápatí), včetně odkazů na webové stránky CSEdWeek a Code.org s následujícím obsahem:
    
    *“'Hour of Code™' (hodina kódu) je národní iniciativa utvořená z Computer Science Education Week\[csedweek.org\] (Týden informatiky) a Code.org[code.org] za účelem úvodu do jedné hodiny informatiky a programování pro miliony studentů.”*

  4. Zákaz používání "Hodina kódu" v názvech aplikace.

<a id="stickers"></a>

## Vytiskněte tyto nálepky pro vaše studenty

(Nálepky jsou 1" průměr, 63 v každém listu)  
[![obrázek](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Propagujte Hodinu kódování odesláním těchto e-mailových zpráv

<a id="email"></a>

## Poproste svou školu, zaměstnavatele nebo přátele, aby se přihlásili:

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. Dobrou zprávou je, že jsme na cestě, jak to změnit. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

S Hodinou kódu, informatika byla na úvodních stránkách Googlu, MSN, Yahoo! a Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Začnite na http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Pozvěte k účasti na své akci média:

**Linka předmětu:** Místní školy se připojují do misí, aby mohli představit informatiku studentům

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Dobrou zprávou je, že jsme na cestě, jak to změnit.

S Hodinou kódu, informatika byla na úvodních stránkách Googlu, MSN, Yahoo! a Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

Píši Vám, abychom Vás pozvali k účasti na úvodním shromáždění a abyste viděli, jak se děti [DATE] pouštějí do činnosti.

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Přidejte se k nám.

**Kontakt:** [JMÉNO A PŘÍJMENÍ], [TITLE], mobil: (212) 555-5555

**Kdy:** [DATUM a ČAS vaší události]

**Kde:** [ADRESA a POPIS CESTY]

Těším se, že zůstaneme ve spojení.

<a id="parents"></a>

## Řekněte rodičům o své školní události:

Vážení rodiče,

Žijeme ve světě obklopeném technologiemi. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Pozvěte na svoji školní událost místního politika:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]