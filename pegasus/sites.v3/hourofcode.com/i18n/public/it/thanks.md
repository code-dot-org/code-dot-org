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

# Grazie per esserti iscritto per organizzare un evento dell'Ora del Codice!

Come ringraziamento per averci aiutato ad iniziare ad insegnare informatica agli studenti, vorremmo regalarti dei poster con diversi modelli di ruolo per la tua classe. Per l'ordine utilizza il codice offerta **FREEPOSTERS**. (Nota: disponibili fino ad esaurimento scorte, occorre coprire i costi di spedizione. Poiché questi manifesti sono spediti dagli Stati Uniti, le spese di spedizione internazionali possono essere piuttosto elevate. Siamo consapevoli che questo potrebbe eccedere il vostro budget e ti invitiamo a stampare i [ file PDF](https://code.org/inspire) per la tua classe).   
<br />[<button>Ordina i poster</button>](https://store.code.org/products/code-org-posters-set-of-12) Usa il codice offerta FREEPOSTERS

<% if @country == 'us' %> Thanks to the generosity of Ozobot, Dexter Industries, littleBits, and Wonder Workshop, over 100 classrooms will be selected to receive robots or circuits for their class! To be eligible to receive a set, make sure to complete the survey sent from Code.org after the Hour of Code. Code.org will select the winning classrooms. In the meantime, check out some of the robotics and circuits activities. Please note that this is only open for US schools. <% end %>

<br /> **L'Ora del Codice si svolge <%= campaign_date('full') %> e ci faremo sentire per presentare nuove esercitazioni ed altri entusiasmanti aggiornamenti. Nel frattempo, cosa si può fare ora?**

## 1. Diffondi questa iniziativa nella tua scuola e fra i tuoi conoscenti

Ti sei appena unito al movimento dell'Ora del Codice. Dillo ai tuoi amici usando l'hashtag **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Incoraggia altre persone a partecipare [usando questi modelli di email](<%= resolve_url('/promote/resources#sample-emails') %>). Contatta il Dirigente Scolastico e sfida ogni classe della tuo scuola ad iscriversi. Recluta un po' di persone — tra i boy-scout, in parrocchia, all'università, tra gli esperti, al sindacato o anche tra i tuoi amici. Non c'è bisogno di stare a scuola per acquisire nuove competenze. Invita un politico locale a visitare la vostra scuola in occasione dell'Ora del Codice. Può aiutare a costruire un supporto per l'informatica nella tua zona che va oltre un ora.

Adatta questi [poster, banner, adesivi, video e altro](<%= resolve_url('/promote/resources') %>) per il tuo evento.

## 2. Trova un volontario vicino a te per farti aiutare con il tuo evento

[Search our volunteer map](<%= codeorg_url('/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Progetta la tua Ora del Codice

Scegli un'[esercitazione dell'Ora del Codice](https://hourofcode.com/learn) per la tua classe e [segui questa guida](<%= resolve_url('/how-to') %>).

# Andare oltre un'Ora del Codice

<% if @country == 'us' %> An Hour of Code is just the beginning. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Most of the organizations offering Hour of Code tutorials also have curriculum and professional development available. If you find a lesson you like, ask about going further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> Un'Ora del Codice è solo l'inizio. La maggior parte delle organizzazioni che offrono esercitazioni dell'Ora del Codice, propongono anche corsi più lunghi e strutturati per andare oltre. Per aiutarti ad iniziare, abbiamo evidenziato dei [fornitori di corsi per andare oltre l'Ora del Codice](https://hourofcode.com/beyond).

Code.org offre anche [corsi completi di introduzione all'informatica](https://code.org/educate/curriculum/cs-fundamentals-international) tradotti in oltre 25 lingue senza alcun costo per voi o la vostra scuola. <% end %>

<%= view 'popup_window.js' %>