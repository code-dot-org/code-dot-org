---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# Kodlama Zamanı Nasıl Öğretilir

Bu harekete katıl ve bir grup öğrenciye onların bilgisayar bilimindeki ilk saatlerinde yol göster:

## 1) "Nasıl Yapılır" videosunu izleyin <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe> 

## 2) Saatin için bir öğretici seçin:

Her yaştan öğrencilerimize, çeşitli partnerler tarafında yaratılmış çeşitli [eğlenceli, saatlik öğreticiler](<%= resolve_url('/learn') %>) sunuyoruz.

**[Öğrenci yönetiminde yapılan Hour of Code dersleri:](<%= resolve_url('/learn') %>)**

  * Öğretmenler için çok az hazırlık zamanı gerektirir
  * Kendi yönlendirmelerine sahiptir - öğrencilerin kendi hızlarına ve seviyelerine uygun hareket etmelerine izin verir

**[Öğretmen yardımlı Kod Saati Öğreticileri:](<%= resolve_url('https://code.org/educate/teacher-led') %>)**

  * Bazı ders planları ön öğretmen hazırlığı gerektirir
  * Sınıf düzeyi *ve* konu alanına göre kategorilendirilir (örn: Matematik, İngilizce vs)

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

## 3) Kendi kod-saati etkinliğinizi oluşturun

[Bu araçlar ile](<%= resolve_url('/promote') %>) kendi Kodlama Saati'nizi tanıtın ve diğerlerini kendi etkinliklerini düzenlemeleri için teşvik edin.

## 4) Teknolojik ihtiyaçlarınızı planlayın - bilgisayar kullanmak isteğinize bağlı

En iyi Kodlama Saati deneyimi internete bağlı olan bilgisayarları içerir. Ama her çocuk için bir bilgisayara ihtiyaç **yok** ve hiç bir bilgisayar olmadan bile Kodlama Saati yapabilirsin.

