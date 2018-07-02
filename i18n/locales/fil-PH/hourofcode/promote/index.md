---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url na =>"http://hourofcode.com", :kaugnay =>'codeorg', :hashtags=>'', :teksto =>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' malibang hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Isangkot ang iyong kumonidad sa Hour of Code

## 1. Palaganapin ang salita

Sabihan ang iyong mga kaibigan tungkol sa **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Hingin sa inyong buong paaralan na mag-alok ng Hour of Code

[Ipadala itong email](%= resolve_url('/promote/resources#sample-emails') %) sa iyong punong-guro at hamunin ang bawat silid-aralan sa iyong paaralan upang mag-sign up.

## 3. Hilingin sa iyong employer na makibahagi

[Ipadala itong email](%= resolve_url('/promote/resources#sample-emails') %) sa iyong manager o CEO ng kumpanya.

## 4. Ilunsad ang Hour of Code sa iyong kumonidad

[Kumalap ng lokal na grupo](%= resolve_url('/promote/resources#sample-emails') %)— lalaki/babae scout club, simbahan, unibersidad, grupo ng mga beterano, labor union, o kahit ang ilang mga kaibigan. Hindi mo kailangang pumasok ng paaralan para matuto ng bagong kasanayan. Gamitin itong [posters, bandera, stickers, videos at higit pa](%= resolve_url('/promote/resources') %) para sa iyong sariling kaganapan.

## 5. Hingin sa isang lokal na opisyal na sumuporta sa Hour of Code

[Ipadala itong email](%= resolve_url('/promote/resources#sample-emails') %) sa iyong lokal na kinatawan, konsehal ng lungsod, o school board at imbitahin sila na bumisita sa iyong paaralan para sa Hour of Code. Makakatulong itong bumuo ng suporta para sa computet science sa inyong lugar ng higit sa isang oras.

<%= view :signup_button %>