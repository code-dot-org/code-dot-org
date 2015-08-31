<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Faleminderit që u regjistruat si organizator në Orën e Kodimit!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Përhap fjalën

Thuaji shokëve të tu për #HourOfCode.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Pyesni gjithë shkollën që të ofrojë një Orë Kodimi

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. Pyesni punëdhënsin tuaj, që të arrish të përfshihesh

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Promovo Orën e Kodimit brenda komunitetit tënd

Rekruto një grup lokal — klube skaute djemësh/vajzash, kishash, universitetesh, grupe veteranësh ose grupe pune. Ose organizo një Orë e Kodimit "festë blloku" për lagjen tuaj.

## 5. Pyet një zyrtar të zgjedhur për të përkrahur Orën e Kodimit

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>