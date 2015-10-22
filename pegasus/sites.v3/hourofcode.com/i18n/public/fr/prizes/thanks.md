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

# Merci de vous être inscrit pour avoir une chance de gagner 10 000 $ de matériel

Toute votre école dest maintenant inscrite pour gagner un ensemble d'ordinateurs portables pour la classe (ou 10 000 $ pour acquérir d'autres technologies). Nous allons examiner votre demande et annoncer les gagnants en décembre.

## 1. En parler

Parlez de #HourOfCode à vos amis.

## 2. Proposez à votre école de participer à Une Heure de Code

[Envoyez cet email](<%= resolve_url('/promote/resources#email') %>) à votre principal ou directeur.

## 3. Invitez votre employeur à s'impliquer

[Envoyez cet email](<%= resolve_url('/promote/resources#email') %>) à votre manager ou à votre directeur général.

## 4. Faites la promotion d'une Heure de Code dans votre communauté

Constituez un groupe - dans votre église ou votre université, à la maison de retraite d'à côté ou votre association de quartier. Ou hébergez une petite fête de quartier Une Heure de Code pour vos voisins. [Envoyez cet e-mail](<%= resolve_url('/promote/resources#email') %>).

## 5. Demandez à un élu local de soutenir l'initiative Une Heure de Code

[Envoyez cet email](<%= resolve_url('/promote/resources#politicians') %>) à votre maire, Conseiller municipal ou à la directions de votre école et invitez-les à participer à l'évènement.

<%= view :signup_button %>