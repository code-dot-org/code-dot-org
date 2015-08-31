<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Tak fordi du vil arrangere Hour of Code!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Spred budskabet

Fortæl dine venner om #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Spørg om hele din skole kan deltage i Hour of Code

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 2. Få din arbejdsgiver involveret

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 3. Lav reklame for Hour of Code i dit lokalområde

Kontakt lokale grupper — spejdere, kirker, universiteter eller fagforeninger. Eller arranger selv Hour of Code i din opgang eller for børnene på vejen.

## 4. Bed en lokal politiker om at støtte Hour of Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>