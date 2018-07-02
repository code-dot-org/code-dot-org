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
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Vă mulţumim ca v-ați înscris pentru organizarea Hour of Code!

Ca un mulțumesc pentru ajutorul oferit de a face posibil pentru studenți sa înceapă să învețe ștința computărelor, ne-ar plăcea să va oferim un set gratis ds postere printate profesionist oferind diverse modele de urmat pentru clasa dumneavoastra. Foloseste codul oferit **POSTEREGRATUITE** la verificare. (Nota: aceasta este valabila doar in timp ce resursele dureaza si o sa ai nevoie sa acopere costurile de livrare. Intru-cat aceste postere sunt transportate din Statele Unite, costurile de transport pot fi destul de ridicate daca sunt transportate in Canada si international. Înțelegem că acestea s-ar putea sa nu se afle în bugetul dvs. și vă incurajăm să inserați [fișiere Pdf](https://code.org/inspire) pentru clasa dvs.)  
<br mark="crud-mark" /> [ <button>Obțineți postere</button>](https://store.code.org/products/code-org-posters-set-of-12) Folosiți codul de ofertă POSTEREGRATUITE

<% if @country == 'us' %> Datorită generozității Ozobot, Dexter Industries, littleBits şi Wonder Workshop, peste 100 de săli de clase vor fi selectate pentru a primi roboţi sau circuite pentru clasa lor! Pentru a fi eligibil în a primi un set, asiguraţi-vă că ați finalizat sondajul trimis de Code.org după Ora de Cod. Code.org va selecta săli de clasă câștigătoare. Între timp, aruncați-vă o privire asupra unora dintre activităţile de robotică şi circuite. Vă rugăm să reţineţi că acest lucru este deschis numai pentru şcolile din SUA. <% end %>

<br /> **Ora de Cod se derulează pe parcursul <%=campaign_date('full') %> și vă vom informa despre noile tutoriale și alte actualizări captivante în funcție de cum apar acestea. Între timp, ce poți face tu acum?**

## 1. Imprastie vestea in scoala si comunitatea ta

Tocmai te-ai alăturat mișcării Hour of Code. Spune-le și prietenilor cu **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Incurajeză și alte persoane să participe[ cu e-mailuri eșantion.](%= resolve_url('/promote/resources#sample-emails') %) Contactează-ți directorul și provoacă fiecare clasă din școala ta să se înscrie. Recrutează un grup local - club de cercetași băieți/fete, biserică, universitate, grup de veterani, sindicat sau chiar și câțiva prieteni. Nu trebuie să fiți în şcoală ca să învățaţi noi competenţe. Invită un politician sau legislator să îți viziteze școala pentru Ora de Cod. Toate acestea te pot ajuta în construirea susținerii informaticii și dincolo de o oră.

Foloseşte aceste [postere, bannere, stickere, videoclipuri si multe altele](%= resolve_url('/promote/resources') %) pentru evenimentul tau.

## 2. Găsiți un voluntar pe plan local pentru a vă ajuta în organizarea evenimentului dumneavoastră.

[Search our volunteer map](%= codeorg_url('/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 7. Planificați-vă Ora de Programare

Alegeți o [activitate Ora de Cod](https://hourofcode.com/learn) pentru clasa dvs. și[ revizuiți acest ghid](%= resolve_url('/how-to') %).

# Mergi mai departe de Ora Codului

<% if @country == 'us' %> An Hour of Code is just the beginning. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. If you find a lesson you like, ask about going further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> An Hour of Code is just the beginning. Most of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org also offers full [introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) translated into over 25 languages at no cost to you or your school. <% end %>

<%= view 'popup_window.js' %>