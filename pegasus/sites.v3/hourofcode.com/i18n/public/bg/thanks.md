<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Благодаря за регистрирането ви като домакин на Часът на кодрането събитие!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## Разпространете новината

Кажете на приятелите си за #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Попитайте във вашето училище, дали се предлага участие в Часът на кодирането

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## Предложете на вашия работодател да се включи в инициативата

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## Рекламирайте "Час на Кодиране " във вашата Община

Ангажирайте локална група — момчета или момичета от скаутски клуб, църковна общност, университет, група на ветерани или синдикат. Можете да промотирате Часът на кодирането на "block party" във вашия квартал.

## 5 Предложете на Общинската Администрация да подкрепи програмата "Един Час Програмиране"

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>