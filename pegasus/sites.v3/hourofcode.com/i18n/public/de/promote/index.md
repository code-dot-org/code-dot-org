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

# Wie kann ich mich dafür einsetzen

## 1. Weitersagen

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Frage deine Schule eine Hour of Code anzubieten

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your principal and challenge every classroom at your school to sign up. <% if @country == 'us' %> One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. <% end %>

## 3. Frage deinen Arbeitgeber sich zu engagieren

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your manager or company's CEO.

## 4. Promote Hour of Code in your community

[Recruit a local group](<%= resolve_url('/promote/resources#sample-emails') %>)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. You don't have to be in school to learn new skills. Use these [posters, banners, stickers, videos and more](<%= resolve_url('/promote/resources') %>) for your own event.

## 5. Frage eine öffentliche Stelle ob sie die Hour of Code unterstützen möchte

[Send this email](<%= resolve_url('/promote/resources#sample-emails') %>) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. It can help build support for computer science in your area beyond one hour.