* * *

title: Σας ευχαριστούμε για την εγγραφή σας! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/code-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Ευχαριστούμε που γράφτηκες για να πραγματοποιήσεις μια Ώρα του Κώδικα!

**ΚΑΘΕ** διοργανωτής Ώρας Κώδικα θα λάβει 10 GB χώρου στο Dropbox ή $10 σε πίστωση Skype ως ευχαριστήριο. [Λεπτομέρειες](<%= hoc_uri('/prizes') %>)

## 1. Διάδωσέ το

Πες στους φίλους σου για την Ώρα του Κώδικα (#HourOfCode).

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Ask your whole school to offer an Hour of Code

[Στείλε αυτό το email](<%= hoc_uri('/resources#email') %>) ή [αυτό το φυλλάδιο](/resources/hoc-one-pager.pdf) στο διευθυντή σου.

<% else %>

## 2. Ask your whole school to offer an Hour of Code

[ Στείλε αυτό το μήνυμα](<%= hoc_uri('/resources#email') %>) ή δώσε [αυτό το φυλλάδιο](/resources/hoc-one-pager.pdf) αυτό το φυλλάδιο</a> στον διευθυντή σου.

<% end %>

## 3.Κάντε μια γενναιόδωρη δωρεά 

[Κάντε μια δωρεά στην καμπάνια μας crowdfunding.](http://<%= codeorg_url() %>/donate) Χρειαζόμαστε τη βοήθειά σας για να φτάσουμε τα 100 εκατομμύρια παιδιά. Μόλις ξεκινήσαμε τη [μεγαλύτερη καμπάνια crowdfunding για την εκπαίδευση](http://<%= codeorg_url() %>/donate) που έγινε ποτέ. *Κάθε* δολάριο θα διπλασιαστεί από [δότες](http://<%= codeorg_url() %>/about/donors), διπλασιάζοντας το καλό που κάνετε.

## Ζήτα από τον εργοδότη σου να εμπλακεί 

[ Στείλε αυτό το μήνυμα](<%= hoc_uri('/resources#email') %>) στον διαχειριστή σου ή στον προϊστάμενο ή τον Διευθύνοντα Σύμβουλο. Ή [δώσε τους αυτό το φυλλάδιο](http://hourofcode.com/resources/hoc-one-pager.pdf).

## Προωθήστε την ώρα του κώδικα μέσα στην κοινωνία σας

Επιστράτευσε έναν τοπικό σύλλογο — ένα σώμα προσκόπων, μια ενορία, ένα πανεπιστήμιο, μια ένωση εργαζομένων. Ή διοργάνωσε μια Ώρα του Κώδικα για το τη γειτονιάς σου.

## 5. Ζήτα από ένα τοπικό άρχοντα να υποστηρίξει την Ώρα του Κώδικα

[ Στείλε αυτό το μήνυμα](<%= hoc_uri('/resources#politicians') %>) στον δήμαρχο, το Δημοτικό Συμβούλιο, ή το Σχολικό Συμβούλιο. Ή [δώσε τους αυτό το φυλλάδιο](http://hourofcode.com/resources/hoc-one-pager.pdf) και καλέσε τους να επισκεφτούν το σχολείο σου.

<%= view 'popup_window.js' %>