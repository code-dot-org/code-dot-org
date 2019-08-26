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

## Videoer <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

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

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<%= localized_image('/images/fit-500x300/corporations.png') %>](%= localized_file('/files/corporations.pdf') %)

## 1) Prøv øvelserne:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Alle Hour of Code øvelser:**

- Kræver minimal forberedelsestid for arrangører
- Er selvinstruerende og giver elever lov til at arbejde i deres eget tempo og et passende færdighedsniveau

<a href="https://code.org/learn"><img src="https://code.org/images/tutorials.png"></a>

## 2) Planlæg dit hardware behov - computere er ikke et krav

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

- **Test øvelserne på elevernes computere eller tablets.** Sørg for, at de fungerer korrekt (med lyd og video).
- **Tjek afslutningssiden** for at se hvad eleverne vil se, når de er færdige.
- **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Planlæg ud fra den teknologi der er til rådighed

- **Har ikke nok computere og tablets?** Så bruge [parvis programmering](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Når deltagerne teamer op, hjælper de hinanden og behøver mindre hjælp fra underviseren.
- **Har du lav båndbredde?** Planlæg at vise videoerne i klassen først, så hver elev ikke behøver at downloade deres egne videoer. Eller prøv de unplugged / offline tutorials.

## 4) Inspirere eleverne - vis dem først en video

Show students an inspirational video to kick off the Hour of Code. Examples:

- Den oprindelige Code.org indlednings video med Bill Gates, Mark Zuckerberg og NBA stjernen Chris Bosh (der er [1 minut](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutters](https://www.youtube.com/watch?v=nKIu9yen5nc), og [9 minutters](https://www.youtube.com/watch?v=dU1xS07N-FA) versioner)
- The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
- [Præsident Obama opfordrer alle elever til at lære at programmere](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

<% elsif @country == 'pe' %>

# La Hora del Código Perú <iframe width="560" height="315" src="https://www.youtube.com/embed/whSt53kn0lM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Pedro Pablo Kuczynski. Presidente del Perú 2016-2021**](https://www.youtube.com/watch?v=whSt53kn0lM)

<% else %>

# Additional resources coming soon!

<% end %>