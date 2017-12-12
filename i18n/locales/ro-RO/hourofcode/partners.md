---
title: <%= hoc_s(:title_partners) %>
---
Hour of Code este condus de catre comitetul Hour of code si Computer Science Education Week.

[Comitetul consultativ](%= resolve_url('/advisory-committee') %) este format din reprezentanţi ai K-12, mediul academic, non-profit, pentru-profit şi organizaţii internaţionale. Acest comitet ghideaza strategia pentru campania Hour of Code.

[Comitetul de revizuire](%= resolve_url('/review-committee') %) este format din 15 cadre didactice peste gradele K-12 care evaluează şi recomanda activităţi folosind rubrica de Comitetul consultativ. Aceste cadre didactice revizuiesc activitățile conduse de elevi şi planurile de lecţie conduse de profesor transmise de sute de parteneri, evaluând valoarea educativă a activităților, capacitatea de a capta cursanţii şi atractivitatea potenţială către diverse tipuri de studenţi.

Munca şi dedicarea ambelor comitete au contribuit la succesul Hour of Code şi la viziunea sa de a oferi o introducere în informatică pentru fiecare student.

<% if @country == 'la' %>

# Parteneri din America Latină

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Partenerii din Africa

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Parteneri din Australia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Partenerii din China

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Partenerii din Franta

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Parteneri din Indonesia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Partenerii din Irlanda

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Parteneri din India

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Parteneri din Japonia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Partenerii din Olanda

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Partenerii din Noua Zeelanda

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Parteneri din Marea Britanie

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Parteneri din Canada

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Sponsori majori si susținători Corporate

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# Parteneri promotionali importanți

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# Parteneri Internationali

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# Partneri de activitate

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# Parteneri de infrastructură şi instrumente

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# Alți parteneri

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>