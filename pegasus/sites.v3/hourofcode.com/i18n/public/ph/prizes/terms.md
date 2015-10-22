---

title: <%= hoc_s(:title_prizes_terms) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

# Mga Premyo - mga tuntunin at kundisyon

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Limitado ang premyo sa isa kada isang organizer.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Kung ang iyong buong paaralan ay sasali sa Hour of Code, bawat isang guro ay kailangang magparehistro bilang organizer para makasali.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Laptop para sa buong klase (o $10,000 para sa gamit sa technology):

Ang premyo ay limitado lamang sa mga pampublikong K-12 paaralan sa Estados Unidos. To qualify, your entire school must register for the Hour of Code by November 16, 2015. Isang paaralan kada isang lugar sa Estados Unidos ang makakatanggap ng computer sa para sa klase. Code.org will select and notify winners via email by December 1, 2015.

Upang linawin, ito ay hindi isang sweepstakes o paligsahan na kinakailangan ng swerte.

1) Walang pinansiyal o panganib na kasangkot sa pag-apply - anumang paaralan o silid-aralan ay maaaring lumahok, nang walang anumang bayad sa Code.org o iba pang mga organisasyon

2) Ang mga nanalo ay pagpipilian lamang sa mga paaralan kung saan ang buong silid-aralan (o sa paaralan) ay lumahok sa Hour of Code, at nagbigay ng test sa kakayahan ng mga mag-aaral at mga guro.

<% end %>

<%= view :signup_button %>