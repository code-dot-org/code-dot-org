* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Hadiah Hour of Code 2015

<% if @country == 'la' %>

# Hadiah untuk tiap penyelanggara

Every educator who hosts an Hour of Code for students receives 10 GB of Dropbox space as a thank-you gift!

<% else %>

## Hadiah untuk setiap penyelenggara

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

*While supplies last

<% if @country == 'us' %>

## 51 Sekolah yang beruntung akan memenangkan satu set laptop untuk kelas (atau teknologi lain yang bernilai $10,000)

Sign up for this prize is now closed. Check back to see this year's winners.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' || @country == 'ca' %>

<a id="video-chats"></a>

## 30 classrooms will win a video chat with a guest speaker

Lucky classrooms will have the opportunity to talk with guest speakers who will share how computer science has impacted their lives and careers.

[col-33]

![gambar](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![gambar](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![gambar](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![gambar](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![gambar](/images/fit-175/Hadi-Partovi.jpg)  
Hadi Partovi   
(Code.org co-founder)   
[Watch live Dec. 11 10 am PST](https://plus.google.com/events/c2e67fd7el3es36sits1fd67prc)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' %>

## One lucky classroom will win an exclusive, behind-the-scenes “Making of Star Wars” experience in San Francisco with Disney and Lucasfilm

One lucky classroom will win the grand prize – a trip to San Francisco, CA for an exclusive, behind-the-scenes “Making of Star Wars” experience with the visual effects team who worked on Star Wars: The Force Awakens. The grand prize is courtesy of [ILMxLAB](http://www.ilmxlab.com/), a new laboratory for immersive entertainment, combining the talents of Lucasfilm, Industrial Light & Magic and Skywalker Sound.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize1.jpg" />

<img style="float: left; padding-right: 25px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize2.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' %>

## 100 classrooms will win programmable robots including a BB-8 droid robot by Sphero

In honor of Hour of Code tutorial "Star Wars: Building a Galaxy with Code," 100 participating classrooms in the United States or Canada will a set of four Sphero 2.0 robots plus a BB-8™ App-enabled Droid that students can program. Sign up your Hour of Code event to qualify. [Learn more about BB-8 from Sphero](http://sphero.com/starwars) and [about Sphero education](http://sphero.com/education).

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-220x160/bb8.png" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-200x160/bb8-girl.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-300x160/sphero-robot.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'ro' %>

Organizatorii evenimentelor Hour of Code în România vor beneficia de un premiu din partea Bitdefender România, constand intr-o solutie de securitate online.

<% end %>

# FAQ

## Who is eligible to receive the all organizer thank-you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank-you gift?

You must sign up **before** <%= campaign_date('start_long') %> in order to be eligible to receive the all organizer thank-you gift.

## When will I receive my thank-you gift?

We will contact you in December after Computer Science Education Week (<%= campaign_date('full') %>) with next steps on how to redeem your choice of thank-you gift.

## Can I redeem all of the thank-you gift options?

Tentu saja tidak. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## Apakah sekolah anda sudah mendaftar untuk memenangkan perangkat keras senilai $10.000?

Ya. Seluruh sekolah Anda harus berpartisipasi untuk memenuhi persyaratan untuk hadiah tapi hanya satu orang yang perlu mendaftar dan mengirimkan formulir pendaftaran hadiah Hardware [disini](%= resolve_url('/prizes/hardware-signup') %). Setiap guru yang berpartisipasi akan perlu untuk [sign up kelas secara individual untuk menerima semua hadiah terima kasih.](%= resolve_url('/') %).

## Siapa yang memenuhi syarat untuk memenangkan Hardware senilai $10.000?

Hadiah terbatas untuk sekolah publik K-12 U.S. Untuk memenuhi syarat, sekolah anda harus mendaftar untuk Hour of Code sebelum 16 November 2015. Satu sekolah di setiap negara bagian di U.S. akan menerima satu set komputer untuk kelas. Code.org akan memilih dan memberitahukan pemenang melalui email paling lambat tanggal 1 Desember 2015.

## Mengapa hadiah perangkat keras senilai $10.000 hanya tersedia untuk sekolah umum?

Kami sangat menginginkan untuk membantu guru yang berada di sekolah publik dan private sama rata, tetapi pada saat ini, logistik sedang tidak mencukupi. Kami telah bermitra dengan [DonorsChoose.org](http://donorschoose.org) untuk mengelola dana hadiah kelas, yang hanya bekerja dengan sekolah umum, K-12 AS. Menurut DonorsChoose.org, organisasi ini lebih baik dalam mengakses data konsisten dan akurat yang tersedia untuk sekolah umum.

## Kapan batas waktu untuk mengajukan permohonan untuk hadiah perangkat keras?

Untuk memenuhi syarat, Anda harus mengisi [formulir aplikasi Hardware](%= resolve_url('/prizes/hardware-signup') %) 2015 sebelum 16 November. Satu sekolah di setiap negara bagian di U.S. akan menerima satu set komputer untuk kelas. Code.org akan memilih dan memberitahukan pemenang melalui email paling lambat tanggal 1 Desember 2015.

## If my whole school can’t do the Hour of Code during Computer Science Education Week (<%= campaign_date('short') %>), can I still qualify for prizes?

Ya, di dalam [formulir aplikasi Hardware](%= resolve_url('/prizes/hardware-signup') %) terdapat tanggal dimana seluruh sekolah Anda akan berpartisipasi.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Percakapan video dengan seorang pembicara tamu:

Hadiah terbatas hanya pada kelas K-12 di U.S dan Kanada. Code.org akan secara acak memilih pemenang dari setiap sekolah, menyediakan waktu untuk web chat dan bekerja dengan guru yang bersangkutan untuk mengatur teknologi yang diperlukan. Seluruh isi sekolah Anda tidak perlu mengajukan permohonan untuk memenuhi syarat untuk hadiah ini. Both public and private schools are eligible to win.

<% end %>

## Saya berada di luar Amerika Serikat. Bisakah saya mendapat hadiah?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>