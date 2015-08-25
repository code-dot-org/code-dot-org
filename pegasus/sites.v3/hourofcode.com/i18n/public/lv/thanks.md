<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Paldies, ka uzņēmies vadīt "Programmēšanas stundu"!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Dalies ar informāciju

Pastāsti saviem draugiem par "Programmēšanas stundu".

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Lūdz visai skolai piedalīties "Programmēšanas stundā"

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Lai iesaistītos, jautā savam darba devējam

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Uzslavē "Programmēšanas stundu" savā kopienā

Iesaisti vietējās organizācijas - baznīcas, universitāšu vai veterānu kopienas/organizācijas. Tāpat vari arī vadīt "Programmēšanas stundu" kaimiņiem.

## 5. Jautājiet ievēlētajai amatpersonai, lai atbalsta "Programmēšanas stundu"

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>