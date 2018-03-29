---
title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Kodlama saatini tanıtın

## Bir Kod-Saatine ev sahipliği mi yapacaksınız? [Nasıl yapılır rehberimize bir göz atın](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Bu posterleri okulunuza asın

<%= view :promote_posters %>

<a id="social"></a>

## Bunları sosyal medyada paylaşın

[![Görüntü](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![Görüntü](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![Görüntü](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Etkinliği yaymak için Kod-Saati logosunu kullanın

[![Görüntü](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Yüksek çözünürlüklü versiyonu indirin](http://images.code.org/share/hour-of-code-logo.zip)

**"Kod-Saati" nin ticari hakları korunur. Kullanımını önlemek istemiyoruz, ancak birkaç sınır dahilinde olduğundan emin olmak istiyoruz:**

1. "Hour of Code"'a yapılan bir referans marka isminden çok, bu isim altında gelişen köklü harekete hitap etmelidir. **İyi bir örnek:"Kodlama Saati™" programına ACMECorp.com'da katılın ". Kötü bir örnek: "ACME Corp tarafından gerçekleştirilen Kodlama Saatini deneyin".**
2. Hem web sitenizde hem de uygulama açıklamalarında "Kodlama Saati"nden bahsettiğiniz en önemli yerlerde" TM" yi bir üst simge kullanın.
3. Web sitenizin içeriğinde (veya alt kısımdaki bilgi alanında) Bilgisayar Bilimi Eğitimi Haftası ve Code.org web sitelerinin linklerini paylaşın ve onlardan şu şekilde bahsedin:
    
    *"'Hour of Code' ülke çapında Bilgisayar Bilimi Eğitimi Haftası [csedweek.org] ve Code.org [code.org] tarafından düzenlenen, milyonlarca öğrenciyi bir saat süresince bilgisayar bilimi ve kodlama ile tanıştırmayı amaçlayan bir girişimdir."*

4. Uygulama isimleri olarak ''Hour of Code'' kullanmayın.

<a id="stickers"></a>

## Bu çıkartmaları öğrencilerinize vermek için yazdırın

(Çıkartmalar 1"çap, sayfa başına 63 adettir)  
[![Görüntü](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Kodlama Saatini tanıtmak için bu e-postaları gönderin

<a id="email"></a>

### Okulunuzdan, patronunuzdan veya arkadaşlarınızdan bize katılmalarını isteyin:

**Konu satırı:** Kodlama Saati için bana ve 100 milyondan fazla öğrenciye katılın

Bilgisayarlar her yerdeler ve gezegendeki her endüstriyi değiştiriyorlar. Bütün okulların yarısından daha azı bilgisayar bilimleri eğitimi veriyor. İyi haber, bunu değiştirmeye çalışıyoruz! Eğer daha önce Kodlama Saatini duyduysanız, tarih yazdığını da biliyor olabilirsiniz. 100.000.000 'den fazla öğrenci kod saatini denedi.

Kod saat sayesinde, bilgisayar bilimi Google, Msn, Yahoo! ' nın ana sayfalarında yer almaktadır! 100'den fazla ortak, bu hareketi desteklemek için bir araya geldi. Dünyada her Apple Store Kodlama Saatine ev sahipliği yaptı, hatta Başkan Obama ve Kanada başbakanı Justin Trudeau kampanya kapsamında ilk kod satırlarını yazdı.

Bu yıl daha büyük yapalım. I’m asking you to join the Hour of Code <%= campaign_date('year') %>. Bilgisayar Bilimleri Eğitim Haftası süresince <%= campaign_date('full')%>,, "Kodlama Saati" etkinliklerinden birine katılın.

Organizasyondan bahsedin. Bir etkinlik düzenleyin. Yerel okullara kaydolmalarını isteyin. Veya Kodlama Saatini kendiniz deneyin - herkes temelleri öğrenerek kendine fayda sağlayabilir.

Http://hourofcode.com/ adresinden başlamak<%= @country %>

<a id="help-schools"></a>

### Bir okulda gönüllü:

**Subject line:** Kodlama saatinde ve ev sahipliğinde yardım edebilir miyiz?

Between <%= campaign_date('short') %>, ten percent of students around the world will celebrate Computer Science Education Week by doing an Hour of Code event at their school. It’s an opportunity for every child to learn how the technology around us works.

[Our organization/My name], [school name] 'da gerçekleştirilecek etkinliğe destek olmaktan memnuniyet duyarız. Öğretmenlerin sınıflarında Kodlama Saati etkinliği gerçekleştirmesine yardım edebiliriz (üstelik bilgisayarlara ihtiyacımız olmadan!) yada okulunuzda oturum gerçekleştirmek isterseniz, size teknolojinin nasıl işlediğini ve yazılım mühendisi olmanın nasıl bir şey olduğunu anlatacak konuşmacılar ayarlayabiliriz.

Öğrenciler kendi uygulamalarını ve oyunlarını geliştirip ailelerine gösterebilir ve Kodlama Saati katılımcı belgelerini evlerine götürebilirler. Ve, Eğlenceli! Etkileşimli, elleriyle ürettikleri aktivitelerle öğrenciler, ulaşılabilir yollar ile sayısal düşünme yetilerini öğrenecek.

Bilgisayarlar her yerdeler ve gezegendeki her endüstriyi değiştiriyorlar. Bütün okulların yarısından daha azı bilgisayar bilimleri eğitimi veriyor. İyi haber, biz bunu değiştirmek için çalışıyoruz! Eğer daha önce Kodlama Saatini duyduysanız, Kodlama saatini dünya çapında 100 milyondan fazla öğrencinin deneyimlediğini ve tarihe geçtiğini bilebilirsiniz.

Kod saat sayesinde, bilgisayar bilimi Google, Msn, Yahoo! ' nın ana sayfalarında yer almaktadır! 100'den fazla ortak, bu hareketi desteklemek için bir araya geldi. Dünyada her Apple Store Kodlama Saatine ev sahipliği yaptı, hatta Başkan Obama ve Kanada başbakanı Justin Trudeau kampanya kapsamında ilk kod satırlarını yazdı.

Etkinliğe dair daha fazla bilgiyi http://hourofcode.com/ adresinden bulabilirsiniz. Yada [school name] okulunuzun nasıl dahil olabileceğini öğrenmek için bizimle iletişime geçebilirsiniz.

Teşekkürler!

[isminiz], [Kurumunuz]

<a id="media-pitch"></a>

### Medya etkinliğne katılmaya davet edin:

**Subject line:** Yerel okul Bilgisayar bilimlerini öğrencilerine tanıtmayı görev edindi

Bilgisayarlar heryerde, dünyada her endüstriyi değiştiriyor, ama okulların yarısından azı bilgisayar bilimlerini öğretiyor. Bilgisayar Bilimi Sınıflarında ve teknoloji endüstrisinde kadınlar ve azınlıklar ciddi bir oranla yetersiz temsil ediliyorlar. İyi haber bizler artık bu durumu değiştirmek için yola çıktık.

Kod saat sayesinde, bilgisayar bilimi Google, Msn, Yahoo! ' nın ana sayfalarında yer almaktadır! 100'den fazla ortak, bu hareketi desteklemek için bir araya geldi. Dünyadaki tüm Apple mağazaları Kodlama Saatine ev sahipliği yaptı. Hatta Başkan Obama kampanya kapsamında ilk kod satırını yazdı.

Gelmiş geçmiş en geniş çaplı öğrenme etkinliği olan Computer Science Education Week, (<%= campaign_date('full') %>) - "Kodlama Saati"ne, [SCHOOL NAME] öğrencilerinden [X number] kişinin katılmasının nedeni işte bu.

Size başlangıç komitemize katılmanız için yazıyorum, böylece çocukların [DATE]'ta etkinliğe başlayışını da görebileceksiniz.

Kar amacı gütmeyen Code.org ve 100 diğer ortak tarafından organize edilen Kodlama Saati, bugünün öğrenci neslinin 21. yüzyılın başarıya ulaştıracak becerilerini öğrenmeye hazır olduğunu belirten bir ifadedir. Lütfen bize katılın.

**İletişim:** [Adınız], [TITLE], cep: (212) 555-5555 **zaman:** [Tarih ve saat, olay] **nerede:** [adres ve yön]

Geri dönüşünüzü sabırsızlıkla bekliyorum

[İSMİNİZ]

<a id="parents"></a>

### Ebeveynlerinize okulunuzdaki etkinlikten bahsedin:

**Subject line:** Öğrencilerimiz Kodlama Saatiyle geleceğe yön veriyor

Sevgili ebeveynler,

Teknoloji ile çevrilmiş bir Dünyanın içinde yaşıyoruz. Ve biliyoruz ki öğrencilerimiz yetişkin hayatları için hangi alanı seçerlerse seçsinler, başarıya ulaşma yetenekleri teknolojinin nasıl çalıştığını anlamalarına bağlı.

Fakat biz sadece küçük bir kısmını **nasıl** teknoloji işleri öğrenme. Tüm okulların yarısından daha az sayıda bilgisayar tekniğini öğretmek.

Bu nedenle tüm okulumuz tarihteki en büyük öğrenme etkinliğine katılıyor: Kodlama Saati, Bilgisayar Bilimi Eğitimi Haftası boyunca (8-14 Dünya çapında 100.000.000 öğrencileri zaten kod saatini denedi.

Bizim Kodlama Saatimiz [OKUL ADI]'nın temel 21. yüzyıl becerilerini öğretmeye hazır olduğunu belirten bir ifadedir. Öğrencilere programlama aktivitelerini getirmeye devam etmek için, biz Kodlama Saati etkinliğimizi büyük yapmak istiyoruz. Gönüllü olmaya, yerel medyaya ulaşmaya, sosyal medyada haberleri paylaşmaya ve hatta çevreniz için kendi Kodlama Saati etkinliğinizi düzenlemeye davet ediyorum.

Bu, eğitimin geleceğini değiştirmek için bir şanstır. [ŞEHİR/ŞEHİR ADI].

Detaylar için http://hourofcode.com 'u ziyaret edin, ve organizasyonu yaymamıza yardım edin.

Saygılarımla,

Müdürünüz

<a id="politicians"></a>

### Okulunuzun düzenlemiş olduğu bir etkinliğine, yerel bir politikacı davet edin:

**Konu:** Öğrencilerimiz Kodlama Saatiyle geleceğe yön veriyor

Değerli [Belediye Başkanı/Vali/Temsilci/Senatör SOYADI]:

Bilişim bilgilerin Abd'de #1 ücretli kaynak olduğunu biliyor muydunuz.? 500.000'den fazla bilgisayar ülke çapında açık, ama geçen yıl işgücü sadece 42,969 bilgisayar bilimi öğrencileri mezun oldu.

Bilgisayar bilimi bugün *her* sanayi için temel, henüz birçok okul bunu öğretmiyorlar. [Okul adı] biz bunu değiştirmeye çalışıyoruz.

Bu nedenle tüm okulumuz tarihteki en büyük öğrenme etkinliğine katılıyor: Kodlama Saati, Bilgisayar Bilimi Eğitimi Haftası boyunca (8-14 Dünya çapında 100.000.000 öğrencileri zaten kod saatini denedi.

Size yazma amacım, sizi Kodlama Saati etkinliğimize davet etmek ve başlangıç komitemizde bir konuşma yapmanızdır. Etkinlik [TARİH, SAAT, YER]'de gerçekleştirilecek, ve [Semt veya Şehir adı]'nın öğrencilerine 21. yüzyılın kritik becerilerini öğretmeye hazır olduğunu sağlam bir şekilde ifade edecektir. Öğrencilerimizin teknolojiyi yaratma konusunda ön saflarda yer aldıklarından emin olmak istiyoruz -- sadece teknolojiyi tüketmelerini değil.

Lütfen [TELEFON NUMARASI VEYA E-POSTA ADRESİ]'den bana ulaşın. Cevabınızı dört gözle bekliyorum.

Saygılarımla,

[isminiz], [başlık]

<%= view :signup_button %>
