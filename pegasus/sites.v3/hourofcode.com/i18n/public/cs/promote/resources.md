---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

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

[![obrázek](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. Jakýkoliv odkaz na "Hodinu kódu" by se měl používat způsobem, který nenaznačuje, že je to vaše vlastní značka, ale spíše že odkazuje na Hodinu kódu jako základní hnutí. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Dodržte styl na stránce (nebo zápatí), včetně odkazů na webové stránky CSEdWeek a Code.org s následujícím obsahem:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Vytiskněte tyto nálepky pro vaše studenty

(Stickers are 1" diameter, 63 per sheet)  
[![obrázek](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Propagujte Hodinu kódování odesláním těchto e-mailových zpráv

<a id="email"></a>

## Poproste svou školu, zaměstnavatele nebo přátele, aby se přihlásili:

Počítače jsou všude, ale dnes vyučuje informatiku méně škol než tomu bylo před 10 lety. Dobrou zprávou je, že jsme na cestě, jak to změnit. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! a Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Dostanete slovo. Hostit akci. Požádejte místní školu, aby se přihlásila. Nebo zkuste Hodinu kódu sami – každý může využívat výhody se naučit základům.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Pozvěte k účasti na své akci média:

**Subject line:** Local school joins mission to introduce students to computer science

Počítače jsou všude, ale dnes vyučuje informatiku méně škol než tomu bylo před 10 lety. Dívky a menšiny jsou nedostatečně zastoupeny. Dobrou zprávou je, že jsme na cestě změnit to.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! a Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Píši Vám, abychom Vás pozvali k účasti na úvodním shromáždění a abyste viděli, jak se děti [DATE] pouštějí do činnosti.

Hodina kódu, pořádaná neziskovou společností Code.org a více než stovkou dalších, je vyjádřením, že dnešní generace studentů je připravena naučit se klíčové dovednosti pro úspěch v 21. století. Přidejte se k nám.

**Kontakt:** [JMÉNO A PŘÍJMENÍ], [TITLE], mobil: (212) 555-5555

**Kdy:** [DATUM a ČAS vaší události]

**Kde:** [ADRESA a POPIS CESTY]

Těším se, že zůstaneme ve spojení.

<a id="parents"></a>

## Řekněte rodičům o své školní události:

Vážení rodiče,

Žijeme ve světě obklopeném technologiemi. A víme, že ať si naši studenti vyberou pro své budoucí povolání jakýkoli obor, jejich schopnost uspět bude čím dál tím víc záviset na porozumění jak takové technologie fungují. Ale jen nepatrný zlomek z nás se učí informatiku, kterou dnes studuje méně studentů než před deseti lety.

To je důvodem, proč se celá naše škola přidává k největší učební události v historii: Hodině kódu, během výukového týdne informatiky 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Naše Hodina kódu je vyjádřením, že [NÁZEV ŠKOLY] je připravena vyučovat základní dovednosti 21. století. Abychom mohli našim studentům přinášet další programovací aktivity, chceme z Hodiny kódu udělat obrovskou akci. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Toto je šance změnit budoucnost výuky v [JMÉNO MĚSTA/OBCE].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Se srdečným pozdravem,

váš ředitel školy

<a id="politicians"></a>

## Pozvěte na svoji školní událost místního politika:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that in today’s economy, computing jobs outnumber students graduating into the field by 3-to-1? And, computer science is foundational for *every* industry today. Yet most of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

To je důvodem, proč se celá naše škola přidává k největší učební události v historii: Hodině kódu, během výukového týdne informatiky 7-13). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future--not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]

<%= view :signup_button %>