---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_donor_text).gsub(/%{random_donor}/, get_random_donor_twitter)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_donor_text).include? '#HourOfCode' %>

# Πώς μπορεί η κοινότητά σας να συμμετάσχει στην Ώρα του Κώδικα

## 1. Διαδώστε το

Ενημερώστε τους φίλους σας για την **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## Ζητήστε από όλο το σχολείο να προσφέρει μία Ώρα του Κώδικα

[Στείλετε αυτό το μήνυμα](%= resolve_url('/promote/resources#sample-emails') %) στον Διευθυντή και προκαλέστε κάθε τάξη να εγγραφεί.

## Ζήτησε από τον εργοδότη σου να συμμετάσχει

[Στείλετε αυτό το μήνυμα](%= resolve_url('/promote/resources#sample-emails') %) στον διαχειριστή ή Διευθύνοντα Σύμβουλο της εταιρείας.

## 4. Προωθήστε την Ώρα του Κώδικα στην κοινότητά σας

[Προσκαλέστε μια τοπική ομάδα](%= resolve_url('/promote/resources#sample-emails') %) — αγόρια/κορίτσια Προσκόπους, εκκλησία, Πανεπιστήμιο, ομάδα παλαιμάχων, εργατικό συνδικάτο ή ακόμη και μερικούς φίλους. Δε χρειάζεται να πηγαίνετε σχολείο για να μάθετε νέες δεξιότητες. Χρησιμοποιήστε αυτές τις [αφίσες, πανό, αυτοκόλλητα, βίντεο, και άλλα](%= resolve_url('/promote/resources') %) για τη δική σας εκδήλωση.

## 5. Ζήτα από έναν τοπικό άρχοντα να υποστηρίξει την Ώρα του Κώδικα

[Στείλετε αυτό το μήνυμα](%= resolve_url('/promote/resources#sample-emails') %) σε τοπικούς αντιπροσώπους, Δημοτικό Συμβούλιο, ή Σχολική Εφορεία για να τους καλέσει να επισκεφτούν το σχολείο σας, για την ώρα του κώδικα. Βοηθά η δημιουργία υποστήριξης στην επιστήμη των υπολογιστών στην περιοχή σας πέρα της μίας ώρας.

<%= view :signup_button %>