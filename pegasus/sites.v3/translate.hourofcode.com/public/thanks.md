---
title: Thanks for signing up to host an Hour of Code!
layout: wide
---

<script type="text/javascript" src="/js/crowdin-incontext.js"></script>
<script type="text/javascript" src="//cdn.crowdin.com/jipt/jipt.js"></script>

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

### crwdns19689:0crwdne19689:0

# crwdns19695:0crwdne19695:0

crwdns21413:0crwdne21413:0

## crwdns19698:0crwdne19698:0

crwdns23959:0crwdne23959:0

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## crwdns19700:0crwdne19700:0

crwdns23960:0crwdne23960:0

<% else %>

## crwdns19703:0crwdne19703:0

crwdns23961:0crwdne23961:0

<% end %>

## crwdns20720:0crwdne20720:0

crwdns23962:0crwdne23962:0 crwdns23963:0crwdne23963:0 crwdns23964:0crwdne23964:0

## crwdns20725:0crwdne20725:0

crwdns23965:0crwdne23965:0.

## crwdns20727:0crwdne20727:0

crwdns23966:0crwdne23966:0

## crwdns20729:0crwdne20729:0

crwdns23967:0crwdne23967:0 crwdns23968:0crwdne23968:0

<%= view 'popup_window.js' %>