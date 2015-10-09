* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

<% if @country == 'la' %>

# Shpërblim për secilin organizator

Çdo mësues që organizon një Orë Kodimi për studentët fiton 10 GB hapësirë në Dropbox si dhuratë falenderimi!

<% else %>

# Shpërblimet 2015

<% end %>

<% if @country == 'us' %>

## 51 shkolla fituan një set me laptop (ose $10,000 për teknologji të tjera)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](%= resolve_url('/prizes/hardware-signup') %) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

## **Çdo** mësues që organizon një Orë Kodimi ka të drejtë të marrë një shpërblim.

Shiko për përditësime në vjeshtë 2015.

## Më shumë shpërblime vinë së shpejti!