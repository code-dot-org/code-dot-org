---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
nav: how_to_nav

social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": "http://<%=request.host%>"

  "twitter:card": player
  "twitter:site": "@codeorg"
  "twitter:url": "http://<%=request.host%>"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
---
<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Vă mulţumim ca v-ați înscris pentru organizarea Hour of Code!

Ca un mulțumesc pentru ajutorul oferit de a face posibil pentru studenți sa înceapă să învețe ștința computărelor, ne-ar plăcea să va oferim un set gratis ds postere printate profesionist oferind diverse modele de urmat pentru clasa dumneavoastra. Foloseste codul oferit **POSTEREGRATUITE** la verificare. (Nota: aceasta este valabila doar in timp ce resursele dureaza si o sa ai nevoie sa acopere costurile de livrare. Intru-cat aceste postere sunt transportate din Statele Unite, costurile de transport pot fi destul de ridicate daca sunt transportate in Canada si international. We understand that this may not be in your budget, and we encourage you to print the [PDF files](https://code.org/inspire) for your classroom.)  
<br /> [<button>Get posters</button>](https://store.code.org/products/code-org-posters-set-of-12) Use offer code FREEPOSTERS

<br /> **Ora codului ruleaza pe parcursul <%=campaign_date('full')%>. O sa tinem legatura cu noile tutoriale si alte captivante actualizarii dupa cum apar. In tmpul acesta, ce poti face acum?**

## 1. Imprastie vestea in scoala si comunitatea ta

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Incurajeaza alte persoane sa participe[cu e-mailuri esantion.](<%= resolve_url('/promote/resources#sample-emails') %>)Contacteaza-ti directorul si provoaca fiecare clasa la scoala ta sa se inscrie. Recruteaza un grup local-baiat/fata cercetasi club, biserica, universitate, grup de veterani, sindicat sau chiar si cativa prieteni. Nu trebuie să fii in şcoală ca să înveţi noi competenţe. Invita un politician sau legislator sa iti viziteze scoala pentru Ora Codului. Acestea te pot ajuta in construirea unei sustineri pentru tehnologia computerelor si programare si dincolo de tutorialele de o ora.

Foloseşte aceste [postere, bannere, stickere, videoclipuri si multe altele](<%= resolve_url('/promote/resources') %>) pentru evenimentul tau.

## 2. Găsiți un voluntar pe plan local pentru a vă ajuta în organizarea evenimentului dumneavoastră.

[Cauta harta noastra cu voluntari](<%= resolve_url('https://code.org/volunteer/local') %>) pentru voluntari care pot sa iti viziteze clasa sau video chatul de la distanta sa iti inspire studenti despre multitudinea de posibilitati cu stiinta computarelor.

## 3. Planoficati Ora Codului

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](<%= resolve_url('/how-to') %>).

# Mergi mai departe de Ora Codului

<% if @country == 'us' %> O Ora a Codului este doar inceputul. Fie ca esti un administrator, profesor, sau avocat, avem[ dezvoltare profesionala, curriculum, si resurse sa te ajute sa aduci clasele de stiinta a computarelor la scoala ta sau sa iti extinda ofertele.](https://code.org/yourschool) Daca deja predai stiinta computarelor, foloseste aceste resurse pe parcursul CS Saptamana Educatiei sa aduni suport de la adminostratia, parinti, si comunitate.

Ai multe alegeri sa se potriveasca scolii tale. Multele organizatii ce ofera tutoriale Ora Codului au deasemenea curriculm si dezvoltare personala disponibila. Daca gasesti o lectie ce iti place, intreaba de mersul mai departe. Sa te ajutam sa mergi mao departe, ti-am evidentiant un numar defurnizorii de curriculm care sa te ajute ori studentii tai peste o ora</p> 

<% else %> O Ora a Codului este doar inceputul. Multele din organizatii ce ofera lectii Ora Codului au deasemenea curriculume disponibile sa se duca mai departe. Sa te ajutam sa mergi mao departe, ti-am evidentiant un numar defurnizorii de curriculm care sa te ajute ori studentii tai peste o ora</p> 

Cod.org ofera deasemenea tot [introducerea cursurilor in stiintele computarelor](https://code.org/educate/curriculum/cs-fundamentals-international) traduse in peste 25 de limbi fara nici un cost pentru tine si scoala ta. <% end %>

<%= view 'popup_window.js' %>
