---
title: <%= hoc_s(:title_partners).inspect %>
---
Kodetimen blir drive av Hour of Code og Computer Science Education Week sine rådgjevande og evaluerande komitear.

Den [rådgjevande komiteen](<%= resolve_url('/advisory-committee') %>) består av representantar fra grunnskulen, akademia, ideelle organisasjoner, selskap og internasjonale organisasjonar. Denne kommiteen rettleiar strategien for Kodetime-kampanjen.

Den [evaluerande komiteen](<%= resolve_url('/review-committee') %>) består av 15 lærarar frå barnehage til vidaregående som vurderer og anbefaler aktivitetar med bruk av den rådgivende komiteens rubrikk. Desse personane går gjennom dei elevguida aktivitetene og lærarguida timeplanane som er sendt inn frå hundrevis av aktivitetspartnarar som evalurerer den pedagogiske verdien av aktivitetene, oppgåva si evne til å engasjere elevar og potensielt nå fram til ulike sett av elevar.

Arbeidet og dedikasjonen i begge kommiteane har bidratt til suksessen Kodetimen og visjonen den har om å tilby ein introduksjon til datavitskap for kvar elev.

<% if @country == 'la' %>

# Partnarar i Latin-Amerika

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Partnarar i Afrika

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Partnarar i Australia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Partnarar i Kina

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Partnarar i Frankrike

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Partnarar i Indonesia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Partnarar i Irland

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Partnarar i India

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Partnarar i Japan

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Partnarar i Nederland

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Partnarar i New Zealand

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Partnarar i Storbrittania

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Partnarar i Canada

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Hovudpartnarar og bedrifter som støttar oss

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

---

# Internasjonale partnarar

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

---

# Partnarar for læreplan og opplæring

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# Partnarar for infrastruktur og verktøy

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# Øvrige samarbeidspartnarar

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>