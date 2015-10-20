* * *

title: <%= hoc_s(:title_how_to_promote) %> layout: wide nav: promote_nav

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Comment s'impliquer ?

## 1. Sign up to host an Hour of Code

Anyone, anywhere can host an Hour of Code. [Sign up](%= resolve_url('/') %) to receive updates and qualify for prizes.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Spread the word

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Ask your whole school to offer an Hour of Code

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your principal and challenge every classroom at your school to sign up. Pour cela, c'est simple ! [Inscrivez-vous ici](%= resolve_url('/prizes/hardware-signup') %) pour être admissibles. <% end %>

## 4. Demandez à votre employeur de s'impliquer

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your manager or company's CEO.

## 5. Promote Hour of Code in your community

[Recruit a local group](%= resolve_url('/promote/resources#sample-emails') %)— boy/girl scouts club, church, university, veterans group, labor union, or even some friends. Pas besoin d'être à l'école pour apprendre de nouvelles compétences. Use these [posters, banners, stickers, videos and more](%= resolve_url('/promote/resources') %) for your own event.

## 6. Demandez à un élu local d'appuyer l'heure de Code

[Send this email](%= resolve_url('/promote/resources#sample-emails') %) to your local representatives, city council, or school board and invite them to visit your school for the Hour of Code. Ça pourrait aider à agrandir le groupe des amoureux d'informatique de votre région au-delà du projet d'une heure.

<%= view :signup_button %>