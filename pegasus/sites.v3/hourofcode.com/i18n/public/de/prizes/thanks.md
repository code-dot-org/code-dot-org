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

# Thanks for signing up for a chance to win the $10,000 Hardware Prize

Your whole school is now entered to win a class-set of laptops (or $10,000 for other technology). We'll be reviewing your application and announcing the winners in December.

## 1. Weitersagen

Erzähl deinen Freunden von #HourOfCode.

## 2. Frage deine Schule eine Hour of Code anzubieten

[Send this email](<%= resolve_url('/promote/resources#email') %>) to your principal.

## 3. Frage deinen Arbeitgeber sich zu engagieren

[Send this email](<%= resolve_url('/promote/resources#email') %>) to your manager, or the CEO.

## 4. Fördere die Hour of Code in deiner Umgebung

Werbe eine lokale Gruppe an – Jungen/Mädchen Pfadfinder Verein, Kirche, Universität oder eine Gewerkschaft. Oder hoste eine Hour of Code "Block Party" für in deiner Nachbarschaft. [Send this email](<%= resolve_url('/promote/resources#email') %>).

## 5. Frage eine öffentliche Stelle ob sie die Hour of Code unterstützen möchte

[Send this email](<%= resolve_url('/promote/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school.

<%= view :signup_button %>