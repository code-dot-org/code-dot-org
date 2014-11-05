* * *

title: Ressurser layout: wide

* * *

<div class="row">
  <h1 class="col-sm-6">
    How to teach one Hour of Code
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="/#join"><button class="signup-button">Sign up your event</button></a>
  </div>
</div>

## 1) Prøv veiledningene:

Vi vil holde en rekke morsomme, timelange undervisningsøkter for elever i alle aldre. De er laget av en rekke ulike partnere. Flere tema vil bli tilgjengelig før kodetimen sparkes i gang 8. desember.

**For temaene i Kodetimen gjelder:**

  * Krever minimalt med tid til forberedelser fra læreren
  * Er tilrettelagt for at studentene skal arbeide på egen hånd i eget tempo og tilpasset deres ferdighetsnivå

[![](http://<%= codeorg_url() %>/images/tutorials.png)](http://<%=codeorg_url() %>/learn)

## 2) Planlegg det du trenger av utstyr - datamaskiner er valgfritt

Den beste opplevelsen av Kodetimen vil være med datamaskiner med internett. Men du trenger ikke en datamaskin til hver elev, og Kodetimen kan også gjennomføres helt uten datamaskiner.

  * **Prøv ut opplæringsøktene på elevenes datamaskiner eller enheter.** Forsikre deg om at de fungerer med lyd og video.
  * **Sjekk gratulasjons-siden** å se hva elevene vil se når de er ferdige. 
  * **Skaff hodetelefoner til klassen**, eller spørr elevene om å ta med sine egne. Gjelder hvis du velger å bruke leksjonene med lyd.

## 3) Planlegg ut fra tilgjengelig utstyr

  * **Har dere ikke nok maskiner?** Prøv [parprogrammering](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Når elevene jobber to og to, vil de hjelpe hverandre og være mindre avhengige av læreren. De vil også oppleve at programmering er sosialt og handler om samarbeid.
  * **Har dere dårlig eller treg internettforbindelse?** Planlegg å vise videoene for hele klassen samlet, slik at hver elev ikke trenger å laste ned sine egne videoer. Eller prøv de leksjonene som kan gjøres uten tilkobling til nett.

## 4) For å inspirere elevene - Vis dem en video!

Vis elevene en inspirerende video for å sparke i gang Kodetimen. Eksempelvis:

  * Bill Gates, Mark Zuckerberg og NBA stjernen Chris Bosh var med i den opprinnelige lanseringsvideoen for Code.org (Det finnes versjoner på [ett minutt](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutter](https://www.youtube.com/watch?v=nKIu9yen5nc) og [9 minutter](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * [Lanseringsvideoen for Kodetimen 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw), eller < % if @country == 'uk' %> [Videoen for Kodetimen 2014](https://www.youtube.com/watch?v=96B5-JGA9EQ) < % else %> [Videoen for Kodetimen 2014](https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q) <% end %>
  * [President Obama oppfordrer alle elever til å lære datavitenskap](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Få elevene på hugget - Gi dem en kort introduksjon!**

De fleste barn vet ikke hva programmering er. Her er noen ideer:

  * Forklar det på en enkel måte med eksempler på bruksområder som både gutter og jenter vil bryr seg om (redde liv, hjelpe folk, knytter mennesker sammen, osv.).
  * Prøv f.eks: "Tenk på tingene som du bruker hver dag: mobiltelefon, mikrobølgeovn, datamaskin, trafikklys... alle disse tingene måtte programmeres av datakyndige."
  * Eller: "datavitenskap er kunsten å smelte sammen mennesklige ideer med digitale verktøy for å øke evnene våre. IT-folk jobber innenfor så mange forskjellige områder: apputvikling, helbreding av sykdommer, skaping av tegnefilmer, arbeid med sosiale medier, bygging av roboter, utforsking av andre planeter og mye mye mer. "
  * Se tips for å få jenter interessert i dataprogrammering [her](http://<%= codeorg_url() %>/girls). 

## 5) Start Kodetimen din!

**Sett elevene i gang!**

  * Skriv linken til veiledningen på en tavle. Finn linken som er oppført i [informasjonen for den veiledningen du har valgt](http://<%= codeorg_url() %>/learn) under antall deltakere. [hourofcode.com/co](http://hourofcode.com/co)
  * Be elevene gå til denne nettadressen og starte veiledningen.

**Når elevene støter på vansker**

  * Si dette til elevene: “Spør 3 før du spør meg.” Spør 3 i klassen, og hvis de ikke kan svare, så kan du spørre læreren.
  * Oppmuntre elevene og gi positive tilbakemeldinger: "Du klarer det fint, så bare fortsett"
  * Det er greit å svare: "Jeg vet ikke. La oss prøve å finne det ut sammen." Hvis du ikke får løst et problem, bruk det som en et eksempel: "teknologien fungerer ikke alltid ut slik vi ønsker. men vi kan lærer dette sammen." Og: "Å lære programmering er som å lære et nytt språk, du kan det ikke flytende med en gang."

**Hva kan jeg gjøre hvis en elev blir fort ferdig?**

  * Elevene kan se alle leksjonene og prøve en av de andre aktivitetene for Kodetimen på [<%= codeorg_url() %>/learn](http://<%= codeorg_url() %>/learn)
  * Eller du kan be de elevene som blir fort ferdige om å hjelpe de som sliter med å få det til.

**Hvordan skriver jeg ut kursbeviser for mine elever?**

Hver elev får tilsendt et kursbevis via e-post når de er ferdige med [Code.org leksjonene](http://studio.code.org). Du kan klikke på sertifikatet for å skrive det ut. Dersom du vil lage nye kursbevis til elevene dine, gå til vår [kursbevis-side](http://<%= codeorg_url() %>/certificates) og skriv ut så mange du vil på en gang!

**Hva kommer etter Kodetimen?**

Kodetimen er bare det første skrittet på en reise for å lære mer om hvordan teknologien virker og hvordan programmer lages. < % if @country == 'uk' %> Time av koden er bare første skritt på en reise for å lære mer om hvordan teknologien virker og hvordan å lage programmer. For å fortsette den reisen, må [barna oppmuntres til å lære mer på nettet](http://uk.code.org/learn/beyond). <% else %> For å fortsette den reisen, kan du finne fleere ressurser for lærare [her](http://<%= codeorg_url() %>/educate). Eller uppmuntre elevene til selv å finne mer på[nettet](http://<%= codeorg_url() %>/learn/behond). <% end %> <a style="display: block" href="/#join"><button style="float: right;">Sign up your event</button></a>