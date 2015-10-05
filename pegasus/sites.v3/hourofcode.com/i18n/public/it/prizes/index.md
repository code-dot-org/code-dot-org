---

title: <%= hoc_s(:title_prizes) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

<% if @country == 'la' %>

# Premi per ogni organizzatore

Ogni educatore che ospita un'Ora del Codice per studenti riceve 10 GB di spazio su Dropbox come ringraziamento!

<% else %>

# Premi 2015

<% end %>

<% if @country == 'us' %>

## 51 scuole vinceranno un set di computer portatili per classi (o $10.000 per altre tecnologie)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

## **Ogni** educatore che organizza un evento Ora del Codice potrebbe ricevere un premio.

Controlla gli aggiornamenti nell'autunno 2015.

## Più premi prossimamente!