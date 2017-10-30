---
title: '<%= hoc_s(:titlu_resurse) %>'
layout: larg
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Promoveaza evenimentul Hour of Code

## Organizezi o Ora de Programare? [Iata ghidul cu indrumari](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Afișați aceste postere în școala dvs

<%= view :promote_posters %>

<a id="social"></a>

## Postați acestea pe rețelele sociale

[![imagine](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imagine](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imagine](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Utilizati logo-ul Hour of Code pentru a răspândi vestea

[![imagine](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Descarcati variantele cu rezoluție mare](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Orice trimitere la "Hour of Code" trebuie facută într-un mod care nu sugerează că este propriul dumneavoastră brand, ci mai degrabă recomandă Hour of Code ca o mişcare/ identitate de bază.
    
    - Exemplu corect: "Participa la Hour of Code la ACMECorp.com". 
    - Exemplu negativ: "Încercaţi Ora de Programare de ACME Corp".
2. Utilizează un exponent "TM" în locurile cele mai proeminente în care menționezi "Hour of Code", atât pe site-ul tău de web cât şi în descrierea aplicației.
3. Includeți limba pe pagina (sau în subsol), inclusiv link-uri către CSEdWeek şi Code.org, care spun următoarele:
    
    *"Hour of Code este o iniţiativă internațională a Computer Science Education Week[csedweek.org] şi Code.org [code.org] pentru a iniția milioane de studenţi în tehnologia computerelor și în programare cu ajutorul unei ore globale de programare."*

4. A nu se utiliza "Hour of Code"/Ora de Programare în nume de aplicații.

<a id="stickers"></a>

## Imprima aceste autocolante pentru le imparti elevilor

(Autocolante sunt 1" diametru, 63 pe foaie)  
[![imagine](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Trimiteți aceste emailuri pentru a ajuta la promovarea Orei de Programare

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

Computerele sunt peste tot, schimbă fiecare industrie pe planeta. Dar mai puţin de jumătate din toate şcolile predau astazi stiinta calculatoarelor. Good news is, we’re on our way to change this! Daca ati auzit şi inainte de Hour of Code, atunci stiti ca a facut istorie. Mai mult de 100 de milioane de studenţi au încercat o Ora de Programare.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. S-au adunat peste 100 de parteneri pentru a susține această mișcare. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Împăștiați vestea. Găzduiți un eveniment. Cereți unei școli locale să se înscrie. Sau încercați chiar dvs. Ora de Programare -- oricine poate beneficia din învățarea noțiunilor de bază.

Începeți la http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

### Invitați mass-media la evenimentul dvs:

**Linia de titlu:** O școală se alătură misiunii de a iniția 100 milioane de elevi în Informatică

Computerele sunt peste tot, schimbă fiecare industrie pe planetă, dar mai putin de jumătate dintre şcoli predau informatica. Fete şi minorităţile sunt grav slab reprezentate în clasele de ştiinţă calculator şi în industria de tehnologie. Vestea bună e că suntem pe cale să schimbăm acest lucru.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. S-au adunat peste 100 de parteneri pentru a susține această mișcare. Fiecare magazin Apple din lume a găzduit o Oră de Programare. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Vă rugăm să vă alăturaţi.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### Spuneți-le părinţilor despre evenimentul şcolii dumneavoastră:

**Subject line:** Our students are changing the future with an Hour of Code

Dragi părinți,

Trăim într-o lume a tehnologiei. Şi noi ştim că oricare ar fi domeniul pe care elevii noştri aleg să continue ca adulţi, capacitatea lor de a reuşi va depinde tot mai mult de înţelegerea modului în care funcţionează tehnologia.

Dar numai o mica parte dintre noi suntem învațați **cum** funcţionează tehnologia. Numai 1 în fiecare patru şcoli predau informatica.

Acesta este motivul pentru care întraga noastră școală se alătură celui mai amplu eveniment educațional din istorie: Ora de Programare, pe parcursul Săptămânii Educatiei in Tehnologia Computerelor. Peste 100 milioane de elevi din toata lumea au încercat deja o Ora de Programare.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. Pentru a continua aducerea unor activități de programare pentru elevi, vrem să avem propriul nostru eveniment uriaș Ora de Programare. Vă incurajez sa fiți voluntari, să ajungeți catre mass-media locală si sa distribuiti veştile pe canalele social media. Luați in considerare si organizarea unor evenimente adiționale în comunitate.

Aceasta este o şansă de a schimba viitorul educaţiei în [nume oraş/oraş].

Pentru detalii, vedeți http://hourofcode.com/<%= @country %> și ajutați la raspandirea veștii.

Cu stimă,

[Nume Profesor/ Director]

<a id="politicians"></a>

### Invitați un politician local la evenimentul şcolii dumneavoastră:

**Subject line:** Join our school as we change the future with an Hour of Code

Stimate [numele primarului/consilierului/senatorului]:

Ştiai că tehnologia computerelor este sursa #1 a salariilor în Statele Unite.? Există mai mult de 500.000 de joburi deschise in It la nivel national, dar anul trecut doar 42.969 de studenţi au absolvit în forţa de muncă.

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

Acesta este motivul pentru care întraga noastră școală se alătură celui mai amplu eveniment educațional din istorie: Ora de Programare, pe parcursul Săptămânii Educatiei in Tehnologia Computerelor. Peste 100 milioane de elevi din toata lumea au încercat deja o Ora de Programare.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. Vrem să ne asiguram că elevii noştri sunt în primul plan prvind crearea tehnologiei de viitor--nu doar consumatorii ei.

Vă rugăm să mă contactaţi la [telefon număr sau adresă de E-mail]. Aştept cu nerăbdare răspunsul dumneavoastră.

Cu stimă,

[NAME], [TITLE]

<%= view :signup_button %>