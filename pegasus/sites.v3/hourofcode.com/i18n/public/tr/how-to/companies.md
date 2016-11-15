---

title: <%= hoc_s(:title_how_to_companies) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# Kodlama saatini şirketinize getirmek için

## Gönüllü ve öğrencilere kodlama saati için ilham verir

**Code.org offers company employees the opportunity to [connect](<%= resolve_url('https://code.org/volunteer') %>) with local classrooms doing the Hour of Code to share their tech career experience and inspire students to study computer science.**

  * Gönüllü olarak [kayıt olun](<%= resolve_url('https://code.org/volunteer') %>).
  * Daha fazla önerge için çalışanlarla sınıflara bağlanın [şirket ortakları rehberine](<%= localized_file('/files/HourOfCodeGuideForCorporatePartners.pdf') %>) danışın.

## Şirketinizin kodlama saatini desteklemesi için ek yollar:

  * Bir iletişim zaman tüneli oluşturmak için bizim [pazarlama araçlarımız](<%= localized_file('/files/HourOfCodeInternalMarketingToolkit.pdf') %>)ı kullanın veya promosyon içerik paylaşmak için kullanın.
  * Sirketinin CEOsundan bilgisayar bilimi önemini vurgulayan ve çalışanlarına bu epostaya yaymayi teşvik eden şirket çapında bir e-posta göndermesini rica et. [Bu e-postaya bakınız.](<%= resolve_url('/promote/resources#sample-emails') %>).
  * Arkadaşlarınızla eğlenceli [eğitimler](<%= resolve_url('https://code.org/learn') %>) ile kodlama saati yapmak için ev sahipliği yapın.
  * Host an Hour of Code event for a local classroom of students or non profits partners to do an Hour of Code at your company’s office. See event how-to guide below.

## Kodlama saati etkinliğine nasıl ev sahipliği yapılır

## 1) Kendi Kodlama Saati'nizi destekleyin

  * Kendi [Kodlama saati](<%= resolve_url('/promote') %>) etkinliğinizi destekleyin ve diğer insanlara ev sahipliği yapmaları için cesaretlendirin.
  * Şirketinizdeki **yazılım mühendislerini** yerel sınıflardaki öğrencilere Kod Saatinde liderlik etmeleri için cesaretlendirin ve bilgisayar bilimi öğrencilerine ilham vermelerini sağlayın. Yazılım mühendisleri buradan [kayıt](<%= resolve_url('https://code.org/volunteer/engineer') %>) olarak sınıflara bağlanabilir.

## 2) Nasıl Yapılır videosunu izleyin <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) Bir öğretici seçin:

We’ll host a variety of [fun, hour-long tutorials](<%= resolve_url('https://code.org/learn') %>) for participants of all ages, created by a variety of partners. [Bunları deneyin!](<%= resolve_url("https://code.org/learn") %>)

**Tüm Kodlama Zamanı öğreticileri:**

  * Hazırlık biraz zaman gerektirir
  * Are self-guided - allowing participants to work at their own pace and skill-level

[![](/images/fit-700/tutorials.png)](<%= resolve_url('https://code.org/learn') %>)

## 4) Teknolojik ihtiyaçlarınızı planlayın - bilgisayar kullanımı isteğe bağlı

En iyi Kodlama Saati deneyimi internete bağlı olan bilgisayarları içerir. Hiçbir katılımcı için bir bilgisayara **ihtiyaç duymazsınız** ve hiç bilgisayar olmadan bile Kodlama Saati yapabilirsin.

