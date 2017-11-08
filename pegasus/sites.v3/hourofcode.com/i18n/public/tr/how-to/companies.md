---
title: '<%= hoc_s(:title_how_to_companies) %>'
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# Kodlama saatini şirketinize nasıl getirirsiniz

## Kodlama Saati için öğrenci ve gönüllülere ilham verin

Code.org, teknoloji alanındaki kariyer deneyimlerini paylaşmaları ve bu alanda çalışmak isteyen öğrencilere ilham verebilmeleri için, çalışanlarınıza, Kod-Saati uygulayan yerel sınıflara [bağlanma](<%= resolve_url('https://code.org/volunteer') %>) fırsatı sunar.

- Gönüllü olarak [kayıt olun](<%= resolve_url('https://code.org/volunteer') %>).
- Çalışanlarınızı teşvik etmek ve onların sınıflara bağlanması hakkında daha fazla açıklama için klavuza[ bakınız](<%= localized_file('/files/hoc-corporate-toolkit.pdf') %>).

## Şirketlerin kodlama saatini destekleyebilecekleri diğer yollar:

- Bilgisayar bilimlerin önemini vurgulamak ve çalışanları teşvik etmek amacıyla şirket kapsamında [eposta](<%= resolve_url('/promote/resources#sample-emails') %>) ile duyuru yapmak için CEO' nuz dan ricada bulunun. 
- Çalışma arkadaşlarınızla Kod-Saati Mutlu Saat [aktiviteleri](<%= resolve_url('/learn') %>) düzenleyin.
- Yaşadığınız yerdeki okul sınıflarına veya kar amacı gütmeyen ortaklara özel olarak şirket ofisinizde bir "Kodlama Saati" etkinliği düzenleyin. Nasıl yapılacağını görmek için aşağıdaki kılavuza göz atın.

# Kod-saati etkinliğine nasıl ev sahipliği yapılır

## 1. Kod-Saatinizi tanıtın

- Kendi [Kodlama Saati](<%= resolve_url('/promote') %>) etkinliğinizi tanıtın ve diğer insanları da bunun için teşvik edin.
- Şirketinizdeki yazılım mühendislerini yerel sınıflardaki öğrencilere Kod Saatinde liderlik etmeleri için cesaretlendirin ve bilgisayar bilimi öğrencilerine ilham vermelerini sağlayın. Yazılım mühendisleri buradan [kayıt](<%= resolve_url('https://code.org/volunteer/engineer') %>) olarak sınıflara bağlanabilir.

## 2. Nasıl Yapılır videosunu izleyin <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 3. Bir etkinlik seçin

Çeşitli ortaklarımız tarafından her yaştan katılımcılar için hazırlanmış [eğlenceli, bir saatlik öğrenme programları](<%= resolve_url('/learn') %>)mıza ev sahipliği yapıyoruz. [Bunları deneyin!](<%= resolve_url('/learn') %>)

Çok az bir hazırlık süresi gerektiren ve kendi kendine yapılabilen - katılımcılara kendi tempo ve yetenek seviyelerinde çalışmaya izin veren **Tüm Kod-Saat faaliyetleri**.

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

## 4. Teknolojik ihtiyaçlarınızı planlayın - bilgisayar kullanmak isteğinize bağlı

En iyi Kodlama Saati deneyimi internete bağlı olan bilgisayarları içerir. Hiçbir katılımcı için bir bilgisayara **ihtiyaç duymazsınız** ve hiç bilgisayar olmadan bile Kodlama Saati yapabilirsin.

**Önceden planla!** Etkinlik başlamadan önce aşağıdakileri yapın:

