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

# Hvernig á að taka þátt

## 1. Skráðu þig til að halda Klukkustund kóðunar

Allir, alls staðar geta haldið Klukkustund kóðunar. [Skráðu þig](<%= resolve_url('/') %>) til að fá tilkynningar og eiga rétt á verðlaunum.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Láttu aðra vita

Segðu vinum þínum frá **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Biddu skólann þinn að bjóða Klukkustund kóðunar

[Sendu þennan tölvupóst](<%= resolve_url('/promote/resources#sample-emails') %>) til skólastjórans og skoraðu á hvern bekk í skólanum að skrá sig. <% if @country == 'us' %> One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 4. Biddu vinnuveitanda þinn að taka þátt

[Sendu þennan tölvupóst](<%= resolve_url('/promote/resources#sample-emails') %>) til yfirmanns þíns eða forstjóra.

## 5. Kynntu Klukkustund kóðunar í samfélaginu

[Skráðu hóp í nágrenninu](<%= resolve_url('/promote/resources#sample-emails') %>)— skátaflokk, kirkjuhóp, háskóla, eldri borgara, stéttarfélag eða bara vinahóp. You don't have to be in school to learn new skills. Notaðu þessi [veggspjöld, borða, límmiða, myndbönd og fleira](<%= resolve_url('/promote/resources') %>) fyrir þinn eigin viðburð.

## 6. Fáðu kjörinn fulltrúa á svæðinu til að styðja Klukkustund kóðunar

[Sendu þennan tölvupóst](<%= resolve_url('/promote/resources#sample-emails') %>) til þingmanna, bæjarfulltrúa eða menntamálanefndar og bjóddu þeim að heimsækja skólann þinn á Klukkustund kóðunar. It can help build support for computer science in your area beyond one hour.

<%= view :signup_button %>