---
title: <%= hoc_s(:title_partners) %>
---
L'Ora del Codice è un progetto curato da Hour of Code, dal Comitato Consultivo della "Computer Science Education Week" e dal Comitato di Revisione.

Il [Comitato Consultivo](<%= resolve_url('/advisory-committee') %>) è composto da rappresentanti delle scuole dell'obbligo, del mondo accademico, delle organizzazioni no-profit, del commercio e delle organizzazioni internazionali. Questo comitato propone e guida la campagna "Ora del Codice".

Il [Comitato di revisione](<%= resolve_url('/review-committee') %>) è composto da 15 insegnanti della scuola dell'obbligo in grado di valutare e consigliare attività secondo le linee guida del Comitato Consultivo. Questi educatori valutano le attività autogestite dagli studenti ed i programmi delle lezioni condotte dagli insegnanti inseriti da centinaia di partner, valutandone il valore educativo, la capacità di coinvolgere gli studenti e l'attrattiva per differenti fasce di età.

Il lavoro e la dedizione dei Comitati hanno contribuito al successo dell'Ora del Codice, offrendo un'introduzione all'informatica per ogni studente.

<% if @country == 'la' %>

# Partner Latino Americani

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Partner Africani

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Partner Australiani

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Partner Cinesi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Partner Francesi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Partner Indonesiani

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Partner Irlandesi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Partner Indiani

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Partner Giapponesi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Partner Olandesi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Partner Neo Zelandesi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Partner Inglesi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Partner Canadesi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Principali Partner e Aziende Sostenitrici

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

---

# Principali Partner Promozionali

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

---

# Partner Internazionali

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

---

# Partner per le esercitazioni

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# Partner di supporto all'infrastruttura

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# Partner Aggiuntivi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>