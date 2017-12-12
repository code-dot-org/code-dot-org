---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Get your community involved in the Hour of Code

## 1. Spread the word

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Ask your whole school to offer an Hour of Code

[Sendu þennan tölvupóst](<%= resolve_url('/promote/resources#sample-emails') %>) til skólastjórans og skoraðu á hvern bekk í skólanum að skrá sig.

## 3. Ask your employer to get involved

[Sendu þennan tölvupóst](<%= resolve_url('/promote/resources#sample-emails') %>) til yfirmanns þíns eða forstjóra.

## 4. Promote Hour of Code in your community

[Skráðu hóp í nágrenninu](<%= resolve_url('/promote/resources#sample-emails') %>)— skátaflokk, kirkjuhóp, háskóla, eldri borgara, stéttarfélag eða bara vinahóp. You don't have to be in school to learn new skills. Notaðu þessi [veggspjöld, borða, límmiða, myndbönd og fleira](<%= resolve_url('/promote/resources') %>) fyrir þinn eigin viðburð.

## 5. Ask a local elected official to support the Hour of Code

[Sendu þennan tölvupóst](<%= resolve_url('/promote/resources#sample-emails') %>) til þingmanna, bæjarfulltrúa eða menntamálanefndar og bjóddu þeim að heimsækja skólann þinn á Klukkustund kóðunar. It can help build support for computer science in your area beyond one hour.

<%= view :signup_button %>