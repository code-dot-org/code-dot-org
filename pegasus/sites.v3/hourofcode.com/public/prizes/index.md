---
title: <%= hoc_s(:title_prizes) %>
layout: wide
nav: prizes_nav
---

<%= view :signup_button %>

# 2015 prizes

[col-33]

<img src="/images/fill-275x225/prize1.jpg"/>

[/col-33]

[col-33]

<img src="/images/fill-275x225/prize3.png"/>

[/col-33]

[col-33]

<img src="/images/fill-275x225/prize4.png"/>

[/col-33]

<p style="clear:both">&nbsp;</p>

<% if @country == 'us' %>

## 51 schools will win a class-set of laptops (or $10,000 for other technology)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

<% if @country == 'la' %>

# Prizes for every organizer

Every educator who hosts an Hour of Code for students receives 10 GB of Dropbox space as a thank you gift!

<% end %>

## **Every** educator who organizes an Hour of Code event is eligible to receive a prize.

Check back for updates in fall 2015.


## More prizes coming soon!