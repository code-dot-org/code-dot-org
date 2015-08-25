<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Merci de vous être inscrit pour organiser une Heure de Code!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. En parler

Parlez de #HourOfCode à vos amis.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Demandez à toute votre école de participer à l'Heure de Code

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Demandez à votre employeur de s'impliquer

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Promouvez l'Heure du Code dans votre communauté

Recruter parmi un groupe local — scoutisme, église, Université, groupe d'anciens combattants ou syndicat. Ou héberger une heure de Code en activité communautaire, dans votre quartier.

## 5. Demandez à un élu local de soutenir l'Heure de Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>