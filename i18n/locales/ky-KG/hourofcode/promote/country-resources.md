---
title: <%= hoc_s(:title_country_resources).inspect %>
layout: wide
nav: promote_nav
---

<%= view :signup_button %>

<% if @country == 'la' %>

# Ресурстар

## Код саатында биз эмнелерди кылабыз?

<div class="handout" style="width: 50%; float: left;">
  
<a href="/la/files/hacemos-la-Hora-del-Codigo.pdf" target="_blank"><img src="/la/images/fit-260/hacemos-la-Hora-del-Codigo.png"></a>
<br />Испанча
</div>

<div class="handout" style="width: 50%; float: left;">
  
<a href="/la/files/hacemos-la-Hora-del-Codigo-Ingles.pdf" target="_blank"><img src="/la/images/fit-260/hacemos-la-Hora-del-Codigo-Ingles.png"></a>
<br />Англисче
</div>

<div style="clear:both"></div>

## Видеолор

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<a href="https://www.youtube.com/watch?v=HrBh2165KjE"><strong>Эмне үчүн баары програмдаганды үйрөнүшү керек? Аргентинадагы Код саатына катышкыла (5 мүн)</strong></a>

  
  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

  
[**Код сааты Чилиде (2 мүн)**](https://www.youtube.com/watch?v=_vq6Wpb-WyQ)

<% elsif @country == 'al' %> <iframe width="560" height="315" src="https://www.youtube.com/embed/AtVzbUZqZcI" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Ora E Kodimit (5 min)**](https://www.youtube.com/embed/AtVzbUZqZcI)

<% elsif @country == 'ca' %>

## Видеолор <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'id' %>

Di luar dari fakata bahwa Pekan Edukasi Ilmu Komputer jatuh pada 7 hingga 13 Desember 2015, kami mengetahui bahwa banyak siswa-siswi Indonesia yang menjalankan prosesi ujian. Untuk alasan ini kami memutuskan untuk menjalankan masa kampanye Hour of Code di Indonesia pada 12 hingga 20 Desember 2015. Kita tetap akan merasakan kemeriahan yang sama dan dengan tujuan yang sama namun dengan kebersamaan yang lebih besar karena akan ada lebih banyak siswa-siswi yang dapat mengikutinya.

Mari bersama kita dukung gerakan Hour of Code di Indonesia!

<% elsif @country == 'jp' %>

## Hour of Code(アワーオブコード) 2015紹介ビデオ <iframe width="560" height="315" src="https://www.youtube.com/embed/_C9odNcq3uQ" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Hour of Code(アワーオブコード) 2015紹介ビデオ (1 min)**](https://www.youtube.com/watch?v=_C9odNcq3uQ)

[Код сааты сабак жетектемеси](/files/HourofCodeLessonGuideJapan.pdf)

<% elsif @country == 'nl' %>

  
  
  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/0hfb0d5GxSw" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Технологиялык Код саатынын достору (2 мүн)**](https://www.youtube.com/embed/0hfb0d5GxSw)

<% elsif @country == 'pk' %>

اگر آپ کا تعلق پاکستان کےایسے کیمبرج اسکول سے ہے، جہاں دسمبر کے مہینے میں امتحانات لئے جاتے ہیں، تو آپ اپنے اسکول میں آور آف کوڈ کا انقعاد نومبر ٢٣ تا ٢٩ کے دوران بھی کر سکتے ہیں۔ آپ کا شمار دنیا کی سب سے بڑی تعلیمی تقریب میں حصّہ لینے والوں میں ہی کیا جائے گا۔

<% elsif @country == 'ro' %>

Va multumim pentru inregistrare, daca doriti materiale printate pentru promovarea evenimentului, echipa din Romania vi le poate trimite prin curier. Trebuie doar sa trimiteti un email la HOC@adfaber.org si sa le solicitati.

<% elsif @country == 'uk' %>

# Уюмдар үчүн кандай өтүү жетектемеси

## Баракчаны компанияларды тартуу үчүн колдонгула

[<%= localized_image('/images/fit-500x300/corporations.png') %>](%= localized_file('/files/corporations.pdf') %)

## 1) Жетектемелерди көргүлө:

Биз түрдүү өнөктөрүбүз түзгөн бир сааттык жетектемелер менен камсыздайбыз. Жаңы жетектемелер <%= campaign_date('full') %> күнү Код сааты башталгыча түшүп турат.

**Код саатынын көнүгүүлөрү:**

- Даярданууга көп убакыт талап кылбайт
- Өзүнчө ишке - окуучулар өз жөндөмүнө жараша иштегенге ылайыкташкан

<a href="https://code.org/learn"><img src="https://code.org/images/tutorials.png"></a>

## 2) Техниканы пландаштыруу - компүтер, бар болсо

Код сааты интернетке туташкан компүтерлер менен мыкты өтөт. Бирок ар бир катышуучуга компүтер болушу керек эмес, Код саатын компүтерсиз өткөзсө деле болот.

- **Жетектемелерди окуучулардын компүтеринде же түзмөрүндө текшергиле.** Видео ж-а үн иштегени анык болсун.
- **Куттуктоо барагын карап**, окуучулар аяктаганда эмнени көрүшөрүн билгиле.
- Үнү бар жетектеме тандасаңыз, **топту кулакчындар менен камсыздагыла**, же окуучуларга өздөрүнүкүн ала келүүсүн айткыла.

## 3) Техниканын жетиштүүлүгүнө жараша пландаштыргыла

- **Түзмөктөр жетишпейби?** [Жупташып иштеп](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning) көргүлө. Катышуучулар өнөктөшкөндө, бири-бирине жардамдашып, окутуучуга азыраак кайрылышат.
- **Интернет жайбы?** Ар бир окуучу өзү жүктөбөсү үчүн, видеолорду катышуучуларга жалпы көрсөтүүнү пландаштыргыла же офлайн жетектемелерди колдонгула.

## 4) Видео көрсөткүлө - шыктандыргыла

Код саатын шыктандыруучу видео көрсөтүү менен баштагыла. Мисалдар:

- Code.org тааныштыруу видеосу, Билл Гейтс, Марк Цукерберг жана NBA жылдызы Крис Бош тартылган (Анын [1 мүнөт](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 мүнөт](https://www.youtube.com/watch?v=nKIu9yen5nc) жана [9 мүнөт](https://www.youtube.com/watch?v=dU1xS07N-FA) версиялары бар)
- The [Код сааты 2013 бетачар видеосу](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Код сааты 2014 бетачар видеосу](https://www.youtube.com/watch?v=96B5-JGA9EQ)
- [Президент Обама окуучуларды компүтердик илимди өздөштүрүүгө чакырат](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Окуучуларды таң калтыргыла - кыска киришме бергиле**

<% elsif @country == 'pe' %>

# La Hora del Código Perú <iframe width="560" height="315" src="https://www.youtube.com/embed/whSt53kn0lM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Педро Пабло Кучински. Перунун президенти 2016-2021**](https://www.youtube.com/watch?v=whSt53kn0lM)

<% else %>

# Жакында кошумча ресурстар пайда болот!

<% end %>