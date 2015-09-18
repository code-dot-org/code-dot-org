* * *

title: <%= hoc_s(:title_resources) %> layout: wide

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

<%= view :resources_banner %>

# Ευχαριστούμε που γράφτηκες για να πραγματοποιήσεις μια Ώρα του Κώδικα!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>.

Θα είμαστε σε επαφή για βραβεία, νέα σεμινάρια και άλλες συναρπαστικές ενημερώσεις το φθινόπωρο. Έτσι, τι μπορείς να κάνεις τώρα;

## 1. Διάδωσέ το

Πες στους φίλους σου για την Ώρα του Κώδικα (#HourOfCode).

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## Ζήτησε από όλο το σχολείο σου να προσφέρει την Ώρα του Κώδικα

[Send this email](<%= resolve_url('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## Ζήτησε από τον εργοδότη σου να συμμετάσχει

[Send this email](<%= resolve_url('/resources#email') %>) to your manager or the CEO.

## 4. Προώθησε την Ώρα Κώδικα στην κοινότητά σου

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5. Ζήτα από έναν τοπικό άρχοντα να υποστηρίξει την Ώρα του Κώδικα

[Send this email](<%= resolve_url('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view :signup_button %>