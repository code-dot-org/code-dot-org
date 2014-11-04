* * *

Resurser

* * *

<div class="row">
  <h1 class="col-sm-6">
    How to teach one Hour of Code
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="/#join"><button class="signup-button">Sign up your event</button></a>
  </div>
</div>

## 1) Testa övningarna:

Vi har en stor variation på roliga entimmeslektioner för alla åldrar, gjorda av olika samarbetspartners. Nya övningar kommer lagom till nästa Hour of Code 8-14 december. 

**Alla övningar i Hour of Code:**

  * Kräver minimal förberedelse för lärare
  * Är självinstruerande så att alla kan jobba i sin takt på sin nivå

[![](http://<%= codeorg_url() %>/images/tutorials.png)](http://<%=codeorg_url() %>/learn)

## 2) Vad behöver du för hårdvara? -datorer är inte nödvändiga

Den bästa upplevelsen av Hour of Code-materialet får du med internetuppkopplade datorer (eller paddor), men det behövs inte en dator per elev och du behöver inte ha datorer alls för att genomföra Hour of Code.

  * **Testa övningarna på elevdatorer eller enheter.** Kontrollera att de fungerar korrekt (med ljud och video).
  * **Förhandsgranska Diplomsidan** för att se vad eleverna kommer att se när de är klara. 
  * **Fixa hörlurar till din klass**, eller be eleverna att ta med sig egna, om de övningar du väljer fungerar bäst med ljud.

## 3) Planera baserat på den teknik som är tillgänglig

  * **Finns inte tillräckligt många enheter?** Använd [parprogrammering](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). När elever samarbetar, hjälper de varandra och vänder sig mindre till läraren. De ser också att programmering är socialt och bygger på samarbete.
  * **Är tillgängligheten till internet för dålig?** Planera att se videor på gemensamt, så att varje elev inte behöver ladda ner sina egna videos. Eller prova unplugged / offline övningar.

## 4) Inspirera eleverna – Visa en video

Visa eleverna inspirationsfilmer för att komma igång med Hour of Code. Till exempel:

  * Originalvideon från lanseringen av Code.org, där bland annat Bill Gates, Mark Zuckerberg och basketstjärnan Chris Bosh är med (det finns olika versioner som är [1 minut](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minuter](https://www.youtube.com/watch?v=nKIu9yen5nc) och [9 minuter](https://www.youtube.com/watch?v=dU1xS07N-FA) långa)
  * [Lanseringsvideon från Hour of Code 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw) eller <% if @country == 'uk' %> [videon för Hour of Code 2014](https://www.youtube.com/watch?v=96B5-JGA9EQ) <% else %> [videon för Hour of Code 2014](https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q) <% end %>
  * [President Obama uppmanar alla elever att lära sig datavetenskap](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Få dina elever engagerade - ge dem en kort introduktion**

De flesta barn vet inte vad datavetenskap är. Här är några idéer:

  * Förklara på ett enkelt sätt och använd olika slags tillämpningar som tilltalar många (rädda liv, hjälpa människor, kommunicera, osv.).
  * Till exempel: "Tänk vad många av våra saker som är byggda med hjälp av datavetenskap: mobiler, microvågsugnar, trafikljus.... inget av det skulle fungera utan att en datavetare var med när de byggdes."
  * Eller: "Datavetenskap är konsten att kombinera människors idéer och digitala verktyg för att öka vår makt. Datavetare arbetar inom många olika områden: bygger appar för telefoner, botar sjukdomar, skapar animerade filmer, jobbar med sociala medier, bygger robotar för att utforska andra planeter och mycket mer. "
  * Tips för att få tjejer intresserade av datavetenskap hittar du <a

## 5) Starta Hour of Code

**Visa eleverna till aktiviteten**

  * Skriv länken till introduktionen på whiteboarden. Find the link listed on the [information for your selected tutorial](http://<%= codeorg_url() %>/learn) under the number of participants. [hourofcode.com/co](http://hourofcode.com/co)
  * Be eleverna att gå till den uppskrivna webbadressen och börja introduktionen.

**Om eleverna stöter på svårigheter**

  * Inför regeln "Fråga 3 innan mig." Fråga 3 klasskamrater, och om de inte har svaret, då frågar man läraren.
  * Uppmuntra elever och ge positiv förstärkning: "Du gör ett bra jobb, fortsätt försöka."
  * Det är okej att svara: "Jag vet inte. Låt oss lista ut tillsammans." Om du inte kan lösa ett problem, använd det som en diskussionmöjlighet med klassen: "teknik fungerar inte alltid så som vi vill. Vi lär oss tillsammans. Och: "Att lära sig programmera är som att lära sig ett nytt språk; du kommer inte att vara flytande direkt."

**Vad gör man om en elev blir färdig fort?**

  * Eleverna kan se alla övningar och prova en annan Hour of Code aktivitet på [<%= codeorg_url() %>/learn](http://<%= codeorg_url() %>/learn)
  * Eller, be elever som blir snabbt färdiga att hjälpa klasskamrater som behöver hjälp.

**Hur skriver jag ut diplom till mina elever?**

Varje elev får en chans att få ett diplom via e-post när de avslutar [Code.org tutorials](http://studio.code.org). Du kan klicka på diplomet för att skriva ut det. Om du vill göra nya diplom till dina elever, gå till vår [diplomsida](http://<%= codeorg_url() %>/certificates) och skriv ut så många du vill på en gång.

**Vad kommer efter Hour of Code?**

Hour of Code är bara första steget på en resa för att lära dig mer om hur tekniken fungerar och hur du skapar program. < % if @country == "uk" %> För att fortsätta denna resa, [uppmuntra dina elever att lära sig online](http://uk.code.org/learn/beyond). <% else %> För att fortsätta denna resa, kolla ytterligare resurser för lärare [här](http://<%= codeorg_url() %>/educate). Eller uppmuntra dina elever att lära sig [online](http://<%= codeorg_url() %>/learn/behond). <% end %> <a style="display: block" href="/#join"><button style="float: right;">Sign up your event</button></a>