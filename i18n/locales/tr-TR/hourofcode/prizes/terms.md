* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Ödüller - Şartlar ve Koşullar

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Organizatör başına 1 ödeme ile sınırlıdır.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Okulunuzdaki herkes Kodlama Saatine katılacaksa, her bir eğitimci yetkilendirme için bireysel olarak üye olmalıdır.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Tüm sınıfa dizüstü bilgisayar (veya 10.000$ değerinde başka bir teknoloji):

Ödül sadece Amerikan K-12 devlet okulları ile sınırlıdır. To qualify, your entire school must register for the Hour of Code by November 16, 2015. Amerika'da her eyalette bir okul bir sınıflık bilgisayar sahibi olacaktır. Code.org will select and notify winners via email by December 1, 2015.

Netleştirmek gerekirse ; bu bir çekiliş veya şans içeren bir yarışma değildir.

1) Başvurunun herhangi bir finansal risk içermesi söz konusu değildir - Code.org'a ya da başka bir organizasyona her hangi bir ödeme yapmadan, bütün okullar veya sınıflar katılabilir

2) Kazananlar yalnızca öğrenci ve öğretmenlerin ortak becerilerini kapsayan bütün bir sınıf ( veya okul) olarak Kodlama Saati'ne katılanlar arasından seçilecektir.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Bir konuk konuşmacıyla video sohbeti:

Para ödülü Amerika ve Kanada'daki K-12 derslikleri ile sınırlıdır. Code.org kazanan sınıfları seçecek, web görüşmesi için bir zaman aralığı belirleyecek ve uygun öğretmenle işbirliği içinde teknoloji detaylarını ayarlayacaktır. Ödüle hak kazanmak için bütün okulun katılması zorunlu değildir. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>