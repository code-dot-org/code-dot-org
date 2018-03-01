---
title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Spropaguj Hodinu Kódu

## Organizujete Hodinu Kódu? [Pozrite si návod Ako na to](%= resolve_url('/how-to') %)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Vyveste tieto plagáty na svojej škole

<%= view :promote_posters %>

<a id="social"></a>

## Prispejte na sociálne média

[![obrázky](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![obrázky](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![obrázky](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Použite logo Hodinu Kódu pre šírenie jeho myšlienky

[![obrázky](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Stiahnite si verziu vo vysokom rozlíšení](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" je chráneným označením. Nechceme zabrániť jeho používaniu, ale chceme zabezpečiť, aby sa používalo správnym spôsobom:**

1. Akýkoľvek odkaz na "Hour of Code" sa má používať spôsobom, ktorý nenaznačuje, že to je Vaša vlastná značka, ale skôr odkazuje na Hodinu Kódu ako hnutie. **Správne použitie: "Zúčastnite sa Hour of Code™ v ACMECorp.com". Nesprávne použitie: "Vyskúšajte Hour of Code od ACME Corp".**
2. Použite "TM" superskript pri výraznom používaní pojmu "Hour of Code" na webe i v popisoch aplikácií.
3. Include language on the page (or in the the footer), including links to the CSEdWeek and Code.org web sites, that says the following:
    
    *“The 'Hour of Code™' je celonárodné hnutie Týždňa výučby informatiky v USA[csedweek.org] a Code.org[code.org] s cieľom uviesť miliónom študentov začiatky informatiky a programovania.”*

4. Nepoužívajte "Hour of Code" v názvoch programov a aplikácií.

<a id="stickers"></a>

## Vytlačte si tieto nálepky a rozdajte ich Vašim študentom

(Nálepky majú priemer 2,54cm a je ich 63 na jednej strane)  
[![obrázky](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Pošlite tieto emaily ako podporu pri propagovaní Hodiny Kódu

<a id="email"></a>

### Požiadajte Vašu školu, zamestnávateľa alebo priateľov, aby sa prihlásili:

**Predmet:** Pridajte sa ku mne a viac než 100 miliónom študentov v Hodine Kódu

Počítače sú všade a menia každé jedno odvetvie na tejto planéte. Avšak len na menej než polovici škôl sa učí informatika. Dobrou správou je, že sme na ceste tento stav zmeniť! Ak ste už predtým počuli o Hodine Kódu, možno už viete, že zmenila históriu. Viac ako 100 miliónov študentov po celom svete už absolvovalo Hodinu Kódu.

Vďaka Hodine Kódu, informatika bola na predných stránkach Googlu, MSN, Yahoo! a Disney. Viac ako 100 partnerov sa pridalo pre podporu tohto hnutia. Každý Apple Store na svete organizoval Hodinu Kódu a lídri ako Prezident Obama a kanadský premiér Justin Trudeau napísali prvé riadky kódu ako súčasť kampane.

Tento rok to spravme ešte vo väčšom štýle. Chcem Vás požiadať o pripojenie sa k Hodine Kódu 2017. Zapojte sa prosím do Hodiny Kódu počas Týždňa výuky informatiky, <%= campaign_date('full') %>.

Rozšírte slovo. Zorganizujte podujatie. Požiadajte miestnu školu, aby sa zapojila. Alebo sami vyskúšajte hodinu kódu - každý môže mať úžitok, keď sa naučí základy.

Začnite na http://hourofcode.com/<%= @country %>

<a id="help-schools"></a>

### Dobrovoľník na škole:

**Predmet:** Môžeme Vám pomôcť zorganizovať Hodinu Kódu?

Počas 4-10 decembra bude desať percent študentov na celom svete oslavovať týždeň výučby informatiky zapojením sa do podujatií Hodiny Kódu na ich škole. Je to možnosť pre každé dieťa naučiť sa, ako fungujú technológie okolo nás.

[Naša organizácia/moje meno] by sme chceli pomôcť [názov školy] zorganizovať Hodinu Kódu. Môžeme pomôcť učiteľom zorganizovať Hodinu Kódu v ich triede (nepotrebujeme počítače!) alebo pozvať rečníka, aby pred školským plénom povedal niečo o fungovaní technológií a aké je to byť programátorom.

Študenti si vytvoria vlastné aplikácie alebo hry, ktoré môžu ukázať svojim rodičom a takisto vytlačíme certifikáty o absolvovaní Hodiny Kódu, ktoré môžu priniesť domov. Zároveň je to zábava! Interaktívnymi a osobnými aktivitami sa študenti naučia syntaktickému mysleniu prístupnou formou.

Počítače sú všade a menia každé jedno odvetvie na tejto planéte. Avšak len na menej než polovici škôl sa učí informatika. Dobrou správou je, že sme na ceste tento stav zmeniť! Ak ste už predtým počuli o Hour of Code, možno viete, že sa zapísala do histórie - viac ako 100 miliónov študentov po celom svete absolvovalo Hodinu Kódu.

Vďaka Hodine Kódu, informatika bola na predných stránkach Googlu, MSN, Yahoo! a Disney. Viac ako 100 partnerov sa pridalo pre podporu tohto hnutia. Každý Apple Store na svete organizoval Hodinu Kódu a lídri ako Prezident Obama a kanadský premiér Justin Trudeau napísali prvé riadky kódu ako súčasť kampane.

O podujatí si môžete prečítač na http://hourofcode.com/. Alebo nám dajte vedieť, ak chcete zorganizovať diskusiu o možnostiach účasti [názov školy].

Ďakujeme!

[Vaše meno], [Vaša spoločnosť]

<a id="media-pitch"></a>

### Pozvite média, aby sa zúčastnili Vášho podujatia:

**Predmet:** Miestne školy sa účastnia misie uviesť študentov do informatiky

Počítače sú všade a menia každé odvetvie na tejto planéte, no len menej než polovica všetkých škôl vyučuje informatiku. Dievšatá a menšiny sú zastúpené veľmi malým podielom na hodinách informatiky i v IT odvetví. Dobrou správou je, že sme na ceste tento stav zmeniť.

Vďaka Hodine Kódu, informatika bola na predných stránkach Googlu, MSN, Yahoo! a Disney. Viac ako 100 partnerov sa pridalo pre podporu tohto hnutia. Dokonca aj Apple Store vo svete organizovali Hodiny Kódu. Aj prezident Obama napísal svoj prvý riadok kódu v rámci tejto kampane.

Aj to je dôvod, prečo sa každý jeden z [číslo] študentov na [NÁZOV ŠKOLY] pripája k najväčšej školskej hodine v histórií: Hodiny Kódu počas Týždňa výuky informatiky (<%= campaign_date('full') %>).

Týmto Vás pozývam na účasť na našom úvodnom stretnutí, aby ste mohli sledovať deti priamo v akcií dňa [DATE].

Hodina Kódu organizovaná neziskovou organizáciou Code.org a viac než 100 ďaľšími partnermi je globálne hnutie veriace, že dnešní študenti sú prípravení naučiť sa zručnosti kritické pre úspech v 21 storočí. Pridajte sa prosím k nám.

**Kontakt:** [VAŠE MENO], [TITLE], mobil: (212) 555-5555 **Kedy:** [DÁTUM a ČAS Vášho podujatia] **Kde:** [ADRESA and INŠTRUKCIE]

Teším sa na našu ďaľšiu komunikáciu.

[Vaše meno]

<a id="parents"></a>

### Povedzte rodičom o školskom podujatí:

**Predmet:** Naši študenti menia budúcnosť s Hodinou Kódu

Vážení rodičia,

Žijeme vo svete obklopenom technológiami. A vieme, že akékoľvek odvetie si naši študenti vyberú v dospelosti, ich schopnosť uspieť bude čoraz viac závisieť na pochopení, ako fungujú technológie.

Ale len malá časť z nás sa učí **ako** technológie fungujú. Menej než polovica našich škôl vyučuje informatiku.

Preto sa celá naša škola pripája k najväčšej školskej hodine v histórií: Hodiny Kódu počas Týždňa výuky informatiky (<%= campaign_date('full') %>). Viac ako 100 miliónov študentov po celom svete už absolvovalo Hodinu Kódu.

Naša Hodina Kódu zdôrazňuje, že [NÁZOV ŠKOLY] je pripravená naučiť tieto základné zručnosti 21. storočia. Aby sme mohli prinášať hodiny programovania Vašim deťom, chceme spraviť naše podujatie vo veľkom štýle. Veľmi uvítam Vašu účasť, poskytnutie kontaktov na média, zdieľanie noviniek na sociálnych sietiach a dokonca aj zorganizovanie ďaľších podujatí Hodiny Kódu vo Vašej komunite.

Toto je šanca zmeniť budúcnosť vzdelávania v [NÁZOV MESTA/OBCE].

Navštívte http://hourofcode.com/<%= @country %> pre viac detailov a pomôžte šíriť túto myšlienku.

S pozdravom,

Váš riaditeľ

<a id="politicians"></a>

### Pozvite miestneho politika na akciu Vašej školy:

**Predmet:** Pridajte sa k našim školám a zmeňte budúcnosť s Hodinou Kódu

Vážený [Starosta/Primátor/Župan/Poslanec PRIEZVISKO]:

Vedeli ste, že počítače sú zdrojom príjmov číslo 1 v USA? V IT odvetví je množstvo otvorených pozícií, no počet absolventov, ktorí ročne ukončia štúdium informatiky nedokáže pokryť dopyt po nich.

Informatika je dnes základom pre *KAŽDÉ* odvetvie, no veľa škôl ju nevyučuje v dostatočnom rozsahu. Na [NÁZOV ŠKOLY] sa to snažíme zmeniť.

Preto sa celá naša škola pripája k najväčšej školskej hodine v histórií: Hodiny Kódu počas Týždňa výuky informatiky (<%= campaign_date('full') %>). Viac ako 100 miliónov študentov po celom svete už absolvovalo Hodinu Kódu.

Dovoľujem si Vás týmto požiadať o účast na našej Hodine Kódu, kde môžete prehovoriť na našom úvodnom zhromaždení. Bude sa konať [DÁTUM, MIESTO, ČAS] a vyšle jasný signál, že [Mesto, Obec] je pripravená učiť našich študentov kritické schopnosti 21. storočia. Chceme mať istotu, že naši študenti budú na čele tvorby technológií v budúcnosti, nielen jej konzumenti.

Kontaktujte ma prosím na [TELEFÓNNE ČÍSLO, E-MAILOVÁ ADRESA]. Teším sa na Vašu odpoveď.

S pozdravom,

[Vaše meno], [Title]

<%= view :signup_button %>