* * *

title: <%= hoc_s(:title_how_to_promote) %> layout: wide nav: promote_nav

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#OradelCodice' %>

# Come partecipare

## 1. Diffondi la notizia

Parla ai tuoi amici di **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Chiedi alla tua scuola di organizzare un'Ora del Codice

[Invia questo messaggio di posta elettronica](%= resolve_url('/promote/resources#sample-emails') %) al Dirigente Scolastico della tua scuola e invita ogni classe ad iscriversi. <% if @country == 'us' %> One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. <% end %>

## 3. Proponi al tuo datore di lavoro di coinvolgere la tua organizzazione

[Invia questo messaggio di posta elettronica](%= resolve_url('/promote/resources#sample-emails') %) al tuo responsabile, o all'Amministratore Delegato della tua azienda.

## 4. Promuovi l'Ora di Codice fra i tuoi conoscenti

[ Recluta un po' di persone](%= resolve_url('/promote/resources#sample-emails') %) — tra i boy-scout, in parrocchia, all'università, tra gli esperti, al sindacato o tra i tuoi amici. Non c'è bisogno di stare a scuola per acquisire nuove competenze. Utilizza questi [poster, banner, adesivi, video e altro](%= resolve_url('/promote/resources') %) per il tuo evento.

## 5. Proponi ad un amministratore locale di sostenere L'Ora del Codice

[Invia questo messaggio di posta elettronica](%= resolve_url('/promote/resources#sample-emails') %) agli Amministratori Locali, al Consiglio Comunale o al Consiglio Scolastico per invitarli a visitare la tua scuola. Può aiutare a costruire un supporto per l'informatica nella tua zona che va oltre un ora.