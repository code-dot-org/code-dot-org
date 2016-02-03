* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Hadiah - syarat dan ketentuan

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. $10 kredit harus ditambahkan ke akun yang ada, dan kredit akan berakhir setelah 1 tahun. Hanya dibatasi 1 bonus untuk setiap organisasi.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Jika sekolahmu berpartisipasi dalam Hour of Code, setiap guru harus mendaftar secara individual untuk memenuhi syarat.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Satu set laptop untuk kelas (atau teknologi lain yang bernilai $10,000):

Hadiah terbatas untuk sekolah publik K-12 U.S. Untuk memenuhi syarat, sekolah anda harus mendaftar untuk Hour of Code sebelum 16 November 2015. Satu sekolah di setiap negara bagian di U.S. akan menerima satu set komputer untuk kelas. Code.org akan memilih dan memberitahukan pemenang melalui email paling lambat tanggal 1 Desember 2015.

Untuk memperjelas, ini bukanlah undian atau kontes melibatkan kesempatan murni.

1) Tidak resiko atau taruhan yang terlibat dalam pendaftaran - setiap sekolah atau kelas dapat berpartisipasi, tanpa pembayaran kepada Code.org atau organisasi lain

2) Pemenang hanya akan ditunjuk diantara kelas (atau sekolah) yang ikut serta dalam Hour of Code, yang melibatkan tes keterampilan kolektif pelajar dan guru.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Percakapan video dengan seorang pembicara tamu:

Hadiah terbatas hanya pada kelas K-12 di U.S dan Kanada. Code.org akan secara acak memilih pemenang dari setiap sekolah, menyediakan waktu untuk web chat dan bekerja dengan guru yang bersangkutan untuk mengatur teknologi yang diperlukan. Seluruh isi sekolah Anda tidak perlu mengajukan permohonan untuk memenuhi syarat untuk hadiah ini. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>