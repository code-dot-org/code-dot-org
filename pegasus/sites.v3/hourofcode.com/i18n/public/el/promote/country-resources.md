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

p>[**¿Por qué todos tienen que aprender a programar? Participá de la Hora del Código en Argentina (5 min)**](https://www.youtube.com/watch?v=HrBh2165KjE)

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen></iframe>
<

p>[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=vq6Wpb-WyQ)

<% elsif @country == 'ca' %>

## Βίντεος <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
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

**Όλοι οι εκπαιδευτικοί οδηγοί για την Ώρα του Κώδικα:**

  * Απαιτούν ελάχιστο χρόνο προετοιμασίας από τους διοργανωτές
  * Είναι αυτο-καθοδηγούμενοι - επιτρέποντας στους μαθητές να δουλεύουν με τον δικό τους ρυθμό και σύμφωνα με τις ικανότητές τους

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Plan your hardware needs - computers are optional

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Δοκίμασε τους οδηγους στους υπολογιστές ή τις συσκευές των μαθητών.** Βεβαιώσου ότι δουλεύουν σωστά (με ήχο και βίντεο).
  * **Κάνε προεπισκόπηση της σελίδας των συγχαρητηρίων** για να δεις τι θα βλέπουν οι μαθητές όταν τελειώνουν. 
  * **Δώσε ακουστικά στην ομάδα σου**, ή ζήτησε τους να φέρουν τα δικά τους, αν η δραστηριότητα που επέλεξες λειτουργεί καλύτερα με ήχο.

## 3) Plan ahead based on your technology available

  * **Δεν έχεις αρκετές συσκευές;** Χρησιμοποίησε τον [προγραμματισμό σε ζευγάρια](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Όταν οι συμμετέχοντες συνεργάζονται, βοηθούν ο ένας τον άλλον και βασίζονται λιγότερο στον εκπαιδευτικό.
  * **Έχεις αργή σύνδεση στο δίκτυο;** Δείξε τα βίντεο κεντρικά σε όλη την τάξη ώστε να μη χρειάζεται ο κάθε μαθητής να κατεβάζει το δικό του βίντεο. Ή δοκίμασε εκπαιδευτικούς οδηγούς που δεν απαιτούν σύνδεση στο διαδίκτυο.

## 4) Inspire students - show them a video

Show students an inspirational video to kick off the Hour of Code. Examples:

  * Το αρχικό βίντεο του Code.org, με τον Bill Gates, τον Mark Zuckerberg και τον παίχτη του ΝΒΑ Chris Bosh (Υπάρχουν εκδόσεις [1 λεπτού](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 λεπτών](https://www.youtube.com/watch?v=nKIu9yen5nc) και [9 λεπτών](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Ο πρόεδρος Ομπάμα καλεί όλους του μαθητές να μάθουν την Επιστήμη της Πληροφορικής](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

<% else %>

# Πρόσθετο υλικό έρχεται σύντομα!

<% end %>

<%= view :signup_button %>