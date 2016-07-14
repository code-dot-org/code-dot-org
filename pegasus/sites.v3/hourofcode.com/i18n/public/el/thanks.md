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

# Ευχαριστούμε που γράφτηκες για να πραγματοποιήσεις μια Ώρα του Κώδικα!

Δίνετε τη δυνατότητα σε όλους τους μαθητές σε όλο τον κόσμο να μάθουν μία Ώρα του Κώδικα που μπορεί να *αλλάξει τη ζωή τους*, μεταξύ <%= campaign_date('full') %>. We'll be in touch about new tutorials and other exciting updates. Τι μπορείτε να κάνετε τώρα;

## 1. Διαδώστε το

Γίνατε μέλος του κινήματος της Ώρας του Κώδικα. Πείτε το στους φίλους σας με το **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Βρείτε έναν τοπικό εθελοντή για να σας βοηθήσει με την εκδήλωσή σας.

[Αναζητήστε τον χάρτη των εθελοντές μας](<%= resolve_url('https://code.org/volunteer/local') %>) για εθελοντές που μπορούν να σας επισκεφθούν στην τάξη ή να συνομιλήσουν μαζί σας από απόσταση μέσω βίντεο για να εμπνεύσει στους μαθητές σας για το εύρος των δυνατοτήτων της Πληροφορικής.

## Ζητήστε από όλο το σχολείο να προσφέρει μία Ώρα του Κώδικα

[Στείλετε αυτό το μήνυμα](<%= resolve_url('/promote/resources#sample-emails') %>) στον Διευθυντή και προκαλέστε κάθε τάξη να εγγραφεί.

## Ζήτα από τον εργοδότη σου να εμπλακεί 

[Στείλετε αυτό το μήνυμα](<%= resolve_url('/promote/resources#sample-emails') %>) στον διαχειριστή ή Διευθύνοντα Σύμβουλο της εταιρείας.

## 4. Προωθήστε την Ώρα του Κώδικα στην κοινότητά σας

[Προσκαλέστε μια τοπική ομάδα](<%= resolve_url('/promote/resources#sample-emails') %>) — αγόρια/κορίτσια Προσκόπους, εκκλησία, Πανεπιστήμιο, ομάδα παλαιμάχων, εργατικό συνδικάτο ή ακόμη και μερικούς φίλους. Δε χρειάζεται να πηγαίνετε σχολείο για να μάθετε νέες δεξιότητες. Χρησιμοποιήστε αυτές τις [αφίσες, πανό, αυτοκόλλητα, βίντεο, και άλλα](<%= resolve_url('/promote/resources') %>) για τη δική σας εκδήλωση.

## 5. Ζήτα από ένα τοπικό άρχοντα να υποστηρίξει την Ώρα του Κώδικα

[Στείλετε αυτό το μήνυμα](<%= resolve_url('/promote/resources#sample-emails') %>) σε τοπικούς αντιπροσώπους, Δημοτικό Συμβούλιο, ή Σχολική Εφορεία για να τους καλέσει να επισκεφτούν το σχολείο σας, για την ώρα του κώδικα. Βοηθά η δημιουργία υποστήριξης στην επιστήμη των υπολογιστών στην περιοχή σας πέρα της μίας ώρας.

## 7. Σχεδιάστε τη δική σας Ώρα του Κώδικα

Επιλέξτε μια δραστηριότητα για την Ώρα του Κώδικα και [ελέγξτε αυτόν τον οδηγό πώς-να](<%= resolve_url('/how-to') %>).

<%= view 'popup_window.js' %>