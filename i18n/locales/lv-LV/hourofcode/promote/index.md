---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_donor_text).gsub(/%{random_donor}/, get_random_donor_twitter)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_donor_text).include? '#HourOfCode' %>

# Get your community involved in the Hour of Code

## 1. Dalies ar informāciju

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Palūdz visai skolai piedalīties Programmēšanas stundā

[Nosūti šo e-pastu](%= resolve_url('/promote/resources#sample-emails') %) savam direktoram un izaicini pieteikt katru skolas klasi.

## 3. Aicini iesaistīties savam daba devējam

[Nosūti šo e-pastu](%= resolve_url('/promote/resources#sample-emails') %) savam vadītājam vai direktoram.

## 4. Popularizē Programmēšanas stundu savā kopienā

[Piesaki vietējo grupu](%= resolve_url('/promote/resources#sample-emails') %) — zēnu/meiteņu klubu, baznīcu, universitāti, pensionāru grupu, arodbiedrību vai par dažus draugus. Tev nav jābūt skolā, lai apgūtu jaunas prasmes. Izmanto šos [plakātus, banerus, uzlīmes, video un citus materiālus](%= resolve_url('/promote/resources') %) savam pasākumam.

## 5. Palūdz vietējo pašvaldību atbalstīt Programmēšanas stundu

[Nosūti šo e-pastu](%= resolve_url('/promote/resources#sample-emails') %) savai pašvaldībai, pilsētas domei vai skolas padomei un uzaicini viņus apmeklēt tavas skolas Programmēšanas stundu. Tādējādi var veidot atbalstu datorzinātnēm savā reģionā arī pēc vienas stundas.

<%= view :signup_button %>