---
title: <%= hoc_s(:title_partners) %>
---
Godziną Kodowania kieruje Komitet Doradczo-Odwoławczy inicjatyw Godzina Kodowania i Tydzień Edukacji Informatycznej.

[Komitet Doradczy](<%= resolve_url('/advisory-committee') %>) składa się z przedstawicieli ze szkół K-12, środowisk akademickich, organizacji non-profit, organizacji komercyjnych i organizacji międzynarodowych. Komitet ten kieruje strategią dotyczącą kampanii Godzina Kodowania.

[ Komitet ds. Oceny ](<%= resolve_url('/review-committee') %>) składa się z 15 edukatorów z różnych poziomów K-12, oceniających i rekomendujących działania przy użyciu tabeli Komitetu Doradczego. Ci edukatorzy sprawdzają samouczki dla uczniów i scenariusze lekcji dla nauczycieli nadsyłane przez setki partnerów, oceniając edukacyjną wartość działań, zdolność angażowania uczniów i potencjalne odwołania do różnych grup uczniów.

Zarówno praca, jak i zaangażowanie obu komitetów przyczyniły się do sukcesu Godziny Kodowania i wizji tej inicjatywy proponującej każdemu uczniowi wprowadzenia do informatyki.

<% if @country == 'la' %>

# Partnerzy z Ameryki Łacińskiej

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Partnerzy z Afryki

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Partnerzy z Australii

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Partnerzy z Chin

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Partnerzy z Francji

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Partnerzy z Indonezji

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Partnerzy z Irlandii

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Partnerzy z Indii

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Partnerzy z Japonii

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Partnerzy z Holandii

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Partnerzy z Nowej Zelandii

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Partnerzy z Wielkiej Brytanii

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Partnerzy z Kanady

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Główni Partnerzy oraz Korporacje Wspierające

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

---

# Główni Partnerzy Promocyjni

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

---

# Partnerzy Międzynarodowi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

---

# Partnerzy Aktywności

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# Partnerzy Infrastruktury i Narzędzi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# Pozostali Partnerzy

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>