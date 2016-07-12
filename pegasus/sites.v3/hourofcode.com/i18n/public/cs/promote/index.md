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

# Jak se zapojit

## 1. Povídejte o tom

Povězte svým přátelům o **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Požádejte, aby celá vaše škola nabídla akci Hodina kódu

[Poslat tento email](<%= resolve_url('/promote/resources#sample-emails') %>) vašemu řediteli školy a vyzvat každou třídu ve škole se přihlásit. <% if @country == 'us' %> Jedna šťastná škola v *každém* státě U.S. (i Washington D.C.) vyhraje techniku v ceně $10,000. <% end %>

## 3. Požádejte svého zaměstnavatele, aby se zapojil

[Pošlete tento email](<%= resolve_url('/promote/resources#sample-emails') %>) vašemu nadřízenému nebo řediteli společnosti.

## 4. Promujte Hodinu kódu ve vaší komunitě

[Získejte místní skupinu](<%= resolve_url('/promote/resources#sample-emails') %>)— chlapecké/dívčí kluby, církev, univerzity, veteránské spolky, odboráře, nebo dokonce některé přátelé. Nemusíte být ve škole, abyste se naučili nové dovednosti. Používejte tyto [plakáty, banery, nálepky, videa a další](<%= resolve_url('/promote/resources') %>) pro vaši vlastní událost.

## 5. Požádejte místní zvolené politiky pro podporu akce Hodina kódu

[Pošlete tento email](<%= resolve_url('/promote/resources#sample-emails') %>) vašim místním politikům, městské radě nebo školní radě a pozvěte je k návštěvě vaší školy pro Hodinu kódu. Může to pomoci rozvoji informatiky ve vašem regionu za jednu hodinu.