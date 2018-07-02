---
title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Ilunsad ang Hour of Code

## Nagho-host ng Hour of Code? [Tignan ang gabay kung paano-gawin](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Isabit ang mga posters na ito sa iyong paaralan

<%= view :promote_posters %>

<a id="social"></a>

## Ipaakil ito sa social media

[![larawan](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![larawan](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![larawan](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Gamitin ang logo ng Hour of Code upang maikalat ang balita

[![larawan](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[I-download ang bersiyon ng hi-res](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" ay tinatakan. Ayaw nating na mapigilan ang pag gamit nito, ngunit gusto nating masiguro na ito ay akma sa loob ng ilang limitasyon:**

1. Anumang sanggunian sa "Hour of Code" ay dapat gamitin sa isang fashion na hindi nagmumungkahi na ito ay sarili mong pangalan ang tatak, ngunit sa halip ay sinasanggunian ang Hour of Code tulad ng isang kilusan ng masa. **Magandang halimbawa: "Makilahok sa Hour of Code™ sa ACMECorp.com". Masamang halimbawa: "Subukan ang Hour of Code ACME Corp". **
2. Gamitin ang "TM" superscript sa pinaka kilalang lugar na iyong nabanggiy "Hour of Code", parehas sa iyong web site at mga paglalarawan sa app.
3. Kabilang ang wika na nasa pahina ( o nasa footer), kabilang ang mga link sa CSEdWeek at Code.org web sites, na sinasabi ang sumusunod:
    
    *"Ang 'Hour of Code™' ay buong bansa na inisyatibo ng Computer Science Education Week[csedweek.org] at Code.org[code.org] upang ipakilala sa milyong mga estudyante sa isang oras ng computer science at computer programming."*

4. Walang gamit ang "Hour of Code" sa mga pangalan ng app.

<a id="stickers"></a>

## I-print itong mga stickers para ibigay sa iyong mga estudyante

(Ang mga stickera ay 1" ang lapad, 63 kada piraso)  
[![larawan](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Ipadala itong mga email upang makatulong na ilunsad ang Hour of Code

<a id="email"></a>

### Hilingin sa iyong paaralan, employer, o mga kaibigan na mag-sign up:

**Linya ng paksa:** Sumali sa akin at sa higit sa 100 milyong mga estudyante para sa Hour of Code

Ang mga computer ay nasa lahat ng dako, binabago ang bawat industriya sa planeta. Ngunit mas kunti kaysa sa kalahati ng lahat ng paaralang nagtuturo ng computer science. Ang mabuting balita ay, tayo ay nasa daan na para baguhin ito! Kung narinig mo na ng tungkol sa Hour of Code dati, bak alam mo na gumawa ito ng kasaysayan. Mahigit 100 milyong mga estudyante na sumubok na ng Hour of Code.

Sa Hour of Code, ang computer science ay nasa hompages ng Google, MSN, Yahoo!, at Disney. Mahigit 100 na mga kasosyo ang nagsama-sama upang suportahan itong kilusan. Bawat Apple Store sa buong mundo ay nag-host ng Hour of Code, at mga lider kagaya ni Presidente Obama at Canadian Prime Minister Justin Trudeau ay sumulat ng kanilang unang mga linya ng code bilang bahagi ng kampanya.

Ngayong taon, gawin natin itong mas malaki. I’m asking you to join the Hour of Code <%= campaign_date('year') %>. Mangyaring makisali sa isang Hour of Code na kaganapan sa panahon ng Computer Science Education Week, <%= campaign_date('full') %>.

Kunin ang salita. Mag-host ng kaganapan. Hingin sa lokal na paaralan na mag-sign up. O subukan ng Hour of Code sa iyong sarili—lahat ay maaaring makinabang mula sa mga pangunahing alintuntunin.

Magsimula sa http://hourofcode.com/<%= @country %>

<a id="help-schools"></a>

### Mag-boluntaryo sa paaralan:

**Linya ng paksa:** Matutulungan ba namin kayong mag-host at Hour of Code?

Between <%= campaign_date('short') %>, ten percent of students around the world will celebrate Computer Science Education Week by doing an Hour of Code event at their school. It’s an opportunity for every child to learn how the technology around us works.

[Ating organisasyon/Aking pangalan] ay gustong tumulong sa [pangalan ng paaralan] na magpatakbo ng kaganapan ng Hour of Code. Pwede natin tulungan ang mga guro na mag-host ng Hour of Code sa kanilang mga silid-aralan (hindi natin kailangan ng computer!) o kung nais mong mag-host ng isang pagtitipon sa paaralan, pwede naming ayusin para sa isang speaker na magsalita tungkol sa kung paano gumagawa ang teknolohiya at kung ano ang pakiramdam na maging isang software engineer.

Ang mga estudyante ay gagawa ng sarili nikang mga app o mga laro na ipapakita sa kanilang mga magulang, at magpi-print din kami ng mga sertipiko sa Hour of Code na pwede nilang dalhin sa bahay. At, ito'y masaya! Sa interaktibo, hands-on na aktibidad, matututunan ng mga estudyante ang kasanayan sa pag-iisip ng computational sa madaling paraan.

Ang mga computer ay nasa lahat ng dako, binabago ang bawat industriya sa planeta. Ngunit mas kunti kaysa sa kalahati ng lahat ng paaralang nagtuturo ng computer science. Ang mabuting balita ay, patungo na tayo sa daan upang baguhin ito! Kung narinig mo na ang tungkol sa Hour of Code dati, maaaring alam mong gumawa ito ng ksaysayan - mahigit 100 milyong mga estudyante sa buong mundo ang nasubukan na ang Hour of Code.

Salamat sa Hour of Code, ang computer science ay nasa mga homepages ng Google, MSN, Yahoo!, at Disney. Mahigit 100 na mga kasosyo ang nagsama-sama upang suportahan itong kilusan. Bawat Apple Store sa mundo ay nag-host ng Hour of Code, at kahit mga lider katulad ni Preidente Obama at Canadian Prime Minister Jusyin Trudeau ay nagsulat ng kanilang unang mga linya ng code bilang bahagi ng kampanya.

Mababasa mo ang higit pang tungkol sa kaganapan sa http://hourofcode.com/. O, ipaalam mo sa amin kung nais mong mag-schedule ng ilang oras para magsalita tungkol kung paano [pangalan ng paaralan] ay makikibahagi.

Salamat!

[Ang iyong pangalan], [Ang iyong organisasyon]

<a id="media-pitch"></a>

### Imbitahin ang media na dumalo sa iyong kaganapan:

**Paksa ng linya:** Mga lokal n paaralan na sumali sa misyon na ipakilala sa mga estudyante ang computer science

Ang mga computer ay nasa lahat ng dako, binabago ang bawat industriya sa planeta, ngunir mas kaunti ng kalahati sa lahat ng mga paaralang nagtuturo ng computer science. Ang mga babae at minorya ay lubhang kulang sa pagkatawan sa mga klase ng computer science, at sa industriya ng tech. Ang mabuting balita ay, tayo patungo sa daan upang baguhin ito.

Sa Hour of Code, ang computer science ay nasa hompages ng Google, MSN, Yahoo!, at Disney. Mahigit 100 na mga kasosyo ang nagsama-sama upang suportahan itong kilusan. Bawat Apple Store sa mundo ay nag-host na ng Hour of Code. Kahit si Presidente Obama ay sumulat ng kanyang unang linya ng code bilang bahagi ng kmpanya.

Kaya bawat isa ay [X na numero] ng mga estudyante sa [PANGALAN NG PAARALAN] are sumasali sa pinakamalaking kaganapan ng pag-aaral sa kasaysayan: Ang Hour of Code, sa panahon ng Computer Science Education Week (<%= campaign_date('full') %>).

Sumulat ako para imbitahin ka na dumalo sa aming kickoff na pagtitipon at makita ang mga batang mag-umpisa ng gawain sa [DATE].

Ang Hour of Code, inorganisa ng mga nonprofit Code.org at mahigit 100 na iba pa, ay isang pandaigdigang kilusan na naniniwalang ang mga estudyante ngayon ay handa nang matutuna ng kritikl na kasanayan para sa tagumpay ng ika-21 siglo. Mangyaring sumali sa amin.

**Kontak:** [ANG IYONG PANGALAN], [TITLE], cell: (212) 555-5555 **Kailan:** [PETSA at ORAS ng iyong kaganapan] **SAAN:** [ADDRESS at mga DIREKSYON]

Inaasam ko ang pagiging magka-ugnay.

[Iyong Pangalan]

<a id="parents"></a>

### Sabihin sa mga magulang ang tungkol sa kaganapan sa paaralan:

**Paksa ng linya:** Ang ating mga estudyante ay binabago ang kinabukasan sa Hour of Code

Mahal naming mga Magulang,

Nabubuhay tayo sa mundong napapalibutan ng teknolohiya. At alam natin na kahit ano mang larangan ang piliin ng ating mga estudyante pagtanda nila, ang abilidad nilang magtagumpay ay nakapende sa kaunawaan kung paano gumagana ang teknolohiya.

Ngunit ang tanging maliit na bahagi sa atin ang natututo **kung paano** gumagana ang teknolohiya. Mas kaunti sa kalahati ng mga paaralan ang nagtuturo ng computer science.

Kaya naman ang ating buong paaralan ay sumasali sa pinakamalaking kaganapan sa pag-aaral sa kasaysayan: Ang Hour of Code, sa panahon ng Computer Science Education Week (<%= campaign_date('full') %>). Mahigit 100 milyong mga estudyante sa buong mundo ang nasubukan na ang Hour of Code.

Ang aming Hour of Code ay gumagawa ng pahayag na ang [PANGALAN NG PAARALAN] ay handa ng magturo nitong batayang mga kasanayan sa ika-21 na siglo. Upang patuloy na nagdadala ng mga programming na kaganapan sa iyong mga estudyante, gusto naming gawing malaking kaganapan ang Hour of Code. Hinihikayat kitang mag-boluntaryo, tumulong sa lokal na media, ibahagi ang mga balita sa social media channels at isiping mag-host ng karagdagang kaganapan sa Hour of Code sa komunidad.

Ito na ang pagkakataong mabago ang kinabukasan ng edukasyon sa [PANGALAN NH BAYAN/LUNGSOD].

Tignan ang http://hourofcode.com/<%= @country %> para sa mga detalye at tumulong n ipalaganap ang salita.

Taos-puso,

Iyong punong-guro

<a id="politicians"></a>

### Imbitahin ng lokal na pulitiko sa iyong kaganapan sa paaralan:

**Paksa na linya:** Sumali sa aming paaralan habang binabago natin ang hinaharao ng Hour of Code

Mahal na [Apelyido ng Alkalde/Gobernador/Kinatawan/Senador]:

Alam mo ba na ang computing ang #1 na pinagmulan ng sahod sa U.S.? Mayroong higit 500,000 computing na mga trabaho ang bukas sa buong bansa, ngunit sa nakaraang taong lamang ay 42,969 na computer science na mga estudyante ang nagtapos sa workforce.

Ang Computer Science ay batayan sa *bawat* induatriya ngayon, subalit karamihan sa mga paaralan ay hindi ito tinuturo. Sa [PANGALAN NG PAARALAN], sinusubukan naming baguhin iyan.

Kaya naman ang ating buong paaralan ay sumasali sa pinakamalaking kaganapan sa pag-aaral sa kasaysayan: Ang Hour of Code, sa panahon ng Computer Science Education Week (<%= campaign_date('full') %>). Mahigit 100 milyong mga estudyante sa buong mundo ang nasubukan na ang Hour of Code.

Sumulat ako upang imbitahin ka na sumali sa aming kaganapan sa Hour of Code at magsalita sa aming kickoff na pagtitipon. Ito ay gaganapin sa [PETSA, ORAS, LUGAR], at gagawa ng malakas na pahayag na [pangalan ng Estado o Lungsod] ay handa na upang turuan ang aming mga estudyante ng kritikal na kasanayan sa ika-21 na siglo. Gusto naming masiguro na ang aming mga estudyante ay nasa unahan ng paggawa ng teknolohiya ng hinaharap—hindi lang ginagamit ito.

Mangyaring kontakin ako sa [NUMERO NG TELEPONO O EMAIL ADDRESS]. Inaasahan ko ang iyong pagtugon.

Taos-puso,

[Iyong Pangalan], [Title]

<%= view :signup_button %>