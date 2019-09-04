---
title: <%= hoc_s(:title_country_resources).inspect %>
layout: szeroki
nav: promote_nav
---

<%= view :signup_button %>

<% if @country == 'la' %>

# Zasoby

## ¿Qué hacemos cuando hacemos la Hora del Código?

<div class="handout" style="width: 50%; float: left;">
  
<a href="/la/files/hacemos-la-Hora-del-Codigo.pdf" target="_blank"><img src="/la/images/fit-260/hacemos-la-Hora-del-Codigo.png"></a>
<br />En Español
</div>

<div class="handout" style="width: 50%; float: left;">
  
<a href="/la/files/hacemos-la-Hora-del-Codigo-Ingles.pdf" target="_blank"><img src="/la/images/fit-260/hacemos-la-Hora-del-Codigo-Ingles.png"></a>
<br />EN Inglés
</div>

<div style="clear:both"></div>

## Wídeo

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<a href="https://www.youtube.com/watch?v=HrBh2165KjE"><strong>¿Por qué todos tienen que aprender a programar? Participá de la Hora del Código en Argentina (5 min)</strong></a>

  
  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

  
[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=_vq6Wpb-WyQ)

<% elsif @country == 'al' %> <iframe width="560" height="315" src="https://www.youtube.com/embed/AtVzbUZqZcI" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Ora E Kodimit (5 min)**](https://www.youtube.com/embed/AtVzbUZqZcI)

<% elsif @country == 'ca' %>

## Filmy <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p > [**Dołącz do Nowej Szkocji na Godzinę Kodowania (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'id' %>

Di luar dari fakata bahwa Pekan Edukasi Ilmu Komputer jatuh pada 7 hingga 13 Desember 2015, kami mengetahui bahwa banyak siswa-siswi Indonesia yang menjalankan prosesi ujian. Untuk alasan ini kami memutuskan untuk menjalankan masa kampanye Hour of Code di Indonesia pada 12 hingga 20 Desember 2015. Kita tetap akan merasakan kemeriahan yang sama dan dengan tujuan yang sama namun dengan kebersamaan yang lebih besar karena akan ada lebih banyak siswa-siswi yang dapat mengikutinya.

Mari bersama kita dukung gerakan Hour of Code di Indonesia!

<% elsif @country == 'jp' %>

## Godzina Kodowania (アワーオブコード) 2015紹介ビデオ <iframe width="560" height="315" src="https://www.youtube.com/embed/_C9odNcq3uQ" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Godzina Kodowania(アワーオブコード) 2015紹介ビデオ (1 min)**](https://www.youtube.com/watch?v=_C9odNcq3uQ)

[Przewodnik po lekcjach Godziny Kodowania](/files/HourofCodeLessonGuideJapan.pdf)

<% elsif @country == 'nl' %>

  
  
  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/0hfb0d5GxSw" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Przyjaciele Technologii Godziny kodowania (2 min)**](https://www.youtube.com/embed/0hfb0d5GxSw)

<% elsif @country == 'pk' %>

اگر آپ کا تعلق پاکستان کےایسے کیمبرج اسکول سے ہے، جہاں دسمبر کے مہینے میں امتحانات لئے جاتے ہیں، تو آپ اپنے اسکول میں آور آف کوڈ کا انقعاد نومبر ٢٣ تا ٢٩ کے دوران بھی کر سکتے ہیں۔ آپ کا شمار دنیا کی سب سے بڑی تعلیمی تقریب میں حصّہ لینے والوں میں ہی کیا جائے گا۔

<% elsif @country == 'ro' %>

Va multumim pentru inregistrare, daca doriti materiale printate pentru promovarea evenimentului, echipa din Romania vi le poate trimite prin curier. Trebuie doar sa trimiteti un email la HOC@adfaber.org si sa le solicitati.

<% elsif @country == 'uk' %>

# Porady dla organizacji

## Użyj tych notatek do rekrutacji korporacji

[<%= localized_image('/images/fit-500x300/corporations.png') %>](%= localized_file('/files/corporations.pdf') %)

## 1) Wypróbuj samouczki:

Będziemy gościć wiele zabawnych, godzinnych samouczków, utworzonych przez różnych partnerów. Nowe samouczki pojawią się jeszcze przed inauguracją Godziny Kodowania <%= campaign_date('full') %>.

**Wszystkie samouczki Godziny Kodowania:**

- Wymagają od organizatorów niewielkiego czasu na przygotowanie
- Nie wymagają nadzoru, dzięki czemu uczniowie pracują we własnym tempie i na własnym poziomie przygotowania

<a href="https://code.org/learn"><img src="https://code.org/images/tutorials.png"></a>

## 2) Zaplanuj potrzebny sprzęt - komputery nie są niezbędne

Najlepsze efekty związane z Godziną Kodowania osiąga się z komputerami przyłączonymi do Internetu. Ale nie potrzebujesz komputera dla każdego uczestnika, a nawet możesz przeprowadzić Godzinę Kodowania bez komputera.

- **Przetestuj samouczki na szkolnych komputerach lub urządzeniach.** Upewnij się, że działają prawidłowo (z dźwiękiem i obrazem).
- **Przeglądnij strony końcowe z gratulacjami**, aby sprawdzić, co uczniowie zobaczą, kiedy skończą.
- **Zapewnij słuchawki dla swojej grupy** lub poproś uczniów, by przynieśli swoje własne, jeśli samouczek, który wybrałeś, działa najlepiej z dźwiękiem.

## 3) Planuj bazując na urządzeniach, do jakich masz dostęp

- **Jeśli nie wystarcza urządzeń dla wszystkich uczniów,** to mogą [programować w parach](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Gdy uczniowie współpracują ze sobą, pomagają sobie nawzajem i mniej zależą od nauczyciela.
- **Jeśli masz zbyt wolne łącze internetowe,** to pokazuj filmy przed całą klasą, aby każdy uczeń nie musiał pobierać swojego filmu. Możesz też wypróbować samouczki bez komputera lub offline.

## 4) Zainspiruj uczniów - pokaż im film

Pokaż uczniom inspirujący film, aby wystartować z Godziną Kodowania. Przykłady:

- Oryginalny film inaugurujący Code.org, z udziałem Billa Gatesa, Marka Zuckerberga i gwiazdy NBA Chrisa Bosha (Dostępne są wersje trwające [1 minutę](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minut](https://www.youtube.com/watch?v=nKIu9yen5nc) i [9 minut](https://www.youtube.com/watch?v=dU1xS07N-FA))
- [Inauguracja Godziny Kodowania w 2013 roku](https://www.youtube.com/watch?v=FC5FbmsH4fw) lub [wideo z Godziny Kodowania w 2014 roku](https://www.youtube.com/watch?v=96B5-JGA9EQ)
- [Prezydent Obama zachęcający wszystkich uczniów do nauki informatyki](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Spraw, by Twoi uczniowie byli podekscytowani - zrób im krótkie wprowadzenie**

<% elsif @country == 'pe' %>

# La Hora del Código Perú <iframe width="560" height="315" src="https://www.youtube.com/embed/whSt53kn0lM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Pedro Pablo Kuczynski. Presidente del Perú 2016-2021**](https://www.youtube.com/watch?v=whSt53kn0lM)

<% else %>

# Dodatkowe zasoby już wkrótce!

<% end %>