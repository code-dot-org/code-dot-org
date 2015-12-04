---

title: <%= hoc_s(:title_tutorial_guidelines) %>
layout: wide

---

<%= view :signup_button %>

# Tutorial guidelines for the Hour of Code™ and Computer Science Education Week

Code.org will host a variety of Hour of Code™ activities on the Code.org, Hour of Code, and CSEdWeek website(s). The current list is at [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>).

Çeşitli birleştirici etkinliğe ev sahipliği yapmak istiyoruz, ancak birincil amacımız bilgisayar bilimine yeni olan öğrenci ve öğretmenlerin deneyimlerini iyileştirmektir. Lütfen bu belge yardımıyla aktivitenizin oluşumunu yönlendirin; hiçbir kodlama, bilgisayar programlama ve bilgisayar bilimi geçmişi olmayan bir kitleye hitap ettiğinizi unutmayın.

  


**After reading the guidelines, you can submit your tutorial through our [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l).**

**NEW:** Unlike past years, we plan to introduce a new format for "teacher-led" Hour of Code activities. These will be listed below the self-guided activities in student-facing pages and emails. Details below.

<a id="top"></a>

## İçindekiler:

  * [General guidelines for creating an Hour of Code™ activity](#guidelines)
  * [Öğreticilerin eğitime dahil edilmesi için değerlendirilme yolu](#inclusion)
  * [How to submit (Due 10/15/2015)](#submit)
  * [Aktivitenizi tasarlamak için öneriler](#design)
  * [Marka patenti ile ilgili bilgiler](#tm)
  * [Takip Pikseli](#pixel)
  * [Öğreticilerinizi desteklemek, Bilgisayar Bilimi Eğitimi Haftası ve Kodlama Saati](#promote)
  * [Engelli öğrenciler için küçük bir not](#disabilities)

<a id="guidelines"></a>

## New for 2015: two formats of activities: self-guided or *lesson-plan*

Now that tens of thousands of educators have tried the Hour of Code, many classrooms are ready for more creative, less one-size-fits-all activities that teach the basics of computer science. To help teachers find inspiration, we'd like to collect and curate one-hour "Teacher-Led" lesson and activity plans for Hour of Code veterans. We will continue promoting the "Self-guided" format as well.

**Submit a Teacher-Led Lesson Plan, ideally for different subject areas *(NEW)***: Do you have an engaging or unique idea for an Hour of Code lesson? Some educators may prefer to host Hour of Code activities that follow a traditional lesson format rather than a guided-puzzle/game experience. If facilitated properly, more open-ended activities can better showcase the creative nature of computer science. We would love to collect **one-hour lesson plans designed for different subject areas**. For example, a one-hour lesson plan for teaching code in a geometry class. Or a mad-lib exercise for English class. Or a creative quiz-creation activity for history class. This can help recruit teachers in other subject areas to guide an Hour of Code activity that is unique to their field, while demonstrating how CS can influence and enhance many different subject areas.

You can start with this [empty template](https://docs.google.com/document/d/1zyD4H6qs7K67lUN2lVX0ewd8CgMyknD2N893EKsLWTg/pub) for your lesson plan.

Examples:

  * [Mirror Images (an activity for an art teacher)](https://csedweek.org/csteacher/mirrorimages.pdf)
  * [An arduino activity for a physics teacher](https://csedweek.org/csteacher/arduino.pdf)
  * [A history of technology activity for a history teacher](https://csedweek.org/csteacher/besttechnology.pdf)

[<button>How can I submit my own lesson plan?</button>](#submit)

  
  
**Student-led (Self-Guided) Format**: The original Hour of Code was built mostly on the success of self-guided tutorials or lessons, optionally facilitated by the teacher. There are plenty of existing options, but if you want to create a new one, these activities should be designed so they can be fun for a student working alone, or in a classroom whose teacher has minimal prep or CS background. They should provide directions for students as opposed to an open-ended hour-long challenge. En iyisi, anlatımların ve öğreticilerin programlama platformuyla birleştirilmesidir. Böylelikle ayrı sayfa veya pencerelerde açık olan öğretici ve programlama platformu arasında sürekli gidip gelme sorunu ortadan kalkmış olur.

Note: On student-facing pages we'll list teacher-led activities *below* the self-guided ones, but we'll specifically call them out on pages or emails meant for educators.

## Bir Kodlama Saati aktivitesi yaratmak için genel bilgiler

The goal of an Hour of Code is to give beginners an accessible first taste of computer science or programming (not HTML). The tone should be that:

  * Computer science is not just for geniuses, regardless of age, gender, race. Anybody *can* learn!
  * Computer science is connected to a wide variety of fields and interests. Everybody *should* learn!
  * Öğrencileri internet üzerinden arkadaşlarıyla paylaşabilecekleri bir şey yaratmaları için teşvik edin.

**Technical requirements**: Because of the wide variety of school and classroom technology setups, the best activities are Web-based or smartphone-friendly, or otherwise unplugged-style activities that teach computer science concepts without the use of a computer (see <http://csunplugged.com/>). Activities that require an app-install, desktop app, or game-console experiences are ok but not ideal.

[**Başa dön**](#top)

<a id="inclusion"></a>

## Öğreticilerin eğitime dahil edilmesi için değerlendirilme yolu

Bir bilgisayar bilimi eğitimcisi komitesi, daha geniş bir eğitimci kitlesi tarafından yapılan anketleri de dahil ederek, nitel ve nicel ölçümlerle başvuruları sıralayacak.

**Öğreticilerin listede yukarılarda yer almasını sağlayacak durumlar:**

  * yüksek kaliteli
  * designed for beginners - among students AND teachers
  * yaklaşık 1 saat sürecek şekilde yapılmış
  * require no sign up
  * require no payment
  * require no installation
  * birçok işletim sisteminde çalışacak şekilde yaratılmış (mobil ve tablet ortamları da dahil)
  * birçok dilde çalışan
  * promote learning by all demographic groups (esp. under-represented groups)
  * sadece HTML+CSS web tasarımı odağında olmayan - (hedefimiz bilgisayar bilimi, sadece HTML kodlaması değil)

**Öğreticilerin listede aşağılarda yer almasına sebep olacak durumlar:**

  * düşük kaliteli
  * daha ileri düzeyde eğitime uygun (başlangıç düzeyine uygun olmayan)
  * kısıtlı işletim sistemi platformlarında çalışabilen - İnternet platformlarında IE9+ ve en son sürüm Chrome, Firefox ve Safari'yi desteklemesi gerekir
  * sadece İngilizce çalışan
  * reinforce stereotypes that hinder participation by under-represented student groups
  * paralı bir eğitim sistemine yönlendirme amacıyla çalışan

**Öğreticiler listede aşağıdaki durumlarda yer ALMAZLAR:**

  * bir saatten fazla uzun veya fazla kısa olan
  * kaydolmayı gerektiren 
  * ödeme gerektiren
  * require installation (other than mobile apps)
  * sadece HTML + CSS web tasarımına odaklanmış
  * son gönderim tarihinden sonra veya eksik bilgiyle gönderilmiş (detaylar aşağıda)

**If your tutorial is student-led** Student-led tutorials need to be designed to be self-directed, not to require significant CS instruction or prep from teachers

Neticede, Kodlama Saati kampanyasının amacı öğretmen ve öğrencilerin bilgisayar bilimine katılım oranını arttırmak, bu bilime herkesin ulaşabileceğini ve bunun “düşündüğünüzden daha kolay olduğunu“ göstermektir. Birçok şekilde hedef, öğrenci ve öğretmenlere daha az ve basit seçenekler vererek, ilk kez kullanan biri için en yüksek kaliteyi sunmak olmalıdır. Note also that the 2013 and 2014 Hour of Code campaigns were a fantastic success with over 120M served, with nearly unanimous positive survey responses from participating teachers and students. As a result, the existing listings are certainly good and the driving reason to add tutorials to the Hour of Code listings isn't to broaden the choices, but to continue to raise the quality (or freshness) for students, or to expand the options for non-English speakers given the global nature of the 2015 campaign.

[**Başa dön**](#top)

<a id="submit"></a>

## How to submit (Due 10/15/2015)

Visit the [Hour of Code™ Activity Submission page](https://goo.gl/kNrV3l) and follow the steps to submit your tutorial.

**İhtiyacınız olanlar:**

  * İsminiz, logonuz (jpg, png, vs.)
  * Kodlama Saati aktiviteniz için pazarlama görselinizin URL'si. Görseller tam olarak 446 x 335 çözünürlükte olmalıdır. Eğer uygun bir fotoğraf sağlanamazsa, biz sizin için öğreticinizin ekran görüntüsünü çekebiliriz VEYA öğreticinizi listeye koymayabiliriz.
  * Logonun URL linki
  * Aktivitenin adı
  * Aktivitenin URL linki
  * Öğretmen notlarının URL linki (isteğe bağlı, detaylar aşağıda)
  * Aktivitenin açıklaması (hem masaüstü hem mobil görüntülemeye uyumlu) 
      * **Masaüstü görünümü için maksimum karakter sayısı:** 384
      * **Mobil görünümü için maksimum karakter sayısı:** 74
      * Lütfen açıklamanızda etkinliğin genel anlamda öğrenci tarafından mı yoksa öğretmen tarafından mı yönlendirildiğine yer verin. Ek olarak, bazı okullar Kodlama Saati aktivitelerinin Common Core veya Next Generation Science Standards uyumlu olup olmadığını bilmek isteyebilirler. Eğer aktivite bu standartlardaysa, bunu da açıklamanıza eklemeyi unutmayın.
  * Test edilmiş/uyumlu platformların listesi: 
      * Web based: Which platforms have you tested 
          * İşletim sistemleri - Mac, Win ve versiyonları
          * Tarayıcılar - IE8, IE9, IE10, Firefox, Chrome, Safari
          * iOS mobil Safari (mobile uyarlanmış)
          * Android Chrome (mobile uyarlanmış)
      * Non web-based: specify platform for native code (Mac, Win, iOS, Android, xBox, other)
      * İnternetsiz
  * Desteklenen diller listesi ve uygun format: 
      * Öğreticiler 2 karakterli dil kodu kullanarak hangi dilleri desteklediğini belirtmelidir. Örneğin, EN - İngilizce; TR - Türkçe
      * Eğer dille ilgili daha fazla bilgi vermek gerekliyse, kısa çizgi kullanılabilir. Örneğin, FR-BE - Fransızca (Belçika) veya FR-CA - Fransızca (Kanada)
      * ***Not: Dil saptaması öğreticiyi yapan kişinin görevidir, biz sadece elimize ulaşan URL'yi kullanıcılara yönlendireceğiz.*** 
  * Eğer çevrimiçi bir öğretici gönderirseniz, bunun [COPPA uyumlu](http://en.wikipedia.org/wiki/Children's_Online_Privacy_Protection_Act) olup olmadığını bilmemiz gerekir.
  * Belirli sınıflar için önerilen seviyeler. Bunun için [Bilgisayar Bilimi Öğretmenleri Derneği K-12 Standartları](http://csta.acm.org/Curriculum/sub/K12Standards.html) 'nı referans göstererek sınıflara uygun seviyeleri saptayabilirsiniz. Örnek sınıf seviyeleri aşağıdaki gibidir: 
      * İlkokul: K-2 veya 3-5 seviyeleri
      * Ortaokul: 6-8 seviyeleri
      * Lise: 9-12 seviyeleri
      * Her yaş için
  * Lütfen önerilen bilgisayar bilimi bilgi düzeyini seçilen seviyede belirtin: Başlangıç, Orta veya İleri. Kodlama Saati websitesi Başlangıç seviyesi aktivitelerini göze çarpacak şekilde renklendirecektir. If you’d like to prepare Intermediate and Advanced Hour of Code™ Activities, please include the prior knowledge needed in the description of your activity.
  * Teknik gereklilikler: 
      * Daha net bir şekilde katılımı takip edebilmek için, her üçüncü parti öğretici ortağının Kodlama Saati öğreticilerinin başına ve sonuna 1-piksel takip görüntüsü yerleştirmelerini istiyoruz. Başlangıç sayfasına bir başlangıç piksel-görüntüsü ve son sayfaya da son bir piksel-görüntüsü yerleştirin. Ara sayfalara piksel yerleştirmeyin. Daha fazla detay için Takip Pikseli bölümüne göz atın. 
      * Aktiviteyi bitirirken, kullanıcılar [<%= resolve_url('code.org/api/hour/finish') %>](<%= resolve_url('https://code.org/api/hour/finish') %>) sayfasına yönlendirilmelidirler. Bu sayfada aşağıda sıralananları yapabilirler: 
          * Kodlama Saatini bitirdiklerini sosyal medyada paylaşabilirler
          * Kodlama Saatini bitirdiklerine dair bir sertifika alabilirler
          * Hangi ülkelerin/şehirlerin Kodlama Saatinde en yüksek katılım oranlarına sahip olduğunu görebilirler
          * For users who spend an hour on your activity and don’t complete it, please include a button on your activity that says “I’m finished with my Hour of Code” which links back to [<%= resolve_url('code.org/api/hour/finish') %>](<%= resolve_url('https://code.org/api/hour/finish') %>) as well. 
  * *(Tercihe bağlı)* We will follow-up with an online survey/form link asking for a report of the following activity metrics for the week of Dec. 7, 12:01 am through Dec. 13, 11:59 pm) 
      * Çevrimiçi aktiviteler için (özellikle akıllı telefon/tablet uygulamaları): 
          * Kullanıcı sayısı
          * Görevi tamamlayanların sayısı
          * Ortalama görev tamamlama süresi
          * Tüm kullanıcıların yazdığı kodların satır sayısı toplamı
          * Daha fazla öğrenim için devam edenlerin sayısı (görevi bitirdikten sonra sitenizde diğer görevlere de gidenlerin sayısıyla ölçülür)
      * Çevrimdışı aktiviteler için 
          * Aktivitenin kağıt versiyonunun indirilme sayısı (uygulanabiliyorsa)

[**Başa dön**](#top)

<a id="design"></a>

## Aktivitenizi tasarlamak için öneriler

You can include either the CSEdWeek logo ([small](https://www.dropbox.com/s/ojlltuegr7ruvx1/csedweek-logo-final-small.jpg) or [big](https://www.dropbox.com/s/yolheibpxapzpp1/csedweek-logo-final-big.png)) or the [Hour of Code logo](https://www.dropbox.com/work/Marketing/HOC2014/Logos%202014/HOC%20Logos) in your tutorial, but this is not required. If you use the Hour of Code logo, see the trademark guidelines below. Hiçbir şart altında Code.org logosu ve ismi kullanılamaz. Both are trademarked, and can’t be co-mingled with a 3rd party brand name without express written permission.

**Ortalama bir öğrencinin rahatlıkla bir saat içerisinde aktiviteyi bitirebileceğinden emin olun.** Dersin sonuna aktiviteyi çabuk bitiren öğrenciler için ucu açık bir başka aktivite daha koymayı düşünün. Çoğu çocuğun bilgisayar bilimi ve kodlamaya tamamen yeni başlıyor olduğunu unutmayın.

**Öğretmen notlarını ekleyin.** Çoğu aktiviteler öğrenciler tarafından yönlendirilmelidir, ancak eğer aktivite bir öğretmen tarafından yönletiliyorsa, lütfen ayrı bir URL'ye, açık ve basit yönlendirmeler kullanarak aktivitenizin bir öğretmen notunu yükleyin. Acemi olan sadece öğrenciler değil, bazı öğretmenler de bu konuda acemi olabilir. Şu bilgileri ekleyin:

  * Öğreticimiz en iyi aşağıdaki platform ve tarayıcılarda çalışır
  * Does it work on smartphones? Tablets?
  * Takım çalışmasını öneriyor musunuz? 
  * Considerations for use in a classroom? E.g. if there are videos, advise teachers to show the videos on a projected screen for the entire classroom to view together

**Aktivitenin sonunda yapıcı geri bildirimler.** (Örneğin: “10 seviye bitirdin ve döngüleri öğrendin! Harikasın!“)

**Encourage students to post to social media (where appropriate) when they've finished.** For example “I’ve done an Hour of Code with ________ Have you? #HourOfCode“ veya “Ben bir Kodlama Saatini - #HourOfCode - Bilgisayar Bilimi Eğitimi Haftasının - #CSEdWeek - bir parçası olarak bitirdim. Ya sen? @Scratch.” **#HourOfCode** etiketini kullanın (büyük H, O, C harfleri ile)

**Create your activity in Spanish or in other languages besides English.** ]

**Aktiviteyi toplum için önemli bir içerikte anlatın veya bağlantı kurun.** Öğrenciler dünyayı bilgisayar programlama ile daha iyiye taşıyabileceklerini gördüklerinde bu beceri bir süper güce dönüşecek!

**Öğrenciler öğreticinizi denemeden kayıt veya ücret istemeyin.** Kayıt veya ücret isteyen öğreticiler listeye eklenmeyecektir

**Make sure your tutorial can be used in a [Pair Programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning) paradigm.** The three rules of pair programming in a school setting are:

  * Sürücü fare ve klavyeyi kontrol eder.
  * Yol gösterici öneri yapar, hataları gösterir ve sorular sorar. 
  * Öğrenciler rollerini bir öğreticide en az iki kez değiştirmelidir.

İkili Takım Olmanın Avantajları:

  * Öğrenciler, öğretmene güvenmek yerine birbirlerine yardımcı olabilirler
  * Kodlamanın yalnız yapılan bir aktivite olmadığını, aslında sosyal iletişim gerektirdiğini görürler
  * Her sınıfta veya laboratuvarda birebir ders için yeterince bilgisayar bulunmayabilir

[**Başa dön**](#top)

<a id="tm"></a>

## Marka patenti ile ilgili bilgiler

After the success of the 2013 campaign, we took steps to make sure we set up the Hour of Code as a movement that can repeat annually with greater fidelity and without confusion.

Bunun bir parçası da marka olarak "Hour of Code"'un (Kodlama Saati) karışıklığa sebebiyet vermemek adına korunmasıdır. Çoğu öğretici ortaklarımız "Hour of Code"'u web sitelerinde kullandılar. Biz bu kullanımı önlemek istemiyoruz, ancak bazı kısıtlamalara uymasını istiyoruz:

  1. "Hour of Code"'a yapılan bir referans marka isminden çok, bu isim altında gelişen köklü harekete hitap etmelidir. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Web sitenizin içeriğinde (veya alt kısımdaki bilgi alanında) Bilgisayar Bilimi Eğitimi Haftası ve Code.org web sitelerinin linklerini paylaşın ve onlardan şu şekilde bahsedin:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

[**Başa dön**](#top)

<a id="pixel"></a>

## Takip Pikseli

Daha net bir şekilde katılımı takip edebilmek için, her üçüncü parti öğretici ortağının Kodlama Saati öğreticilerinin başına ve sonuna 1-piksel takip görüntüsü yerleştirmelerini istiyoruz. (Başlangıç sayfasına bir başlangıç piksel-görüntüsü ve son sayfaya da son bir piksel-görüntüsü yerleştirin. Ara sayfalara piksel yerleştirmeyin).

Böylelikle Kodlama Saatlerini gerçekleştirmek amacıyla direkt olarak websitenizi ziyaret eden kullanıcıların sayısına ulaşabiliriz, ya da bir öğretmen tahtaya sizin URL'nizi yazdığında hangi kullanıcıların ziyaret ettiğini görebiliriz. Bu, daha net bir katılımcı sayısına ulaşmanızı sağlayarak daha çok yeni kullanıcı çekmenizi sağlayacaktır. Sona koyduğunuz pikseller ise aktivitenin tamamlanma oranlarını tespit etmemize yardımcı olacaktır.

Öğreticiniz kabul edildiyse ve son öğretici sayfasına eklendiyse, Code.org size özel bir takip pikselini öğreticinizle birleştirmeniz için verecektir. Aşağıda örneği mevcuttur.

NOT: Bu, yüklenebilir uygulamalar için önemli değildir (iOS/Android uygulamaları, ya da masaüstüne indirilen uygulamalar)

AppInventor için örnek takip pikselleri:

IMG SRC = <http://code.org/api/hour/begin_appinventor.png>   
IMG SRC = <http://code.org/api/hour/finish_appinventor.png>

[**Başa dön**](#top)

<a id="promote"></a>

## Öğreticilerinizi desteklemek, Bilgisayar Bilimi Eğitimi Haftası ve Kodlama Saati

Herkesten kendi 1 saatlik öğreticisini kullanıcılarına tanıtmalarını ve desteklemelerini rica ediyoruz. Please direct them to ***your*** Hour of Code page. Kullanıcılarınız sizden öğreticiniz hakkında e-posta aldıklarında onlardan daha büyük bir geri dönüş alırsınız. Bilgisayar Bilimi Eğitimi Haftası adına düzenlenen Uluslararası Kodlama Saati kampanyasını bahane ederek kullanıcılarınızı diğerlerini de davet etmesi için teşvik edin, 100 milyon toplam katılımcıya ulaşmamıza yardımcı olun.

  * Feature Hour of Code and CSEdWeek on your website. Ex: <http://www.tynker.com/hour-of-code>
  * Kodlama Saatini genel medya, sosyal medya, e-posta listeleri, vs. aracılığıyla **#HourOfCode** (büyük H, O, C harfleriyle) etiketini kullanarak destekleyin
  * Yerel bir etkinliğe ev sahipliği yapın ya da çalışanlarınızdan yerel okullarda ve yerel sosyal gruplarda bir etkinlik düzenlemelerini rica edin.
  * Kaynaklar Kitimizde daha detaylı bilgiler bulabilirsiniz (çok yakında).

[**Başa dön**](#top)

<a id="disabilities"></a>

## Engelli öğrenciler için özel bir not

Eğer görme engelliler için bir öğretici hazırladıysanız, ekran okuyucusu kullanacak katılımcılar için öğreticiyi vurgulamaktan mutluluk duyarız. Şimdiye dek elimize böyle bir öğretici ulaşmadı, ancak görme engelli öğrenciler için bir seçenek bulundurmak adına bir tane eklemek bizi gerçekten çok mutlu eder.

[**Başa dön**](#top)

<%= view :signup_button %>