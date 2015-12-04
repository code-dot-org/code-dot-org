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

## ვიდეოები <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
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

## Use this handout to recruit corporations

[<%= localized_image('/images/fit-500x300/corporations.png') %>](<%= localized_file('/files/corporations.pdf') %>)

## 1) ნახეთ ტუტორიალები:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**კოდის ერთი საათის ყველა ტუტორიალი:**

  * ორგანიზატორებისგან მომზადების მინიმალურ დროს მოითხოვს
  * აძლევს მოსწავლეს საშუალებას საკუთარი ტემპისა და უნარების მიხედვით იმეცადინოს

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) დაგეგმეთ, რა ტექნიკა დაგჭირდებათ - კომპიუტერები არ არის აუცილებელი

საუკეთესო გამოცდილებას კომპიუტერებითა და ინტერნეტით აღჭურვილ კლასში მიიღებთ, თუმცა თქვენ არ გჭირდებათ კომპიუტერი ყოველი ბავშვისთვის - და საერთოდ კომპიუტერის გარეშეც შეგიძლიათ კოდის ერთი საათის ჩატარება.

  * ** გატესტეთ ტუტორიალების მუშაობა მოსწავლეების კომპიუტერებზე.** დარმწუნდით, რომ ვიდეო ჩანს და ხმა ისმის.
  * **გაცანით მილოცვის გვერდს** და გაიგეთ, რას ნახავენ მოსწავლეები როცა დაასრულებენ ტუტორიალს. 
  * **არ დაგავიწყდეთ კლასის ყურსასმენებით უზრუნველყოფა**, ან სთხოვეთ მოსწავლეებს მოიტანონ თავიანთი, თუ თქვენ მიერ შერჩეული ტუტორიალის გასავლელად საჭიროა ხმა.

## 3) დაგეგმეთ წინასწარ, თქვენთვის მისაწვდომი ტექნიკის გათვალისწინებით

  * **არ გაქვს საკმარისი მოწყობილობა?** გამოიყენეთ [პროგრამირება წყვილებში](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). ერთად მუშაობისას მონაწილეები ეხმარებიან ერთმანეთს და ნაკლებად მოითხოვენ მასწავლებლის ყურადღებას.
  * **ინტერნეტს დაბალი სიჩქარე აქვს?** აჩვენეთ ვიდეოები ერთ დიდ ეკრანზე - ასე ყოველ მოსწავლეს არ დასჭირდება ცალკე ჩატვირთოს ვიდეო. ან სცადეთ ოფლაინ-ტუტორიალები.

## 4) შთააგონეთ მოსწავლეები - აჩვენეთ მათ ვიდეო

აჩვენეთ მოსწავლეებს ჩვენი ერთ-ერთი ვიდეო კოდის ერთი საათის ენერგიულად დასაწყებად. მაგალითად:

  * Code.org-ის მთავარი ვიდეო-რგოლი, რომელშიც ლაპარაკობენ ბილ გეითსი, მარკ ცუკერბერგი და NBA ვარსკვლავი ქრის ბოში (ხანგრძლივობა: [1 წუთი](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 წუთი](https://www.youtube.com/watch?v=nKIu9yen5nc) ან [9 წუთი](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [პრეზიდენტი ობამა მოუწოდებს ყველა მოსწავლეს პროგრამირების სწავლას](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**დააინტერესეთ თქვენი მოსწავლეები - აჩვენეთ, რასთან აქვთ საქმე**

<% else %>

# დამატებითი რესურსები მალე!

<% end %>

<%= view :signup_button %>