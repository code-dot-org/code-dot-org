---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
social:
'og:title': '<%= hoc_s(:meta_tag_og_title) %>'
'og:description': '<%= hoc_s(:meta_tag_og_description) %>'
'og:image': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'og:image:width': 1705
'og:image:height': 949
'og:url': 'http://<%=request.host%>'
'og:video': 'https://youtube.googleapis.com/v/rH7AjDMz_dc'
'twitter:card': player
'twitter:site': '@codeorg'
'twitter:url': 'http://<%=request.host%>'
'twitter:title': '<%= hoc_s(:meta_tag_twitter_title) %>'
'twitter:description': '<%= hoc_s(:meta_tag_twitter_description) %>'
'twitter:image:src': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'twitter:player': 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0'
'twitter:player:width': 1920
'twitter:player:height': 1080
---

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

<%= view :signup_button %>

# მადლობა კოდის საათზე დარეგისტრირებისთვის!

თქვენ შესაძლოს ხდით მოსწავლეებისთვის მთელს მსოფლიოში კოდის საათში ჩართვას, რასაც შეუძლია *მათი დარჩენილი ცხოვრების შეცვლა*, დეკემბრის განმავლობაში <%= campaign_date('full') %>.

პრიზების, ახალი ტუტორიალებისა და სხვა საინტერესო სიახლეების შესახებ ყოველთვის შეგატყობინებთ. გაინტერესებთ, ახლა რა შეიძლება, გააკეთოთ?

## 1. Sign up to host

Anyone, anywhere can host an Hour of Code. [Sign up](<%= resolve_url('/') %>) to recieve updates and qualify for prizes.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Spread the word

მოუყევით თქვენს მეგობრებს #HourOfCode-ის შესახებ.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Ask your whole school to offer an Hour of Code

[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your principal to encourage every classroom at your school to sign up.

## 4. Ask your employer to get involved

[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your manager or the CEO.

## 5. Promote Hour of Code within your community

[Recruit a local group](<%= resolve_url('/resources/promote#sample-emails') %>)— boy/girl scouts club, church, university, veterans group or labor union. ან ჩაატარეთ კოდის საათის "ბლოკის წვეულება" თქვენს მიდამოში.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](<%= resolve_url('/resources/promote#sample-emails') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>

<%= view :signup_button %>