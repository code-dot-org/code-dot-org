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

## 1. Ширите причу

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Ask your whole school to offer an Hour of Code

[Пошаљите овај имејл](<%= resolve_url('/promote/resources#sample-emails') %>) вашем директору и позовите сваки разред у вашој школи да се придружи.

## 3. Ask your employer to get involved

[Пошаљите овај имејл](<%= resolve_url('/promote/resources#sample-emails') %>) вашем директору или менаџеру.

## 4. Промовишите Hour of Code у својој заједници

[Регрутујте локалну групу](<%= resolve_url('/promote/resources#sample-emails') %>)— извиђаче, цркву, универзитет, ветеране, радничка удружења или можда неке пријатеље. Не морате похађати школу да бисте стекли неке нове вештине. Употребите ове [постере, банере, налепнице, видео филмове и друго](<%= resolve_url('/promote/resources') %>) за свој догађај.

## 5. Ask a local elected official to support the Hour of Code

[Пошаљите овај имјел](<%= resolve_url('/promote/resources#sample-emails') %>) вашем локалном представнику, градском-општинском одбору или школском савету и позовите их да посете вашу школу и присуствују Часу кода. То може помоћи ширењу подршке за рачунарске науке у вашој околини и ван једног часа.

<%= view :signup_button %>