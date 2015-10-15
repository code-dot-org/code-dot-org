---

title: <%= hoc_s(:title_prizes) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

<% if @country == 'la' %>

# 各主催者に送られる粗品

Hour of Codeを主催していただいた方には 10 GB の Dropbox ストレージを提供します。

<% else %>

# 2015年の賞品

<% end %>

<% if @country == 'us' %>

## 51 schools will win a class-set of laptops (or $10,000 for other technology)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

## Hour of Code のイベントを開催する **すべて** の教育関係者に受賞資格があります。

Check back for updates in fall 2015.

## 今後さらに多くの賞品を追加予定です。