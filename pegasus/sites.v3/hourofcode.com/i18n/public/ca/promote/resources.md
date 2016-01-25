---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Penjar aquests cartells a la teva escola

<%= view :promote_posters %>

<a id="social"></a>

## Publica-ho als mitjans de comunicació

[![imatge](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imatge](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imatge](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![imatge](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. Any reference to "Hour of Code" should be used in a fashion that doesn't suggest that it's your own brand name, but rather referencing the Hour of Code as a grassroots movement. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Include language on the page (or in the the footer), including links to the CSEdWeek and Code.org web sites, that says the following:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![imatge](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Envia aquests correus per ajudar a promoure l'Hora del Codi

<a id="email"></a>

## Demana a l'escola, empresaris o amics que s'inscriguin:

Els ordinadors són pertot arreu, però menys escoles ensenyen computació que 10 anys enrere. La bona notícia és, estem en el camí de canviar això. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! i Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Corre la veu. Acull un esdeveniment. Demana a una escola local que s'inscrigui. O prova l'Hora del Codi tu mateix -- tothom pot beneficiar-se de aprendre les bases.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Convida als mitjans de comunicació a assistir al teu esdeveniment:

**Subject line:** Local school joins mission to introduce students to computer science

Els ordinadors són a pertot arreu, però menys escoles ensenyen informàtica que 10 anys enrere. Les nenes i les minories són severament subrepresentades. La bona notícia és, estem en el camí de canviar-ho.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! i Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Us convidem a assistir al acte inaugural i veure els nens començar l'activitat el [DATA].

L'Hora del Codi, organitzat per l'associació sense ànim de lucre Code.org i més de 100 d'altres, és una declaració de que la generació actual d'estudiants estan preparats per aprendre les habilitats crítiques per l'èxit al segle XXI. Si us plau, uneix-te.

**Contacte:** [EL TEU NOM], [CÀRREC], mòbil: 212-555-5555

**Quan:** [Data i hora del teu esdeveniment]

**On:** [Adreces i indicacions]

Espero que estem en contacte.

<a id="parents"></a>

## Digues als pares sobre l'esdeveniment de la vostra escola:

Benvolguts pares,

Vivim en un món envoltat de tecnologia. I sabem que qualsevol que sigui el camp que els alumnes escullin per entrar en l'edat adulta, la seva capacitat per tenir èxit cada vegada més dependrà de la comprensió de tinguin sobre com funciona la tecnologia. Però només una petita part de nosaltres estem aprenent Ciències de la Computació, i ara hi ha menys estudiants que fa una dècada.

És per això que la nostra escola sencera s'uneix a l'esdeveniment d'aprenentatge més gran de la història: L'Hora del Codi, durant la setmana de les Ciències Informàtiques a l'Educació (Desembre 7-13). More than 100 million students worldwide have already tried an Hour of Code.

La nostre Hora del Codi és una declaració de que [nom de l'escola] està disposada a ensenyar aquestes habilitats fonamentals del segle XXI. Per continuar oferint activitats de programació als vostres estudiants, volem fer molt gran el nostre event de l'Hora del Codi. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Aquesta és una oportunitat per canviar el futur de l'educació a [NOM CIUTAT/POBLE].

Mira http://hourofcode.com/<%= @country %>/ca per a més detalls, i ajuda a córrer la veu.

Atentament,

El teu director

<a id="politicians"></a>

## Convida a un polític local a l'esdeveniment de la teva escola:

Estimat [Alcalde/Governador/Representant/Senador COGNOM]:

Sabia vostè que en l'economia actual, les feines de informàtica superen en nombre de 3 a 1 als estudiants que es graduen en aquest camp? I, que la informàtica es fonamental per a *qualsevol* indústria d'avui dia. Yet most of schools don’t teach it. A [NOM DE L'ESCOLA], estem tractant de canviar això.

És per això que la nostra escola sencera s'uneix a l'esdeveniment d'aprenentatge més gran de la història: L'Hora del Codi, durant la setmana de les Ciències Informàtiques a l'Educació (Desembre 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Em dirigeixo a vostè per convidar-lo a participar en el nostre esdeveniment de l'Hora del Codi i parlar en la Assemblea inaugural. Tindrà lloc el [DATA, HORA, LLOC], i farà una forta declaració de que [nom Estat o Ciutat] està disposat a ensenyar als nostres estudiants les habilitats crítiques del segle XXI. Volem garantir que els nostres alumnes són a l'avantguarda de la tecnologia del futur i no només per consumir-la.

Si us plau, contacteu amb mi en [telèfon o adreça de correu electrònic]. Espero la seva resposta.

Atentament,\[NAME\]\[TITLE\]

