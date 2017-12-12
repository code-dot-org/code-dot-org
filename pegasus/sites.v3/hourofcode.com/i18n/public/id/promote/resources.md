---
title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Promosikan Jam Kode

## Hosting Satu Jam Kode? [ Lihat petunjuk panduannya ](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Tempelkan poster-poster ini di sekolah anda

<%= view :promote_posters %>

<a id="social"></a>

## Posting ini di media sosial

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Gunakan logo Hour of Code untuk menyebarkan berita

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Setiap mereferensikan "Hour of Code" harus tidak mengatakan bahwa nama merek tersebut adalah milik anda, tetapi referensikan Hour of Code sebagai akar/inti dari gerakan/kampanye ini. **Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".**
2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
3. Sertakan bahasa pada halaman (atau pada footer), termasuk dalam alamat menuju CSEdWeek dan situs web Code.org, yang memilki tulisan:
    
    *"'Hour of Code™' adalah gerakan global dari Pekan Edukasi Ilmu Komputer [csedweek.org] dan Code.org [code.org] untuk mengenalkan jutaan siswa dengan sesi satu jam dari ilmu komputer dan pemrograman komputer."*

4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Cetak stiker ini untuk diberikan kepada siswa Anda

(Stickers are 1" diameter, 63 per sheet)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Kirimkan email ini untuk membantu mempromosikan kegiatan Hour of Code

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

** Subject line: </ 0> Bergabunglah dengan saya dan lebih dari 100 juta siswa untuk Hour of Code</p> 

Komputer ada dimana-mana, mengubah setiap industri di planet ini. Tapi kurang dari separuh sekolah mengajarkan ilmu komputer. Kabar baiknya adalah, kita sedang dalam perjalanan untuk mengubah ini! If you've heard about the Hour of Code before, you might know it made history. Lebih dari 100 juta siswa telah mencoba Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Lebih dari 100 mitra telah bergabung bersama untuk mendukung gerakan ini. Setiap Apple Store di dunia telah menyelenggarakan Hour of Code, dan para pemimpin seperti Presiden Obama dan Perdana Menteri Kanada Justin Trudeau menulis baris kode pertama mereka sebagai bagian dari kampanye.

Tahun ini, mari kita buat lebih besar lagi. I’m asking you to join the Hour of Code 2017. Silakan terlibat dalam acara Hour of Code selama Pekan Pendidikan Ilmu Komputer, <%= campaign_date('full')%>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Mulai di http://hourofcode.com/<%= @country %>

<a id="help-schools"></a>

### Relawan di sekolah:

** Baris subjek: </ strong> Bisakah kami membantu Anda meng-host dan Hour of Code?</p> 

Antara Desember. 4-10, sepuluh persen siswa di seluruh dunia akan merayakan Pekan Pendidikan Ilmu Komputer dengan melakukan acara Hour of Code di sekolah mereka. Ini adalah kesempatan bagi setiap anak untuk belajar bagaimana teknologi di sekitar kita bekerja.

[Organisasi kami / nama saya] ingin membantu [nama sekolah] menjalankan acara Hour of Code. Kami dapat membantu para guru menyelenggarakan Hour of Code di kelas mereka (kami bahkan tidak memerlukan komputer!) Atau jika Anda ingin menjadi tuan rumah sebuah majelis sekolah, kami dapat mengatur agar pembicara berbicara tentang bagaimana teknologi bekerja dan bagaimana rasanya jadilah insinyur perangkat lunak.

Para siswa akan membuat aplikasi atau permainan mereka sendiri yang bisa mereka tunjukkan pada orang tua mereka, dan kami juga akan mencetak sertifikat Kode Hari yang bisa mereka bawa pulang. Dan, ini menyenangkan! Dengan kegiatan interaktif dan langsung, siswa akan belajar keterampilan berpikir komputasi dengan cara yang mudah didekati.

Komputer ada dimana-mana, mengubah setiap industri di planet ini. Tapi kurang dari separuh sekolah mengajarkan ilmu komputer. Kabar baiknya adalah, kita sedang dalam perjalanan untuk mengubah ini! Jika Anda pernah mendengar tentang Hour of Code sebelumnya, Anda mungkin tahu itu membuat sejarah - lebih dari 100 juta siswa di seluruh dunia telah mencoba Hour of Code.

Berkat Hour of Code, ilmu komputer telah berada di homepage Google, MSN, Yahoo!, dan Disney. Lebih dari 100 mitra telah bergabung bersama untuk mendukung gerakan ini. Every Apple Store in the world has hosted an Hour of Code, and even leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

Anda dapat membaca lebih lanjut tentang acara di http://hourofcode.com/. Atau, beri tahu kami jika Anda ingin menjadwalkan beberapa waktu untuk membicarakan bagaimana [nama sekolah] dapat berpartisipasi.

Terima kasih!

[Nama anda], [organisasi anda]

<a id="media-pitch"></a>

### Undang media untuk menghadiri acara Anda:

**Subject line:** Local school joins mission to introduce students to computer science

Computers are everywhere, changing every industry on the planet, but fewer than half of all schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Kabar baiknya, kita berada pada jalur yang tepat untuk merubah itu.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Lebih dari 100 mitra telah bergabung bersama untuk mendukung gerakan ini. Every Apple Store in the world has hosted an Hour of Code. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Please join us.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch.

[Your Name]

<a id="parents"></a>

### Tell parents about your school's event:

**Subject line:** Our students are changing the future with an Hour of Code

Orang tua yang di hormati

We live in a world surrounded by technology. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Fewer than half of all schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

### Invite a local politician to your school's event:

**Subject line:** Join our school as we change the future with an Hour of Code

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely,

[Your Name], [Title]

<%= view :signup_button %>