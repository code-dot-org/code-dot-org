---

title: <%= hoc_s(:title_country_resources) %>
layout: wide
nav: promote_nav

---


<% if @country == 'la' %>

# Zasoby

## Wídeo <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe>
<

p>[**¿Por qué todos tienen que aprender a programar? Participá de la Hora del Código en Argentina (5 min)**](https://www.youtube.com/watch?v=HrBh2165KjE)

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen></iframe>
<

p>[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=vq6Wpb-WyQ)

<% elsif @country == 'ca' %>

## Filmy <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'id' %>

Di luar dari fakata bahwa Pekan Edukasi Ilmu Komputer jatuh pada 7 hingga 13 Desember 2015, kami mengetahui bahwa banyak siswa-siswi Indonesia yang menjalankan prosesi ujian. Untuk alasan ini kami memutuskan untuk menjalankan masa kampanye Hour of Code di Indonesia pada 12 hingga 20 Desember 2015. Kita tetap akan merasakan kemeriahan yang sama dan dengan tujuan yang sama namun dengan kebersamaan yang lebih besar karena akan ada lebih banyak siswa-siswi yang dapat mengikutinya.

Mari bersama kita dukung gerakan Hour of Code di Indonesia!

<% elsif @country == 'jp' %>

## Hour of Code(アワーオブコード) 2015紹介ビデオ <iframe width="560" height="315" src="https://www.youtube.com/embed/_C9odNcq3uQ" frameborder="0" allowfullscreen></iframe>
<

p>[**Hour of Code(アワーオブコード) 2015紹介ビデオ (1 min)**](https://www.youtube.com/watch?v=_C9odNcq3uQ)

[Hour of Code Lesson Guide](/files/HourofCodeLessonGuideJapan.pdf)

<% elsif @country == 'pk' %>

اگر آپ کا تعلق پاکستان کےایسے کیمبرج اسکول سے ہے، جہاں دسمبر کے مہینے میں امتحانات لئے جاتے ہیں، تو آپ اپنے اسکول میں آور آف کوڈ کا انقعاد نومبر ٢٣ تا ٢٩ کے دوران بھی کر سکتے ہیں۔ آپ کا شمار دنیا کی سب سے بڑی تعلیمی تقریب میں حصّہ لینے والوں میں ہی کیا جائے گا۔

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Użyj tych notatek do rekrutacji korporacji

[<%= localized_image('/images/fit-500x300/corporations.png') %>](<%= localized_file('/files/corporations.pdf') %>)

## 1) Wypróbuj samouczki:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Wszystkie samouczki Godziny Kodowania:**

  * Require minimal prep-time for organizers
  * Nie wymagają nadzoru, co pozwala uczniom pracować we własnym tempie, zgodnie z ich predyspozycjami

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Zaplanuj jakiego sprzętu będziesz potrzebować - komputery nie są koniecznością

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Przetestuj samouczki na szkolnych komputerach lub urządzeniach.** Upewnij się, że działają prawidłowo (z dźwiękiem i obrazem).
  * **Zrób podgląd strony końcowej z gratulacjami** aby sprawdzić, co uczniowie zobaczą kiedy skończą zadania. 
  * **Zapewnij słuchawki dla swojej grupy** lub poproś uczestników, by przynieśli swoje, tylko jeśli poradnik, który wybrałeś działa najlepiej z dźwiękiem.

## 3) Zadbaj o dobre zaplanowanie, mając na uwadze jakie urządzenia będą dla Ciebie dostępne

  * **Nie wystarcza urządzeń dla wszystkich uczniów?** Mogą oni [programować w parach](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Kiedy dzieci będą ze sobą współpracować, będą pomagać sobie nawzajem i mniej polegać na organizatorze.
  * **Masz wolne łącze?** Pokazuj filmy całej klasie na projektorze, aby każdy uczeń nie musiał pobierać swojego filmu. Możesz też wypróbować samouczki offline.

## 4) Zainspiruj uczniów - pokaż im film

Pokaż uczniom inspiracyjny filmik żeby wystartować Godzinę Kodowania. Przykłady:

  * Orginalny film inaugurujący Code.org, z udziałem Billa Gatesa, Marka Zuckerberga i gwiazdy koszykówki Chrisa Bosha (Dostępne są wersje trwające [1 minutę](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minut](https://www.youtube.com/watch?v=nKIu9yen5nc) i [9 minut](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Prezydent Obama zachęcający wszystkich studentów do nauki informatyki](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Niech Twoi uczniowie będą podekscytowani - zrób im krótkie wprowadzenie**

<% else %>

# Dodatkowe zasoby już wkrótce!

<% end %>

