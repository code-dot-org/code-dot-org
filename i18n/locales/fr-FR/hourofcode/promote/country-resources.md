---
title: <%= hoc_s(:title_country_resources).inspect %>
layout: wide
nav: promote_nav
---

<%= view :signup_button %>

<% if @country == 'la' %>

# Recursos

## ¿Qué hacemos cuando hacemos la Hora del Código ?

<div class="handout" style="width: 50%; float: left;">
  
<a href="/la/files/hacemos-la-Hora-del-Codigo.pdf" target="_blank"><img src="/la/images/fit-260/hacemos-la-Hora-del-Codigo.png"></a>
<br />En Español
</div>

<div class="handout" style="width: 50%; float: left;">
  
<a href="/la/files/hacemos-la-Hora-del-Codigo-Ingles.pdf" target="_blank"><img src="/la/images/fit-260/hacemos-la-Hora-del-Codigo-Ingles.png"></a>
<br />En francés
</div>

<div style="clear:both"></div>

## Vídeos

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<a href="https://www.youtube.com/watch?v=HrBh2165KjE"><strong>¿Por qué todos tienen que aprender a programar ? Participá de la Hora del Código en Argentine (5 min)</strong></a>

  
  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

  
[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=_vq6Wpb-WyQ)

<% elsif @country == 'al' %> <iframe width="560" height="315" src="https://www.youtube.com/embed/AtVzbUZqZcI" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Ora E Kodimit (5 min)**](https://www.youtube.com/embed/AtVzbUZqZcI)

<% elsif @country == 'ca' %>

## Vidéos <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Joignez-vous à la Nouvelle-Écosse pour l'Heure du Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'id' %>

Di luar dari fakata bahwa Pekan Edukasi Ilmu Komputer jatuh pada 7 hingga 13 Desember 2015, kami mengetahui bahwa banyak siswa-siswi Indonesia yang Menjalankan prosesi ujian. Untuk alasan ini kami memutuskan untuk menjalankan masa kampanye Hour of Code di Indonesia Pada 12 hingga 20 Desember 2015. Kita tetap akan merasakan kemeriahan yang sama dan dengan tujuan yang sama namun dengan kebersamaan yang lebih besar karena akan ada lebih banyak siswa-siswi yang dapat mengikutinya.

Mari bersama kita dukung gerakan Hour of Code di Indonesia!

<% elsif @country == 'jp' %>

## L'Heure de Code(アワーオブコード) 2015紹介ビデオ <iframe width="560" height="315" src="https://www.youtube.com/embed/_C9odNcq3uQ" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**l'Heure de Code(アワーオブコード) 2015紹介ビデオ (1 min)**](https://www.youtube.com/watch?v=_C9odNcq3uQ)

[Guide de Leçons Heure de Code](/files/HourofCodeLessonGuideJapan.pdf)

<% elsif @country == 'nl' %>

  
  
  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/0hfb0d5GxSw" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Amis de la Technologie Heur de Code (2 min)**](https://www.youtube.com/embed/0hfb0d5GxSw)

<% elsif @country == 'pk' %>

اگر آپ کا تعلق پاکستان کےایسے کیمبرج اسکول سے ہے، جہاں دسمبر کے مہینے میں امتحانات لئے جاتے ہیں، تو آپ اپنے اسکول میں آور آف کوڈ کا انقعاد نومبر ٢٣ تا ٢٩ کے دوران بھی کر سکتے ہیں۔ آپ کا شمار دنیا کی سب سے بڑی تعلیمی تقریب میں حصّہ لینے والوں میں ہی کیا جائے گا۔

<% elsif @country == 'ro' %>

Va multumin pentru inregistrate, daca doriti materiale printate pentru promovarea ebenimentulul, echipa din Romania vi le poate trimite prin curier. Trebule doar sa trimiteti un email la HOC@adfaber.org si sa le solicitati.

<% elsif @country == 'uk' %>

# Guide Comment-Faire pour les Organizations

## Utilisez ce document pour recruter les compagnies

[<%= localized_image('/images/fit-500x300/corporations.png') %>](%= localized_file('/files/corporations.pdf') %)

## 1) Essayez les tutoriels:

Nous allons mettre en place plusieurs tutoriels amusants durant un heur, créés par plusieurs partenaires. De nouveaux tutoriels arrivent pour commencer l'Heure de Code avant<%= campaign_date('full') %>.

**Tous les tutoriels de l'Heure de Code:**

- Nécessitent un minimum de préparation
- Sont guidés, pour permettre aux élèves de travailler à leur rythme et à leur niveau

<a href="https://code.org/learn"><img src="https://code.org/images/tutorials.png"></a>

## 2) Planifier vos besoins en matériel - les ordinateurs sont facultatifs

La meilleure expérience Heur de Code sera avec des ordinateurs en-ligne. Mais vous n'avez pas besoin d'une ordinateur pour chaque participant, et vous pouvez même faire l'Heur de Code sans aucun ordinateur du tout.

- **Testez les tutoriels sur les ordinateurs ou le matériel qu'utiliseront les élèves.** Assurez-vous que tout fonctionne correctement (avec son et vidéo).
- **Prévisualisez la page de félicitation** pour voir ce que les élèves verront lorsqu'ils auront fini.
- **Fournissez des écouteurs à votre classe**, ou demandez à vos élèves de prendre les leurs, si le tutoriel que vous avez choisi fonctionne mieux avec du son.

## 3) Planifiez à l'avance vos ressources réseau et matériel disponible

- **Vous n'avez pas assez de matériel ?** Faites de la [programmation en binôme](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Lorsque les participants travaillent en binôme, ils peuvent s'entraider et s'appuie moins sur l'enseignant.
- **Vous avez une connexion internet lente ?** Prévoyez de montrer les vidéos devant toute la classe, ainsi, les élèves n'auront pas à les télécharger. Autrement, essayez les tutoriels qui ne requièrent pas de connexion.

## 4) Inspirez les élèves - montrez leur une video

Show students an inspirational video to kick off the Hour of Code. Examples:

- La vidéo originale du lancement de Code.org, avec Bill Gates, Mark Zuckerberg et la star de la NBA Chris Bosh (Il y a une version [d'1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [de 5 minutes](https://www.youtube.com/watch?v=nKIu9yen5nc), et [de 9 minutes](https://www.youtube.com/watch?v=dU1xS07N-FA) disponible )
- The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
- [Le président Obama a lancé un appel, invitant tous les étudiants à apprendre l'informatique](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

<% elsif @country == 'pe' %>

# La Hora del Código Perú <iframe width="560" height="315" src="https://www.youtube.com/embed/whSt53kn0lM" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

<

p>[**Pedro Pablo Kuczynski. Presidente del Perú 2016-2021**](https://www.youtube.com/watch?v=whSt53kn0lM)

<% else %>

# Ressources supplémentaires très bientôt disponibles !

<% end %>