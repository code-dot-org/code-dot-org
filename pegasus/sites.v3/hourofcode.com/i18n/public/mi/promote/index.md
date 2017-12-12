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

## 1. Kawea te kupu

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Tēnā tono atu ki tō kura kia riro mā te kura katoa tētahi takunetanga Hour of Code e hāpai

[Tukuna tēnei īmēra](<%= resolve_url('/promote/resources#sample-emails') %>) ki tō tumuaki me te whakatakoto i te taki ki mua i ngā akomanga katoa kia hikina e rātou, kia waitohu rātou.

## 3. Pōhiritia tō rangatira mahi

[Tukuna tēnei īmēra](<%= resolve_url('/promote/resources#sample-emails') %>) ki tō pāhi, ki te kaiurungi rānei o tō pakihi.

## 4. Whakatairangatia te Hour of Code i tō hapori

[Kimihia he rōpū i tō hapoti](<%= resolve_url('/promote/resources#sample-emails') %>) - karapu tāpae tama/hine, whakapono, whare wānanga, kaumātua, uniana, ka mutu ō hoa. Ehara i te mea me noho ki tētahi kura ki te ako i ētahi pūkenga hou. Whakamahia ēnei [pānui whakaahua, haki, tukupiri, ataata, aha atu rānei](<%= resolve_url('/promote/resources') %>) mō tāu takunetanga.

## 5. Pōhiritia te kaitōrangapū ā-rohe ki te tautoko i te Hour of Code

[Tukuna tēnei īmēra](<%= resolve_url('/promote/resources#sample-emails') %>) ki ngā kaitōrangapū, ki te kaunihera, ki te pōari o te kura rānei ki te pōhiri i a rātou ki tō kura mō te Hour of Code. Mā tēnei ka tautoko i ngā mahi pūtaiao rorohiko i tō takiwā haere ake nei.

<%= view :signup_button %>