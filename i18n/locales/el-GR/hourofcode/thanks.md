* * *

title: Σας ευχαριστούμε για την εγγραφή σας! layout: wide

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Ευχαριστούμε που γράφτηκες για να πραγματοποιήσεις μια Ώρα του Κώδικα!

**ΚΑΘΕ** διοργανωτής μιας Ώρας του Κώδικα θα λάβει 10 GB χώρο στο Dropbox ή 10$ μονάδες Skype σαν ευχαριστήριο δώρο. [Λεπτομέρειες](/prizes)

<% if @country == 'us' %>

Κάλεσε [όλο το σχολείο σου](/us/prizes) να συμμετάσχει για μια ευκαιρία για μεγάλα έπαθλα για όλο το σχολείο.

<% end %>

## 1. Διάδωσέ το

Πες στους φίλους σου για την Ώρα του Κώδικα (#HourOfCode).

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Ask your whole school to offer an Hour of Code

[Στείλε αυτό το email](/resources#email) ή [δώσε αυτό το φυλλάδιο στο διευθυντή σου](/files/schools-handout.pdf). Once your school is on board, [enter to win $10,000 worth of technology for your school](/prizes) and challenge other schools in your area to get on board.

<% else %>

## 2. Ask your whole school to offer an Hour of Code

[Στείλε αυτό το μήνυμα](/resources#email) ή δώσε [αυτό το φυλλάδιο](/files/schools-handout.pdf) στο διευθυντή σου.

<% end %>

## 3.Κάντε μια γενναιόδωρη δωρεά 

[Donate to our crowdfunding campaign](http://code.org/donate). Για να διδάξουμε σε 100 εκατομμύρια παιδιά, θέλουμε την υποστήριξη σας. We just launched what could be the [largest education crowdfunding campaign](http://code.org/donate) in history. Every dollar will be matched by major Code.org [donors](http://code.org/about/donors), doubling your impact.

## Ζήτα από τον εργοδότη σου να εμπλακεί 

[Send this email](/resources#email) to your manager, or the CEO. Or [give them this handout](/resources/hoc-one-pager.pdf).

## Προωθήστε την ώρα του κώδικα μέσα στην κοινωνία σας

Φτιάξε ένα τμήμα για — ένα σώμα προσκόπων, μια ενορία, ένα πανεπιστήμιο, μια ενώση εργαζομένων. Ή κάνε μια Ώρα του Κώδικα για το τετράγωνο της γειτονιάς σου.

## 5. Ζήτα από ένα τοπικό άρχοντα να υποστηρίξει την Ώρα του Κώδικα

Στείλτε αυτό το e-mail στον δήμαρχο, στο δημοτικό συμβούλιο ή στον σχολικό σας πίνακα. Μπορείτε επίσης να το δώσετε εσείς αυτοπροσώπως για να τον καλέσετε στο σχολείο σας.

<%= view 'popup_window.js' %>