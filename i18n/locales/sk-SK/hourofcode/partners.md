---
title: <%= hoc_s(:title_partners) %>
---
Hodina Kódu je riadená Komisiou a poradným výborom Hodiny Kódu a Tyždňom výuky informatiky.

[Poradná komisia](%= resolve_url('/advisory-committee') %) sa skladá zo zástupcov základných a stredných škôl, neziskových organizácií, podnikov a medzinárodných organizácií. Tento výbor vedie stratégiu kampane Hodiny Kódu.

[Kontrolný výbor](%= resolve_url('/review-committee') %) sa skladá z 15 školiteľov zo základných a stredných škôl a hodnotí a odporúča aktivity s použitím pravidiel od Poradnej Komisie. Títo školitelia vyhodnocujú žiacke a učiteľské učebné plány navrhnuté stovkami partnerov aktivít, vyhodnocujú učebný prínos aktivít, schopnosť zapojiť študentov a potenciálnu schopnosť osloviť rôzne skupiny študentov.

Práca obidvoch komisií a ich obetavosť prispeli k úspechu Hodiny Kódu a jej vízie ponúkať úvod do informatiky pre každého študenta.

<% if @country == 'la' %>

# Partneri v Južnej Amerike

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Partneri v Afrike

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Partneri v Austrálií

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Partneri v Číne

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Partneri vo Francúzsku

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Partneri v Indonézii

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Partneri v Írsku

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Partneri v Indii

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Partneri v Japonsku

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Partneri v Holandsku

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Partneri na Novom Zélande

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Partneri v Spojenom Kráľovstve

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Partneri v Kanade

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Hlavní partneri a podporujúce spoločnosti

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# Hlavní reklamní partneri

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# Medzinárodní partneri

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# Partneri aktivít

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# Partneri infraštruktúry a nástrojov

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# Ďalší partneri

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>