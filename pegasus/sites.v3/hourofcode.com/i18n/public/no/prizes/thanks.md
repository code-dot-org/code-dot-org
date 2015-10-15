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

## 1. Spre budskapet

Fortell vennene dine om #Kodetimen.

## 2. Spør hele skolen din om å tilby en Kodetime

[Send this email](<%= resolve_url('/promote/resources#email') %>) to your principal.

## 3. Spør arbeidsgiveren din om å bidra

[Send this email](<%= resolve_url('/promote/resources#email') %>) to your manager, or the CEO.

## 4. Reklamer for Hour of Code i nærmiljøet ditt

Rekrutter en lokal klubb eller gruppe - Speidere, Universitet og Høgskoler, Fagforeninger osv. Eller arranger en Hour of Code i nabolaget ditt. [Send this email](<%= resolve_url('/promote/resources#email') %>).

## 5. Spør en lokalpolitiker om å støtte Kodetimen

[Send this email](<%= resolve_url('/promote/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school.

<%= view :signup_button %>