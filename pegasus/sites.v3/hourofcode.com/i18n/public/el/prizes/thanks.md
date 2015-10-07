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

## 1. Διαδώστε το

Πες στους φίλους σου για την Ώρα του Κώδικα (#HourOfCode).

## Ζήτησε από όλο το σχολείο σου να προσφέρει την Ώρα του Κώδικα

[Send this email](<%= resolve_url('/promote/resources#email') %>) to your principal.

## Ζήτησε από τον εργοδότη σου να συμμετάσχει

[Send this email](<%= resolve_url('/promote/resources#email') %>) to your manager, or the CEO.

## 4. Προώθησε την Ώρα του Κώδικα στην κοινότητά σου

Προσκάλεσε να αναμειχθούν μια τοπική ομάδα - αγόρια/κορίτσια πρόσκοποι, την Εκκλησία, μια πανεπιστημιακή ομάδα, μια ομάδα ατόμων τρίτης ηλικίας ή ένα σωματείο εργαζομένων. Ή φιλοξένησε μια Ώρα του Κώδικα "διασκέδασης με block" για τη γειτονιά σου. [Send this email](<%= resolve_url('/promote/resources#email') %>).

## 5. Ζήτα από έναν τοπικό άρχοντα να υποστηρίξει την Ώρα του Κώδικα

[Send this email](<%= resolve_url('/promote/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school.

<%= view :signup_button %>