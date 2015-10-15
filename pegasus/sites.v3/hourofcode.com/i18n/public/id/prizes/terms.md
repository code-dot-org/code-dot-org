---

title: <%= hoc_s(:title_prizes_terms) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

# Hadiah - syarat dan ketentuan

## Amazon.com or Microsoft’s Windows Store credit:

The Amazon.com and Microsoft’s Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Hanya dibatasi 1 bonus untuk setiap organisasi.

Every organizer must register for the Hour of Code in order to receive the Amazon.com or Microsoft’s Windows Store credit. Jika sekolahmu berpartisipasi dalam Hour of Code, setiap guru harus mendaftar secara individual untuk memenuhi syarat.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com and Microsoft’s Windows Store credit.

<% if @country == 'us' %>

## Satu set laptop untuk kelas (atau teknologi lain yang bernilai $10,000):

Hadiah terbatas untuk sekolah publik K-12 U.S. To qualify, your entire school must register for the Hour of Code by November 16, 2015. Satu sekolah di setiap negara bagian di U.S. akan menerima satu set komputer untuk kelas. Code.org will select and notify winners via email by December 1, 2015.

Untuk memperjelas, ini bukanlah undian atau kontes melibatkan kesempatan murni.

1) Tidak resiko atau taruhan yang terlibat dalam pendaftaran - setiap sekolah atau kelas dapat berpartisipasi, tanpa pembayaran kepada Code.org atau organisasi lain

2) Pemenang hanya akan ditunjuk diantara kelas (atau sekolah) yang ikut serta dalam Hour of Code, yang melibatkan tes keterampilan kolektif pelajar dan guru.

<% end %>

<%= view :signup_button %>