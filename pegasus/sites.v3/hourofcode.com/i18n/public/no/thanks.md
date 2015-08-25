<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Takk for at du meldte deg på som vert for Kodetimen!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Spre budskapet

Fortell vennene dine om #Kodetimen.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Spør hele skolen din om å tilby en Kodetime

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Spør arbeidsgiveren din om å bidra

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Promoter Kodetimen i ditt lokalsamfunn

Rekrutter en lokal klubb, ett idrettslag, universitet eller fagforening. Eller arranger en Kodetime "fest" for nabolaget.

## 5. Spør en lokalpolitiker om å støtte Kodetimen

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>