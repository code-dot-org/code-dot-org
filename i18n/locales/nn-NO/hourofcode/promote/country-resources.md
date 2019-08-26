---
title: <%= hoc_s(:title_country_resources).inspect %>
layout: wide
nav: promote_nav
---

<%= view :signup_button %>

<% if @country == 'la' %>

# Recursos

## ¿Qué hacemos cuando hacemos la Hora del Código?

<div class="handout" style="width: 50%; float: left;">
  
<a href="/la/files/hacemos-la-Hora-del-Codigo.pdf" target="_blank"><img src="/la/images/fit-260/hacemos-la-Hora-del-Codigo.png"></a>
<br />En Español
</div>

<div class="handout" style="width: 50%; float: left;">
  
<a href="/la/files/hacemos-la-Hora-del-Codigo-Ingles.pdf" target="_blank"><img src="/la/images/fit-260/hacemos-la-Hora-del-Codigo-Ingles.png"></a>
<br />En Inglés
</div>

<div style="clear:both"></div>

## Vídeos

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<a href="https://www.youtube.com/watch?v=HrBh2165KjE"><strong>¿Por qué todos tienen que aprender a programar? Participá de la Hora del Código en Argentina (5 min)</strong></a>

  
  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

  
[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=_vq6Wpb-WyQ)

<% elsif @country == 'al' %> <iframe width="560" height="315" src="https://www.youtube.com/embed/AtVzbUZqZcI" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Ora E Kodimit (5 min)**](https://www.youtube.com/embed/AtVzbUZqZcI)

<% elsif @country == 'ca' %>

## Videoar <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

[**Bli med Nova Scotia på Kodetimen (3min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'id' %>

Di luar dari fakata bahwa Pekan Edukasi Ilmu Komputer jatuh pada 7 hingga 13 Desember 2015, kami mengetahui bahwa banyak siswa-siswi Indonesia yang menjalankan prosesi ujian. Untuk alasan ini kami memutuskan untuk menjalankan masa kampanye Hour of Code di Indonesia pada 12 hingga 20 Desember 2015. Kita tetap akan merasakan kemeriahan yang sama dan dengan tujuan yang sama namun dengan kebersamaan yang lebih besar karena akan ada lebih banyak siswa-siswi yang dapat mengikutinya.

Mari bersama kita dukung gerakan Hour of Code di Indonesia!

<% elsif @country == 'jp' %>

## Hour of Code(アワーオブコード) 2015紹介ビデオ <iframe width="560" height="315" src="https://www.youtube.com/embed/_C9odNcq3uQ" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Hour of Code(アワーオブコード) 2015紹介ビデオ (1 min)**](https://www.youtube.com/watch?v=_C9odNcq3uQ)

[Hour of Code Lesson Guide](/files/HourofCodeLessonGuideJapan.pdf)

<% elsif @country == 'nl' %>

  
  
  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/0hfb0d5GxSw" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Friends of Technology Hour of Code (2 min)**](https://www.youtube.com/embed/0hfb0d5GxSw)

<% elsif @country == 'pk' %>

اگر آپ کا تعلق پاکستان کےایسے کیمبرج اسکول سے ہے، جہاں دسمبر کے مہینے میں امتحانات لئے جاتے ہیں، تو آپ اپنے اسکول میں آور آف کوڈ کا انقعاد نومبر ٢٣ تا ٢٩ کے دوران بھی کر سکتے ہیں۔ آپ کا شمار دنیا کی سب سے بڑی تعلیمی تقریب میں حصّہ لینے والوں میں ہی کیا جائے گا۔

<% elsif @country == 'ro' %>

Va multumim pentru inregistrare, daca doriti materiale printate pentru promovarea evenimentului, echipa din Romania vi le poate trimite prin curier. Trebuie doar sa trimiteti un email la HOC@adfaber.org si sa le solicitati.

<% elsif @country == 'uk' %>

# Slik gjer du det for organisasjonar

## Bruk denne utskrifta til å rekruttere bedrifter

[<%= localized_image('/images/fit-500x300/corporations.png') %>](%= localized_file('/files/corporations.pdf') %)

## 1) Prøv leksjonane sjølv:

Vi har ein god variasjon av morosame, timeslange øvingar, utarbeida av mange partnarar. Nye øvingar blir klare til Kodetimen før <%= campaign_date('full') %>.

**For alle leksjonane i Kodetimen gjeld:**

- Minimal førebuingstid for arrangør
- Er tilrettelagt for at elevane skal arbeide på eiga hand, i eige tempo og tilpasset eige ferdigheitsnivå

<a href="https://code.org/learn"><img src="https://code.org/images/tutorials.png"></a>

## 2) Planlegg det du treng av utstyr - datamaskiner er valfrie

Den beste opplevinga av Kodetimen vil være med datamaskiner med internett. Men du treng ikkje ei datamaskin til kvar elev, og Kodetimen kan også bli gjennomført heilt utan datamaskiner.

- **Prøv ut leksjonane på elevane sine datamaskiner eller nettbrett.** Ver viss på at dei fungerer som dei skal med lyd og video.
- **Sjekk ut gratulasjons-sida** for å sjå kva elevane vil få sjå når dei er ferdige.
- **Tilby høyretelefonar til gruppa di**, eller be elevane om å ta med sine eigne, dersom øvinga du vel passar best med lyd.

## 3) Planlegg ut frå tilgjengeleg utstyr

- **Ikkje nok maskiner til alle elevane?** Prøv [parprogrammering](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Når deltakarar går i par, hjelper dei kvarandre og er mindre avhengige av læraren.
- **Er internettlinja treg?** Planlegg å vise videoane for heile klassa samla, slik at alle elev ikkje lastar ned kvar sin video. Eller prøv dei leksjonene som ikkje treng tilgang til nettet.

## 4) For å inspirere elevane - Vis ein video!

Vis elevane ein inspirerande video for å dra i gang Kodetimen. For eksempel:

- Bill Gates, Mark Zuckerberg og NBA stjerna Chris Bosh var med i den opprinnelge lanseringsvideoen for Code.org (Det finns versjonar på [eitt minutt](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutt](https://www.youtube.com/watch?v=nKIu9yen5nc) og [9 minutt](https://www.youtube.com/watch?v=dU1xS07N-FA))
- [Lanseringsvideoen for Kodetimen 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw) eller [videoen for Kodetimen 2014](https://www.youtube.com/watch?v=96B5-JGA9EQ)
- [President Obama oppfordrar alle elevar til å lære datavitskap](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Gi ein kort introduksjon for å gi elevane tenning**

<% elsif @country == 'pe' %>

# La Hora del Código Perú <iframe width="560" height="315" src="https://www.youtube.com/embed/whSt53kn0lM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

[**Pedro Pablo Kuczynski. Presidente del Perú 2016-2021**](https://www.youtube.com/watch?v=whSt53kn0lM)

<% else %>

# Fleire ressurar kjem snart!

<% end %>