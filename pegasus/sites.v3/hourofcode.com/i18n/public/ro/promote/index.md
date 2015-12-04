---

title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav

---

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Cum să te implici

## 1. Înscrieţi-vă pentru a organiza un eveniment Hour of Code

Oricine, oriunde poate gazdui o Oră de Preogramare[ Înscrieţi-vă](<%= resolve_url('/') %>) pentru a primi actualizări şi a beneficia de premii.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 1. Răspândește vestea

Spune-le şi prietenilor tai despre **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Solicită întregii şcoli sa organizeze o Oră de Programare

[Trimiteți acest e-mail](<%= resolve_url('/promote/resources#sample-emails') %>)directorului scolii dvs si astfel provocati fiecare clasa sa se inscrie. <% if @country == 'us' %> O scoala norocoasa din *fiecare* stat U.S. (si Washington D.C.) vor castiga echipamente tehnologice in valoare de 10 000 de dolari. [Inregistreaza-te aici](<%= resolve_url('/prizes/hardware-signup') %>) pentru a fi eligibil si [**vezi castigatorii de anul trecut.**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 3. Solicită angajatorului să se implice

[Trimite acest e-mail](<%= resolve_url('/promote/resources#sample-emails') %>)catre manager-ul sau CEO-ul companiei la care lucrați.

## 4. Promovează Hour of Code în jurul tău

[Recruteaza un grup local](<%= resolve_url('/promote/resources#sample-emails') %>)- cluburi de fete/baieti, biserici, universitati, grupuri de veterani, sindicatele sau chiar câțiva prieteni. Nu trebuie să fii in şcoală ca să înveţi noi competenţe. Foloseşte aceste [ postere, bannere, stickere, videoclipuri si multe altele](<%= resolve_url('/promote/resources') %>) pentru evenimentul tau.

## 5. Solicită unui oficial ales local sprijinul pentru organizarea Hour of Code

[Trimite acest e-mail](<%= resolve_url('/promote/resources#sample-emails') %>) catre reprezentantii locali, consiliului local, inspectorilor scolari si invita-i sa iti viziteze scoala in timpul unui eveniment Hour of Code. Acestea te pot ajuta in construirea unei sustineri pentru tehnologia computerelor si programare si dincolo de tutorialele de o ora.

<%= view :signup_button %>