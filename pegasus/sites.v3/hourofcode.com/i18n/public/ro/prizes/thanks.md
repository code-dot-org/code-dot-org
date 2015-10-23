---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
social:
'og:title': '<%= hoc_s(:meta_tag_og_title) %>'
'og:description': '<%= hoc_s(:meta_tag_og_description) %>'
'og:image': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'og:image:width': 1705
'og:image:height': 949
'og:url': 'http://<%=request.host%>'
'og:video': 'https://youtube.googleapis.com/v/rH7AjDMz_dc'
'twitter:card': player
'twitter:site': '@codeorg'
'twitter:url': 'http://<%=request.host%>'
'twitter:title': '<%= hoc_s(:meta_tag_twitter_title) %>'
'twitter:description': '<%= hoc_s(:meta_tag_twitter_description) %>'
'twitter:image:src': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'twitter:player': 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0'
'twitter:player:width': 1920
'twitter:player:height': 1080
---

<%= view :signup_button %>

# Va mulțumim ca v-ati inscris pentru sansa de a castiga echipamente hardware in valoare de 10 000 de dolari

Intreaga dumneavoastra scoala a intrat acum in cursa pentru premiile noastre, laptop-uri pentru toata clasa sau alte echipamente hardware in valoare de 10 000 de dolari. Vom analiza aplicatia dvs si vom anunta castigatorii in decembrie.

## 1. Răspândește vestea

Spune prietenilor tai despre #HourOfCode.

## 2. Solicită întregii şcoli sa susțină o Oră de Programare

[Trimiteti acest e-mal](<%= resolve_url('/promote/resources#email') %>)directorului scolii dvs.

## 3. Solicită angajatorului tău să se implice

[Trimiteti acest e-mal](<%= resolve_url('/promote/resources#email') %>)catre manager sau CEO-ul companiei la care lucrati.

## 4. Promoveaza Hour of Code în comunitatea ta

Recruteaza un grup local- un club mixt baieti/fete, Biserica, Universitatea, veteranii sau sindicatul. Sau gazduieste Ora de Programare in cadrul unei petreceri pentru cartierul dumneavoastră. [Trimiteti acest e-mail](<%= resolve_url('/promote/resources#email') %>).

## 5. Solicită unui oficial, ales local, sprijinul pentru organizarea Hour of Code

[Trimiteti acest e-mail](<%= resolve_url('/promote/resources#politicians') %>)catre primarul dvs, consiliului local sau inspectorilor scolari si oferiti-le invitatia de a va vizita scoala.

<%= view :signup_button %>