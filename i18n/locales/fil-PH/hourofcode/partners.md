---
title: <%= hoc_s(:title_partners) %>
---
Ang Hour of Code is hinihimok ng Hour of Code and Computer Science Education Week Advisory at Review Committees.

Ang [Advisory Committee](%= resolve_url('/advisory-committee') %) ay binubuo ng mga kinakatawan mula sa K-12, academia, nonprofits, for-profits, at mga pang-internasyonal na mga organisasyon. Ang komiteng ito ay gumagabay ng diskarte para sa kampanya ng Hour of Code.

Ang [Review Committee](%= resolve_url('/review-committee') %) ay binubuo ng 15 mga tagapagturo sa buong K-12 grade na band na nag-a-assess at nagrerekomenda ng mga aktibidad gamit ang rubric ng Advisory Committee. Ang mga tagpagturong ito ay nagsusuri nga mga aktibidad na pinangungunahan ng mga estudyante at mga lesson plan na pinangungunahan ng mga guro na pinasa ng daan-daang mga kasosyo ng mga aktibidad, nagsusuri ng mga aktibidad na may halaga sa edukasyon, abilidad para makisali sa mga nag-aaral, at ang potensyal para iba't-ibang uri ng mga estudyante.

Ang dalawang trabahaho ng komite at dedikasyon ay isang kontribusyon sa tagumpay ng Hour of Code at pananaw nito na nag-aalok ng panimula sa computer science sa bawat estudyante.

<% if @country == 'la' %>

# Mga Kasosyo sa Latin America

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Mga Kasosyo sa Africa

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Mga Kasosyo sa Australia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Mga Kasosyo sa China

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Mga Kasosyo sa France

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Mga Kasosyo sa Indonesia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Mga Kasosyo sa Ireland

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Mga Kasosyo sa India

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Mga Kasosyo sa Japan

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Mga Kasosyo sa Netherlands

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Mga Kasosyo sa New Zealand

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Mga Kasosyo sa United Kingdom

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Mga Kasosyo sa Canada

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Mga Pangunahing Kasosyo at mga Tagasuporta sa Korporasyon

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# Mga Pangunahing Kasosyong Pang-promosyon

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# Mga Internasyonal na Kasosyo

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# Mga Kasosyo sa Aktibidad

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# Mga Kasosyo sa Imprastraktura at Mga Gamit

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# Karagdagang mga Kasosyo

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>