**Önceden planla!** Etkinlik başlamadan önce aşağıdakileri yapın:

  * Öğreticiler, öğrenciler üzerinde bilgisayar veya cihazlarda deneyin. Tabi ki ses ve videoların tarayıcılar için düzgün bir şekilde çalıştıklarından emin olun.
  * Seçtiğiniz öğretici ses ile daha iyi öğrenilecekse sınıflarınız için kulaklıklar sağlayın ya da öğrencilere kendilerininkini getirmelerini söyleyin.
  * **Yeterli ekipman yok mu?** o halde [ çift programlayı](https://www.youtube.com/watch?v=vgkahOzFH2Q) kullanın. İki kişilik takımlar halinde çalışan öğrenciler birbirlerine yardımcı olurlar ve öğretmene daha az ihtiyaç duyarlar. Ayrıca bu yöntemle öğrenciler bilgisayar biliminin oldukça sosyal olduğunu ve işbirliği gerektirdiğini görmüş olacaklar.
  * **Bant genişliğiniz düşük mü?** Videoları sınıfın ön tarafından izletin, böylece her öğrencinin kendi videosunu indirmesine gerek kalmayacaktır. Ya da internet bağlantısı gerektirmeyen öğreticileri deneyin.

![](/images/fit-350/group_ipad.jpg)

## 5) Kodlama Saati'nize ilham verici bir konuşma ya da video ile başlayın

**Davet edeceğiniz [yerel bir gönüllü](https://code.org/volunteer/local) yardımı ile bilgisayar biliminin mümkünlüklerinin genişiği ile öğrencilerinize ilham verin.** Dünya çapında Kodlama Saati'ne yardımcı olacak binlerde gönüllü var. [ Bu haritayı kullanarak ](https://code.org/volunteer/local) sınıfınızı ziyaret edebilecek ya öğrenciler ile video görüşme yapabilecek yerel gönüllüler bulun.

[![](/images/fit-300/volunteer-map.png)](<%= resolve_url('https://code.org/volunteer/local') %>)

**İlham verici bir video gösterin:**

  * The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions)
  * [2013 Kodlama Saati başlangıç videosu](https://www.youtube.com/watch?v=FC5FbmsH4fw), ya da <% if @country == 'uk' %> [2015 Kodlama Saati videosu](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [2015 Kodlama Saati videosu](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [President Obama calling on all students to learn computer science](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Daha fazla ilham verici [kaynaklar](<%= resolve_url('https://code.org/inspire') %>) ve[videolar](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP) bulun.

**Öğrencileriniz ve siz bilgisayar bilimine karşı yeniyseniz, bu hiç sorun değil. İşte size Kodlama Saati'ni tanıtacak birkaç aktivite:**

  * Teknolojinin hayatlarımıza olan etkilerini, hem kızların hem de erkeklerin ilgisini çekecek örneklerle açıklayın (Hayat kurtarmak, insanlara yardımcı olmak, insanlara ulaşmak, vb şeyler hakkında konuşun).
  * Sınıfça günlük hayatta kodlama kullanarak yaptığımız şeyleri listeleyin.
  * Kızların bilgisayar bilimi ile ilgilenmesine ilişkin ipuçları için [buraya](<%= resolve_url('https://code.org/girls') %>) bakın.

**Daha fazla yardıma mı ihtiyacınız var?** Burada ki [şablon ders planı](/files/EducatorHourofCodeLessonPlanOutline.docx) indirin.

**Daha fazla öğretim fikirleri istiyorsunuz?** Deneyimli eğitimcilerden [en iyi uygulamaları](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) inceleyin.

## 6) Kod!

**Öğrencileri aktiviteye yönlendirin**

  * Seçtiğiniz içeriğin linkini tahtaya yazın. [seçtiğiniz içerik hakkındaki bilgiler](<%= resolve_url('/learn') %>)i katılımcı listesi altındaki linkte bulabilirsiniz.

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

**Birisi zorluklarla karşılaştığında şu şekillerde yanıtlamak iyidir:**

  * "Bilmiyorum. Buna birlikte bakalım."
  * "Teknoloji her zaman istediğimiz gibi çalışmaz."
  * "Programlama öğrenmek yeni bir dil öğrenmek gibidir; hemen akıcı olmayacaktır."

**[Bu öğretim ipuçlarına bir göz atın](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**Öğrenciler erken bitirirse ne yapmalı?**

  * Öğrenciler bütün alıştırmaları görebilir ve başka aktiviteler denemek için [hourofcode.com/learn](<%= resolve_url('/learn') %>)'e göz atabilir
  * Ya da, erken bitiren öğrencilerden aktiviteyi yapmakta zorlanan diğer arkadaşlarına yardımcı olmalarını rica edin.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Kutlama

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * Öğrencileriniz için [Sertifika basın](<%= resolve_url('https://code.org/certificates') %>).
  * Öğrencileriniz için ["Hour of Code!" ](<%= resolve_url('/promote/resources#stickers') %>) çıkartmaları yazdırın.
  * Okulunuz için [özel sipariş t-shirtler](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more).
  * Kod Saati etkinliğinize ait fotoğrafları ve videoları sosyal medyada paylaşın. Paylaşımlarınızda #HourOfCode ve @codeorg etiketlerini kullanın böylece başarılarınızı biz de vurgularız!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Eğitimciler için diğer Kod Saati kaynakları:

  * Bu [şablon ders planı](/files/EducatorHourofCodeLessonPlanOutline.docx)'nı kullanarak Kodlama Saati'nizi organize edebilirsiniz.
  * Kodlama Saati organizatöründen [en iyi uygulamalar](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466)'a göz atın. 
  * [Eğitimci'nin kılavuzluğundaki Hour of Code web semineri](https://youtu.be/EJeMeSW2-Mw)'ni izleyin.
  * [Hour of Coda'a hazırlanmak için, kurucumuz Hadi Partovi ile S&C](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) 'a katılın.
  * Eğitmenlerden tavsiye, kavrama yardımı ve destek almak için [Hour of Code Öğretmen Forumu](http://forum.code.org/c/plc/hour-of-code)'nu ziyaret edin. <% if @country == 'us' %>
  * [Hour of Code FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code)'u gözden geçirin. <% end %>

## Kodlama Zamanından sonra ne olacak?

Kodlama Saati teknolojinin nasıl çalıştığı ve yazılım uygulamalarının nasıl yapıldığını öğrenmeye giden yolculukta sadece bir ilk adımdır. Bu yolculuğa devam etmek için:

  * Öğrencileri [çevrimiçi öğrenime](<%= resolve_url('https://code.org/learn/beyond') %>) devam etmeleri için destekleyin.
  * Deneyimli bir bilgisayar bilimci ile 1 günlük yüz yüze atölyeye [katılın](<%= resolve_url('https://code.org/professional-development-workshops') %>). (Sadece ABD eğitmenleri için)

<%= view :signup_button %>