**Önceden planla!** Etkinlik başlamadan önce aşağıdakileri yapın:

  * Öğreticileri bilgisayar veya cihazlarda deneyin. Tabi ki ses ve videoların tarayıcılar için düzgün bir şekilde çalıştıklarından emin olun.
  * Etkinlik için kulaklıklar temin edin veya katılımcılardan kendi kulaklıklarını getirmelerini isteyin eğer seçtiğiniz öğretici sesli bir öğretici ise bu en iyisi olacaktır.
  * **Yeterli ekipman yok mu?** o halde [ çift programlayı](https://www.youtube.com/watch?v=vgkahOzFH2Q) kullanın. Çocuklar takım halinde çalıştıklarında birbirlerine yardımcı olacak ve organizatöre daha az ihtiyaç duyacaklar. Ayrıca bu yöntemle öğrenciler bilgisayar biliminin oldukça sosyal olduğunu ve işbirliği gerektirdiğini görmüş olacaklar.
  * **Bant genişliğiniz düşük mü?** Videoları sınıfın ön tarafından izletin, böylece her öğrencinin videoyu indirmesine gerek kalmayacaktır. Ya da internet bağlantısı gerektirmeyen öğreticileri deneyin.

![](/images/fit-350/group_ipad.jpg)

## 5) Kodlama Saati etkinliğinizi ilham verici bir video ile başlatın

Kodlama Saati etkinliğinize katılımcılara ilham vererek ve bilgisayar biliminin hayatımızın her parçasını nasıl etkilediğini anlatarak başlayın. Bilgisayar bilimi ve şirketteki rolünüz hakkında ilham kaynağı olabilecek daha fazla bilgi paylaşın.

**İlham verici bir video gösterin:**

  * The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions)
  * [2013 Kodlama Saati başlangıç videosu](https://www.youtube.com/watch?v=FC5FbmsH4fw), ya da <% if @country == 'uk' %> [2015 Kodlama Saati videosu](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [2015 Kodlama Saati videosu](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [President Obama calling on all students to learn computer science](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Daha fazla ilham verici video için [buraya tıklayın](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Kod saati etkinliğini tanıtmak için fikirler:**

  * Explain ways technology impacts our lives, with examples both boys and girls will care about (Talk about technology that’s saving lives, helping people, connecting people). 
  * Eğer bir teknoloji şirketi iseniz, şirket eğlenceli demolar, yenilikçi ürünler üzerinde çalışıyordur.
  * Eğer bir teknoloji şirketi değilseniz, şirket sorunları çözmek ve hedeflerine ulaşmak için teknolojiyi kullanır.
  * Şirketinizdeki yazılım mühendislerini neden bilgisayar bilimini seçtiler ve projeler üzerinde çalışmaya karar verdiler bunun hakkında konuşması için davet ediyoruz.
  * See tips for getting girls interested in computer science [here](<%= resolve_url('https://code.org/girls') %>).

## 6) Code!

**Direct participants to the activity**

  * Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('https://code.org/learn') %>) under the number of participants.
  * Genç öğrenciler, eğitim sayfasını daha önceden yükleyin veya yer imi olarak kayıt edin.

**When participants come across difficulties it's okay to respond:**

  * “I don’t know. Let’s figure this out together.”
  * “Technology doesn’t always work out the way we want.”
  * “Learning to program is like learning a new language; you won’t be fluent right away.”

**What to do if someone finishes early?**

  * Onlar başka bir Kodlama Saati etkinliğini code.org/learn 'dan deneyebilir
  * Veya, problemi olan arkadaşlarına yardımcı olabilir.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Celebrate

  * Katılımcılar için [Sertifika basılır](<%= resolve_url('https://code.org/certificates') %>).
  * ["Bir Kodlama Saati yaptım!"](<%= resolve_url('/promote/resources#stickers') %>) yapıştırmaları basılır.
  * Çalışanlarınız için [özel sipariş t-shirtler](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more).
  * Share photos and videos of your Hour of Code event on social media. Use #HourOfCode and @codeorg so we can highlight your success, too!

[col-33]

![](/images/fit-250/celebrate2.jpeg)

[/col-33]

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Kodlama Zamanından sonra ne olacak?

Kodlama Zamanı, teknolojinin nasıl çalıştığı hakkında daha fazla bilgi edinme ve uygulama yazılımı oluşturmayı öğrenme yolculuğunda sadece ilk basamaktır. Bu yolculuğa devam etmek için, [çocuklarınızı çevrimiçi öğrenmeye teşvik edin](http://uk. code. org/learn/beyond).

<%= view :signup_button %>