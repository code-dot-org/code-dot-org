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

# Come partecipare

## 1. Iscriviti per organizzare un'Ora del Codice

Chiunque, in ogni parte del mondo, può organizzare un'Ora del Codice. [ Iscriviti](<%= resolve_url('/') %>) per ricevere aggiornamenti e qualificarti per i premi.   


[<button><%= hoc_s(:signup_your_event) %></button>](<%= resolve_url('/') %>)

## 2. Spargi la voce

Parla ai tuoi amici di **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 3. Chiedi alla tua scuola di organizzare un'Ora del Codice

[Invia questo messaggio di posta elettronica](<%= resolve_url('/promote/resources#sample-emails') %>) al Dirigente Scolastico della tua scuola e invita ogni classe ad iscriversi. <% if @country == 'us' %> One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners). <% end %>

## 4. Chiedi al tuo datore di lavoro di partecipare

[Invia questo messaggio di posta elettronica](<%= resolve_url('/promote/resources#sample-emails') %>) al tuo responsabile, o all'Amministratore Delegato della tua azienda.

## 5. Promuovi l'Ora del Codice fra i tuoi conoscenti

[ Recluta un po' di persone](<%= resolve_url('/promote/resources#sample-emails') %>) — tra i boy-scout, in parrocchia, all'università, tra gli esperti, al sindacato o tra i tuoi amici. Non c'è bisogno di stare a scuola per acquisire nuove competenze. Utilizza questi [poster, banner, adesivi, video e altro](<%= resolve_url('/promote/resources') %>) per il tuo evento.

## 6. Proponi ad un rappresentante eletto di sostenere L'Ora del Codice

[Invia questo messaggio di posta elettronica](<%= resolve_url('/promote/resources#sample-emails') %>) agli Amministratori Locali, al Consiglio Comunale o al Consiglio Scolastico per invitarli a visitare la tua scuola. Può aiutare a costruire un supporto per l'informatica nella tua zona che va oltre un ora.

