---
title: <%= hoc_s(:title_partners) %>
---
Kodetimen er drevet av Hour of Code og Computer Science Education Week sine rådgivende og evaluerende komiteer.

Den [rådgivende komiteen](%= resolve_url('/advisory-committee') %) består av representanter fra K-12(barnehage gjennom vidregående), akademia, forprofitter, motprofitter og internasjonale organisasjoner. Denne kommiteen veileder strategen for Kodetime kampanjen.

Den [evaluerende komiteen](%= resolve_url('/review-committee') %) består av 15 lærere fra barnehage gjennom videregående som vurderer og anbefaler aktiviteter med bruk av den rådgivende komiteens rubrikk. Lærerne ser gjennom student-lede aktiviteter og lærer-lede timeplaner innsendt av hundrevis av aktivitet-partnere, de evaluerer aktivitetenes pedagogisk verdi, dens evne til å engasjere elever, og potensielt appellere til ulike sett av studenter.

Begge komiteens arbeid og dedikasjon har bidratt til suksessen av Kodetimen og dens visjon om å tilby en introduksjon til informatikk for hver student.

<% if @country == 'la' %>

# Latin-Amerika partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Afrika partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Australia partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Kina partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Frankrike partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Indonesia partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Irland partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# India partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Japan partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Nederland partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# New Zealand partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Storbritannia partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Canada partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Store partnere og støttene bedrifter

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# Store markedsføringspartnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# Internasjonale partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# Aktivitets partnere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# Infrastrukturpartnere og verktøy

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# Andre bidragsytere

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>