- Etkinlikleri bilgisayar veya cihazlarda deneyin. Ses ve videoların tarayıcılarda düzgün bir şekilde çalıştıklarından emin olun.
- Eğer seçtiğiniz etkinlik sesli bir etkinlik ise, kulaklık temin edin veya katılımcılardan kendi kulaklıklarını getirmelerini isteyin.
- **Yeterli ekipman yok mu?** o halde [ çift programlayı](https://www.youtube.com/watch?v=vgkahOzFH2Q) kullanın. Çocuklar takım halinde çalıştıklarında birbirlerine yardımcı olacak ve organizatöre daha az ihtiyaç duyacaklar. Ayrıca bu yöntemle öğrenciler bilgisayar biliminin oldukça sosyal olduğunu ve işbirliği gerektirdiğini görmüş olacaklar.
- **Bant genişliğiniz düşük mü?** Videoları etkinliğin ön tarafında göstermeyi planlayın, böylece her öğrencinin videoyu indirmesine gerek kalmayacaktır. Ya da internet bağlantısı gerektirmeyen etkinlikleri deneyin.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring video

Kodlama Saati etkinliğinize katılımcılara ilham vererek ve bilgisayar biliminin hayatımızın her parçasını nasıl etkilediğini anlatarak başlayın. Bilgisayar bilimi ve şirketteki rolünüz hakkında ilham kaynağı olabilecek daha fazla bilgi paylaşın.

**İlham verici bir video gösterin:**

- Bill Gates, Mark Zuckerberg ve NBA yıldızı Chris Bosh'un olduğu orjinal Code.org videosu başlatın ([1 dakika](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 dakika](https://www.youtube.com/watch?v=nKIu9yen5nc) ve [9 dakika](https://www.youtube.com/watch?v=dU1xS07N-FA) versiyonları vardır).
- [2013 Kodlama Saati başlangıç videosu](https://www.youtube.com/watch?v=FC5FbmsH4fw), ya da <% if @country == 'uk' %> [2015 Kodlama Saati videosu](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [2015 Kodlama Saati videosu](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
- [ Başkan Obama tüm öğrencileri bilgisayar bilimi öğrenmeye çağırıyor](https://www.youtube.com/watch?v=6XvmhE1J9PY).
- Daha fazla ilham verici video için [buraya tıklayın](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Kod-saati etkinliğini tanıtmak için fikirler:**

- Teknolojinin hayatımıza etkisini hem kız hem de erkekleri ilgilendirecek şekilde açıklayın.( hayat kurtarmaktan, insanlara yardım etmekten, insanlarla iletişime geçmekten bahsedin.) 
- Eğer bir teknoloji şirketi iseniz, şirket eğlenceli demolar, yenilikçi ürünler üzerinde çalışıyordur.
- Eğer bir teknoloji şirketi değilseniz, şirket sorunları çözmek ve hedeflerine ulaşmak için teknolojiyi kullanır.
- Şirketinizdeki yazılım mühendislerini neden bilgisayar bilimini seçtiler ve projeler üzerinde çalışmaya karar verdiler bunun hakkında konuşması için davet ediyoruz.
- Kızların bilgisayar bilimi ile ilgilenmesine ilişkin ipuçları için [buraya](<%= resolve_url('https://code.org/girls') %>) bakın.

## 6. Kodlayın!

**Katılımcıları aktiviteye yönlendirin**

- Write the activity link on a whiteboard. Find the link listed on the [information for your selected activity](<%= resolve_url('/learn') %>) under the number of participants.
- Genç öğrenciler, eğitim sayfasını daha önceden yükleyin veya yer imi olarak kayıt edin.

**Birisi zorluklarla karşılaştığında şu şekilde yanıtlamak iyidir:**

- "Bilmiyorum. Buna birlikte bakalım."
- "Teknoloji her zaman istediğimiz gibi çalışmaz."
- "Programlama öğrenmek yeni bir dil öğrenmek gibidir; hemen akıcı olmayacaktır."

**Birisi erken bitirdiğinde ne yapmak gerekir?**

- hourofcode.com/learn adresinden başka bir Kodlama Saati aktivitesi deneyebilirler.
- Veya, problemi olan arkadaşlarına yardımcı olabilir.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7) Kutlama

- Katılımcılar ve öğrenciler için [sertifika basın](<%= resolve_url('https://code.org/certificates') %>).
- ["Bir Kodlama Saati yaptım!"](<%= resolve_url('/promote/resources#stickers') %>) yapıştırmaları basılır.
- Çalışanlarınız için [özel sipariş t-shirtler](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more).
- Kod Saati etkinliğinize ait fotoğrafları ve videoları sosyal medyada paylaşın. Paylaşımlarınızda #HourOfCode ve @codeorg etiketlerini kullanın böylece başarılarınızı biz de vurgularız!

[col-33]

![](/images/fit-250/celebrate2.jpeg)

[/col-33]

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

<%= view :signup_button %>