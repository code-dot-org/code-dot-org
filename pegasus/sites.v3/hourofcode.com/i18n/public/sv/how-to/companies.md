---

title: <%= hoc_s(:title_how_to_companies) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# Att arrangera Hour of Code via ditt företag

## Inspirera elever och volontära till Hour of Code

**Code.org erbjuder anställda på företag möjligheten att [delta](<%= resolve_url('https://code.org/volunteer') %>) i lokala klassrum under Hour of Code och att dela med sig av deras erfarenheter från teknikbranschen och att inspirera studenter att studera datavetenskap.**

  * [Anmäl dig](<%= resolve_url('https://code.org/volunteer') %>) som volontär.
  * För mer instruktioner om hur dina anställda deltar i klassrum, läs mer i vår [guide för samarbetspartners](<%= localized_file('/files/HourOfCodeGuideForCorporatePartners.pdf') %>).

## Ytterligare sätt ditt företag kan stödja Hour of Code:

  * Använd vårt [marknadsföringsmaterial](<%= localized_file('/files/HourOfCodeInternalMarketingToolkit.pdf') %>) för att skapa en kommunikationstidslinje och dela marknadsföringsmaterialet.
  * Be din VD att skicka ett email till hela företaget med betoning av vikten av datavetenskap och uppmuntra anställda att sprida det vidare. [Exempelvis detta mail](<%= resolve_url('/promote/resources#sample-emails') %>).
  * Var värd för en Hour of Code Happy Hour där medarbetare får prova [materialet](<%= resolve_url('https://code.org/learn') %>).
  * Var värt för ett Hour of Code evenemang för en lokal skola eller ideell förening på ditt företags kontor. Se evenemangsguiden nedan.

## Hur man organiserar en Hour of Code

## 1) Marknadsför din Hour of Code

  * Marknadsföra evenemanget [Hour of Code](<%= resolve_url('/promote') %>) och uppmuntra andra att vara med.
  * Uppmuntra **programmerare** på ditt företag att besöka en lokala skolor för att leda Hour of Code och inspirera elever att studera datavetenskap. De kan [registrera sig](<%= resolve_url('https://code.org/volunteer/engineer') %>) för att bli matchade med en skola.

## 2) Titta på den här videon <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) Välj ett material:

Vi erbjuder en mängd [roliga, timslånga guider](<%= resolve_url('https://code.org/learn') %>) för deltagare i alla åldrar, skapade av en mängd partners. [Prova dem!](<%= resolve_url("https://code.org/learn") %>)

**Alla övningar i Hour of Code:**

  * Kräver minimal förberedelsetid
  * Är självinstruerande så att alla kan jobba i sin takt på sin nivå

[![](/images/fit-700/tutorials.png)](<%= resolve_url('https://code.org/learn') %>)

## 2) Vad behöver du för teknik? Datorer är inte nödvändiga

Den bästa Hour of Code erfarenheten fås med datorer med internet. Men du behöver **inte** en dator för varje barn, och du kan även göra Hour of Coode utan datorer.

**Planera!** Gör följande steg innan evenemanget startar:

  * **Testa övningarna på elevdatorer eller enheter.** Kontrollera att de fungerar korrekt (med ljud och video).
  * **Fixa hörlurar till din klass**, eller be eleverna att ta med sig egna, om de övningar du väljer fungerar bäst med ljud.
  * **Inte har tillräckligt många enheter?** Använd [parprogrammering](https://www.youtube.com/watch?v=vgkahOzFH2Q). När elever sitter i par, hjälper de varandra och behöver mindre stöttning av läraren. De ser också att programmering är socialt och bygger på samarbete.
  * **Har ni dåligt internet?** Planera att se på videos gemensamt, så att varje elev inte behöver ladda egna videos. Eller prova unplugged / offline övningar.

![](/images/fit-350/group_ipad.jpg)

## 5) Starta din Hour of Code med en inspirerande video

Sparka igång din Hour of Code genom inspirerande deltagare och diskutera hur datavetenskap påverkar alla delar av våra liv. Berätta mer om vad inspirerade dig att börja med datavetenskap och din roll på ditt företag.

**Visa en inspirerande video:**

  * Originalvideon från lanseringen av Code.org, där bland annat Bill Gates, Mark Zuckerberg och basketstjärnan Chris Bosh är med (det finns olika versioner som är [1 minut](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minuter](https://www.youtube.com/watch?v=nKIu9yen5nc) och [9 minuter](https://www.youtube.com/watch?v=dU1xS07N-FA) långa)
  * [Lanseringsvideon från Hour of Code 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw) eller <% if @country == 'uk' %> [ videon för Hour of Code 2014](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %>[ Hour of Code 2015 videon](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [President Obama uppmanar alla elever att lära sig datavetenskap](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Hitta fler inspirerande videor [här](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Idéer till att introducera din Hour of Code aktivitet:**

  * Förklara hur teknik påverkar våra liv, med exempel som alla elever i klassrummet kommer att bry sig om och inte endast ett fåtal (berätta om appar och teknik som används för att rädda liv, hjälpa människor, och föra personer närmare, o.s.v.). 
  * Om du är ett teknikföretag, visa upp kul, innovativa produkter ditt företag arbetar på.
  * Om du inte är ett teknikföretag, berätta om hur ditt företag använder teknik för att lösa problem och nå mål.
  * Bjuda in programmerare från företaget att tala om varför de beslutade att studera datavetenskap och de projekt som de arbetar på.
  * Se tips för att få tjejer intresserade av datavetenskap [här](<%= resolve_url('https://code.org/girls') %>).

## 6) Koda!

**Visa eleverna till aktiviteten**

  * Skriv länken till guiden på en whiteboard. Länken listas på [informationen för din valda handledning](<%= resolve_url('https://code.org/learn') %>) under antalet deltagare.
  * För yngre elever, ladda sidan innan eller spara den som ett bokmärke.

**När någon stöter på problem är det okej att svara:**

  * "Jag vet inte. Låt oss lista ut detta tillsammans."
  * "Tekniken inte alltid fungerar som vi vill."
  * "Att lära sig programmera är som att lära sig ett nytt språk: Du blir inte flytande på en gång."

**Vad gör man om en elev blir färdig tidigare?**

  * De kan prova en annan Hour of Code aktivitet på code.org/learn
  * Eller be dem att hjälpa en vän som har problem med aktiviteten.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Fira

  * [Skriv ut diplom](<%= resolve_url('https://code.org/certificates') %>) för deltagarna.
  * [Skriva ut "Jag gjorde en timme av kod!"](<%= resolve_url('/promote/resources#stickers') %>) klistermärken för dina elever.
  * [Beställ t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) för dina anställda.
  * Dela foton och videoklipp från ditt Hour of Code på sociala medier. Använd #HourOfCode och @codeorg så vi kan se vad du gjort!

[col-33]

![](/images/fit-250/celebrate2.jpeg)

[/col-33]

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Vad kommer efter kodtimmen?

Hour of Code är bara första steget på en resa för att lära dig mer om hur teknik fungerar och hur du skapar program. För att fortsätta denna resa, [uppmuntra barnen att lära sig online](<%= resolve_url('https://code.org/learn/beyond') %>).

<%= view :signup_button %>