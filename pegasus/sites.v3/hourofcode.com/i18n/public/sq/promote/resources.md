---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Promovo Orën e Kodimit

## Po organizoni një Orë Kodimi? [ Shikoni udhëzimet](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Vendosni këta posterë në shkollën tuaj

<%= view :promote_posters %>

<a id="social"></a>

## Postojini në mediat sociale

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Përdorni logon e Orës së Kodimit për të përhapur fjalë

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Shkarkoni versionin hi-res](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Çdo referencë për "Orën e Kodimit" duhet të përdoret në një mënyrë që nuk sugjeron që është emri i markës suaj, por më tepër referenca për Orën e Kodimit si një lëvizje bazë.
    
    - Shembull i mire: "Merr pjese ne Oren e Kodimit™ ne ACMECorp.com". 
    - Shembull i keq: "Provo Orën e Kodimit nga ACME Corp".
2. Përdorni një "TM"si indeks të sipërm në vendet më të dukshme që ju përmendni "Orën e Kodimit", në faqen tuaj web dhe në përshkrimet e aplikacionit.
3. Përfshini gjuhën në faqe (ose në fund), duke përfshirë edhe lidhjet me faqet e web-it të CSEdWeek dhe Code.org, që thonë si në vijim:
    
    *"Ora e Kodimit" është një nismë në shkallë vendi nga Java Edukative e Shkencave Kompjuterike[csedweek.org] dhe Code.org [code.org] për të futur miliona studentë për një orë në shkencën kompjuterike dhe programimin kompjuterik. "*

4. Nuk ka përdorimi të "Orës së Kodimit" në emrat e aplikacioneve.

<a id="stickers"></a>

## Printoni këto stiksat për t'ja dhënë studentëve të tu

(Stickers are 1" diameter, 63 per sheet)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Dërgoni këto emaile për të ndihmuar në promovimin e Orës së Kodimit

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

Kompjuterat janë kudo, duke ndryshuar çdo industri në planet. Por më pak se gjysmat e shkollave shpjegojnë shkencën kompjuterike. Good news is, we’re on our way to change this! Nëse keni degjuar për Orën e Kodimit më përpara, ju mund ta dini që ka bërë histori. Më shumë se 100 milion studenta e kanë provuar Orën e Kodimit.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Mbi 100 partnerë morën pjesë për ta përkrahur këtë lëvizje. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Përhapeni fjalën. Organizo eventin. Gjeni një shkollë në afërsi për t'u regjistruar në këtë event ose provojeni vet Orën e Kodimit. Gjithësecili nga ne mund të përfitojë nga këto mësime elementare.

Fillo te http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

### Ftoni mediat të bëhen pjesë e eventit tuaj:

**Subjekti:** Shkolla lokale i bashkohet synimit për të prezantuar studentët me shkencat kompjuterike

Kompjuterat janë kudo, duke ndryshuar çdo industri në planet, por më pak se gjysma e shkollave shpjegojnë shkencat kompjuterike. Vajzat dhe minoritetet janë shumë pak të përfaqësuara në klasat e shkencave kompjuterike dhe në industrinë e teknologjisë. Lajmi i mirë është se jemi në rrugë a sipër për ta ndryshuar këtë.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Mbi 100 partnerë morën pjesë për ta përkrahur këtë lëvizje. Çdo dyqan apple në botë ka zhvilluar një orë kodimi. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Të lutem bashkohu edhe ti.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### Njoftoni prindërit për eventin në shkollën tuaj:

**Subject line:** Our students are changing the future with an Hour of Code

Të dashur prindër,

Jetojmë në një botë të rrethuar nga teknologjia. Dhe ne e dimë se çfarëdo fushe që të zgjedhin nxënësit tanë kur të rriten, aftësia e tyre për të pasur sukses do të varet gjithnjë e më shumë në të kuptuarit se si funksionon teknologjia.

Por vetëm një pjesë e vogël prej nesh janë mësuar **se si punon** teknologjia. Më pak se gjysma e të gjitha shkollave shpjegojnë shkencën kompjuterike.

Kjo është arsyeja se pse e gjithë shkolla jonë po i bashkohet nismës së mësimit më të madhe në histori: Ora e Kodimit, gjatë Javës së Mësimit të Shkencave Kompjuterike (<%= campaign_date('full') %>). Më shumë se 100 milion student në të gjithë botën kanë provuar Orën e Kodimit.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. Duke sjellë aktivitete mbi programimin për nxënësit tuaj, ne synojmë të bëjmë Orën e Kodimit një event madhështor. Ju inkurajojme të bëheni vullnetar, të kontaktoni mediat lokale, të shpërndani lajmin në kanalet e mediave sociale dhe të konsideroni organizimin e një eventi tjetër Ora e Kodimit në komunitetin tuaj.

Ky është një rast për të ndryshuar të ardhmen e edukimit në [VENDI/QYTETI EMRI].

Shihni http://hourofcode.com/<%= @country %> për detaje, ndihmo në përhapjen e fjalës.

Sinqerisht,

Drejtori juaj

<a id="politicians"></a>

### Ftoni një politikan në eventin e shkollës suaj:

**Subject line:** Join our school as we change the future with an Hour of Code

I dashur [Kryetar komune/Guvernator/Përfaqësues/Senator MBIEMRI]:

A e dini se informatika është #1 burimi i të ardhurave në Sh.B.A.? Janë më shumë se 500,000 punë në informatikë në të gjithv vendin, por vitin e fundit vetëm 42,969 studentë u diplomuan në shkenca kompjuterike.

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

Kjo është arsyeja se pse e gjithë shkolla jonë po i bashkohet nismës së mësimit më të madhe në histori: Ora e Kodimit, gjatë Javës së Mësimit të Shkencave Kompjuterike (<%= campaign_date('full') %>). Më shumë se 100 milion student në të gjithë botën kanë provuar Orën e Kodimit.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. Dëshirojmë të ju sigurojmë që nxënësit tanë janë në frontin e parë për zhvillimin teknologjik të së ardhmes e jo vetëm e konsumojnë atë.

Ju lutem të kontaktoni në [NUMRI I TELEFONIT APO ADRESA E EMAILIT]. Në pritje të përgjigjes tuaj.

Sinqerisht,

[NAME], [TITLE]

<%= view :signup_button %>