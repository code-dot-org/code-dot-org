---
title: <%= hoc_s(:title_country_resources) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% if @country == 'la' %>

# Recursos

## ¿Ce facem atunci cand facem Timpul Codului?

<div class="handout" style="width: 50%; float: left;">
  
<a href="/la/files/hacemos-la-Hora-del-Codigo.pdf" target="_blank"><img src="/la/images/fit-260/hacemos-la-Hora-del-Codigo.png"></a>
<br />In Spaniola
</div>

<div class="handout" style="width: 50%; float: left;">
  
<a href="/la/files/hacemos-la-Hora-del-Codigo-Ingles.pdf" target="_blank"><img src="/la/images/fit-260/hacemos-la-Hora-del-Codigo-Ingles.png"></a>
<br />In Engleza
</div>

<div style="clear:both"></div>

## Vídeos

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<a href="https://www.youtube.com/watch?v=HrBh2165KjE"><strong>De ce toată lumea trebuie să învețe să programeze? Participați la Ora de cod în Argentina (5 min)</strong></a>

  
  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

  
[ <puternic> Timp de cod în Chile (2 min) </ puternic> ](https://www.youtube.com/watch?v=_vq6Wpb-WyQ)

<% elsif @country == 'al' %> <iframe width="560" height="315" src="https://www.youtube.com/embed/AtVzbUZqZcI" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Ora E Kodimit (5 min)**](https://www.youtube.com/embed/AtVzbUZqZcI)

<% elsif @country == 'ca' %>

## Materiale video <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

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

[<%= localized_image('/images/fit-500x300/corporations.png') %>](<%= localized_file('/files/corporations.pdf') %>)

## 1) Încercaţi Tutorialele:

O sa gazduim varietati de distractie, tutoriale lungi, create de o varietate de parteneri. Noi tutoriale vin pentru a da startul Orei Codulyi inante <%= campaign_date('full') %>.

**Toate tutorialele Hour of Code:**

- Necesita timp de pregatire minim pentru organizatori
- Sunt auto-ghidate - permit elevilor să lucreze individual, în ritmul şi nivelul de pregatire propriu

<a href="https://uk.code.org/learn"><img src="https://uk.code.org/images/tutorials.png"></a>

## 2) Planificati nevoile dumneavoastră hardware - calculatoarele sunt optionale

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

- **Testeaza tutorialele pe computerele sau dispozitivele disponibile.** Asiguraţi-vă că acestea funcţionează corect (cu sunet şi video).
- **Previzualizați pagina de felicitări** pentru a vedea ce văd elevii atunci când termină. 
- **Ofera casti elevilor** sau spune-le sa isi aduca fiecare de acasa, in cazul in care tutorialul functioneaza mai bine cu sunet.

## 3) Fa-ți planul in funcție de tehnologia disponibilă

- **Nu ai suficiente dispozitive?** Folosește [programarea in echipă](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Cand participantii lucreaza in echipa, se ajuta unul pe altul şi se bazeaza mai putin pe profesor.
- **Conexiune lentă la internet?** Proiectează videclipurile pentru toată clasa, astfel elevii nu vor mai descarca videoclipurile individual. Sau încercaţi tutorialele locale.

## 4) Inspira elevii - Arată-le un video

Aratați-le elevilor un video inspirațional pentru a excela in cadrul Ora de Cod. Exemplu:

- Videoclipul original al lansării Hour of Code, care îi înfățișează pe Bill Gates, Mark Zuckerberg și starul NBA Chris Bosh ( există versiuni de [1](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5](https://www.youtube.com/watch?v=nKIu9yen5nc) sau [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA))
- [Ora de cod 2013 lansare video](https://www.youtube.com/watch?v=FC5FbmsH4fw), sau [Ora de Cod 2014](https://www.youtube.com/watch?v=96B5-JGA9EQ)
- [Videoclipul în care președintele Obama îndeamnă toți elevii să învețe tehnologia computerelor și programare](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Entuziasmeaza-ti elevii - ofera-le o scurta introducere**

<% elsif @country == 'pe' %>

# Ora de cod Peru <iframe width="560" height="315" src="https://www.youtube.com/embed/whSt53kn0lM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p> [ <puternic> Pedro Pablo Kuczynski. Președintele Peru 2016-2021 </ puternic> ](https://www.youtube.com/watch?v=whSt53kn0lM)

<% else %>

# Resursele aditionale vor fi disponibile in curand!

<% end %>