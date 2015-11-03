---

title: <%= hoc_s(:title_country_resources) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

<% if @country == 'la' %>

# Recursos

## Vídeos <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe>
<

p>[**Perché tutti dovrebbero imparare a programmare? Participa all'Ora del Codice in Argentina(5 min)**](https://www.youtube.com/watch?v=HrBh2165KjE)

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen></iframe>
<

p>[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=vq6Wpb-WyQ)

<% elsif @country == 'ca' %>

## Video <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
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

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<%= localized_image('/images/fit-500x300/corporations.png') %>](<%= localized_file('/files/corporations.pdf') %>)

## 1) Try the tutorials:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Tutti i tutorial dell'Ora del Codice:**

  * Richiedono un tempo di preparazione minimo per gli organizzatori
  * Sono autoesplicativi e permettono agli studenti di lavorare in base al proprio ritmo e al proprio livello di preparazione

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Plan your hardware needs - computers are optional

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Prova le lezioni sui computer o sui dispositivi degli studenti.** Assicurati che i loro audio e video funzionino correttamente.
  * **Guarda la pagina delle congratulazioni** per vedere cosa vedranno gli studenti al termine. 
  * **Fornisci cuffie o auricolari al tuo gruppo**, o chiedi agli studenti di portare le loro, se il tutorial che hai scelto funziona meglio con il sonoro.

## 3) Plan ahead based on your technology available

  * **Non hai abbastanza dispositivi per tutti gli studenti?** Fai lavorare i tuoi studenti [in coppia](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Quando gli studenti collaborano si aiutano a vicenda e hanno meno bisogno dell'aiuto dell'insegnante.
  * **Hai una ridotta velocità di connessione a Internet?** Mostra tu i video a tutta la classe, in modo da evitare che ogni studente li scarichi. Oppure prova ad usare le lezioni "Senza Rete" (che non necessitano di connessione ad internet).

## 4) Inspire students - show them a video

Show students an inspirational video to kick off the Hour of Code. Examples:

  * Il video originale del sito Code.org, in collaborazione con Bill Gates, Mark Zuckerberg e la stella del basket americano Chris Bosh (Ci sono versioni da [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minuti](https://www.youtube.com/watch?v=nKIu9yen5nc) e [9 minuti](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Il video del Presidente Obama che invita gli studenti ad imparare l'informatica](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

<% else %>

# Ulteriori risorse in arrivo!

<% end %>

<%= view :signup_button %>