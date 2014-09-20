---
title: What's wrong with this picture?
social:
  "og:title": "What's wrong with this picture?"
  "og:description": "The difference between the opportunity vs. today's reality is astounding."
  "og:image": "http://code.org/images/cs-stats/more-jobs-than-students.png"
  "og:image:width": 888
  "og:image:height": 511
  "og:video": ""
  "og:video:width": ""
  "og:video:height": ""
  "og:video:type": ""
---
<% facebook = {:u=>'http://code.org/stats'} %>
<% twitter = {:url=>'http://code.org/stats', :related=>'codeorg', :hashtags=>'CODE', :text=>'What is wrong with this picture? @codeorg'} %>

[row]

[col-xs-9]

# What's wrong with this picture?

<%= view 'share_buttons', facebook:facebook, twitter:twitter %>

<br style="clear: both;">

<img src="/images/fit-7200/Code.org_infographic.png" style="width: 720px; max-width: 720px" />

<%= view 'share_buttons', facebook:facebook, twitter:twitter %>

<br style="clear: both;">

[See source data for this infographic](https://docs.google.com/document/d/1gySkItxiJn_vwb8HIIKNXqen184mRtzDX12cux0ZgZk/pub)

[/col-xs-9]

[col-xs-3]

<%# TODO? view 'advocate_locally' %>
<%# TODO view 'index_twitter' %>

[/col-xs-3]

[/row]



<%= view 'popup_window.js' %>
