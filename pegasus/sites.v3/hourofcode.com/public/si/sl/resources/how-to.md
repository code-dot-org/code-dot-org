

<div class="row">
  <h1 class="col-sm-6">
    Kako učiti Uro za kodo
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Prijavi svoj dogodek</button></a>
  </div>
</div>

## 1) Watch this how-to video <iframe width="560" height="315" src="//www.youtube.com/embed/tQeSke4hIds" frameborder="0" allowfullscreen></iframe>
## 2) Try the tutorials:

Gostili bomo zabavne enourne tečaje za študente vseh starosti, v sodelovanju z različnimi partnerji. Novi tečaji Ure za kodo bodo na voljo že pred 8. in 14. decembrom.

**Vse vaje Ure za kodo:**

  * Zahtevajo minimalno priprav od učiteljev
  * Vaje so samoiniciativne in omogočajo učencem, da delajo v svojem ritmu in na svoji stopnji znanja

[![](http://<%= codeorg_url() %>/images/tutorials.png)](http://<%=codeorg_url() %>/learn)

## 3) Register your Hour on the map

[Make sure to sign up](<%= hoc_uri('/') %>). We'll send you helpful info as the Hour of Code nears, and you'll see your Hour of Code on our map of worldwide events.

## 4) Plan your hardware needs - computers are optional

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every child, and can even do the Hour of Code without a computer at all.

  * **Testirajte vaje na računalnikih ali napravah učencev. ** Prepričajte se, da naprave delujejo (zvok in video).
  * **Preverite stran „Čestitke“**, da boste videli, kaj bodo učenci videli, ko bodo končali z vajami. 
  * **Zagotovite slušalke vsem v razredu**, oz. naj učenci prinesejo svoje slušalke, še posebej, če izberete tečaj, za katerega je potreben zvok.

## 5) Plan ahead based on your technology available

  * **Nimate dovolj naprav? **Delajte[ v parih](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Tako si učenci pomagajo in so manj odvisni od učitelja. Naučili se bodo, da je programiranje družabno in je pomembno sodelovanje.
  * **Nimate dovolj hitrega interneta?** Video prikažite vsem v razredu, tako si vsak študent ne bo prenašal videa na računalnik. Ali pa poskusite z „nepovezanimi“ tečaji.

## 6) Inspire students - show them a video

Show students an inspirational video to kick off the Hour of Code. Examples:

  * Originalni začetni video Code.org, v katerem nastopajo Bill Gates, Mark Zuckerberg, ter NBA košarkar Chris Bosh (Obstajajo tri različice: [1 minutni](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutni](https://www.youtube.com/watch?v=nKIu9yen5nc) in [9 minutni](https://www.youtube.com/watch?v=dU1xS07N-FA) videoposnetek)
  * Videoposnetek [Ura za kodo 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw) ali <% if @country == 'uk' %>[videoposnetek Ura za kodo 2014](https://www.youtube.com/watch?v=96B5-JGA9EQ) <% else %> [videoposnetek Ura za kodo 2014](https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q) <% end %>
  * [Predsednik Obama poziva študente, da se učijo računalništva](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

Most kids don’t know what computer science is. Here are some ideas:

  * Razložite jim na preprost način na primerih aplikacij, ki so blizu fantom in dekletom (reševanje življenj, pomaganjem ljudem, povezovanje ljudi itd.).
  * Poskusite: „Pomislite na stvari v vašem vsakdanjem življenju, ki uporabljajo tehnologijo: mobilni telefon, mikrovalovna pečica, računalnik, semafor … to so vse stvari, pri katerih so sodelovali računalničarji, da tehnologija deluje.“
  * Ali pa: „Programiranje je umetnost mešanje človeških idej in digitalnih orodij za povečanje naše moči. Računalničarji delajo na različnih področjih: izdelovanje aplikacij za telefone, ozdravljenje bolezni, ustvarjanje animiranih filmov, sodelujejo pri socialnih medijih, gradijo robote, ki raziskujejo planete in še veliko več.“
  * [Tukaj](http://<%= codeorg_url() %>/girls) si oglejte nasvete, kako programiranje približati dekletom. 

## 6) Start your Hour of Code

**Direct students to the activity**

  * Napišite povezavo do vaje na tablo. Povezavo najdite, [v informacijah vaše izbrane vaje](http://<%= codeorg_url() %>/learn), pod številom udeležencev. [hourofcode.com/co](http://hourofcode.com/co)
  * Naročite učencem, da vnesejo spletni naslov in začnite vajo.

**When your students come across difficulties**

  * Razložite učencem „Vprašajte 3 nato mene.“ Vprašajte 3 sošolce, in če nimajo odgovora, nato šele vprašajte učitelja.
  * Spodbujajte učence s pozitivnimi stavki: „Kar tako naprej, dobro vam gre.“
  * Nič ni narobe, z odzivom: „Ne vem. Ugotovimo skupaj.“ Če ne znate rešiti težave, jo uporabite, kot učno lekcijo: „Tehnologija ne deluje vedno, kot si želimo. Učimo se skupaj.“ In: „Učenje programiranja je, kot učenje novega jezika – potrebna je vaja."

**What to do if a student finishes early?**

  * Študent lahko vidi vse vaje in lahko poskusi naslednjo vajo Uro za kodo [<%= codeorg_url() %>/learn](http://<%= codeorg_url() %>/learn)
  * Ali pa, učenci, ki so predčasno končali, naj pomagajo drugim, ki imajo težave.

**How do I print certificates for my students?**

Each student gets a chance to get a certificate via email when they finish the [Code.org tutorials](http://studio.code.org). You can click on the certificate to print it. However, if you want to make new certificates for your students, visit our [Certificates](http://<%= codeorg_url() %>/certificates) page to print as many certificates as you like, in one fell swoop!

**What comes after the Hour of Code?**

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. <% if @country == 'uk' %> The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey, [encourage your children to learn online](http://uk.code.org/learn/beyond). <% else %> To continue this journey, find additional resources for educators [here](http://<%= codeorg_url() %>/educate). Or encourage your children to learn [online](http://<%= codeorg_url() %>/learn/beyond). <% end %> 