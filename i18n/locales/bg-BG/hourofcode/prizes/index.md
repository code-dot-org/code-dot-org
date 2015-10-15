* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

<% if @country == 'la' %>

# Награди за всеки организатор

Всеки педагог, който е домакин на Час на кода събитие за ученици, получава 10 GB Dropbox пространство като подарък за благодарност!

<% else %>

# 2015 prizes

<% end %>

<% if @country == 'us' %>

## 51 schools will win a class-set of laptops (or $10,000 for other technology)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](%= resolve_url('/prizes/hardware-signup') %) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

## **Every** educator who organizes an Hour of Code event is eligible to receive a prize.

Check back for updates in fall 2015.

## More prizes coming soon!