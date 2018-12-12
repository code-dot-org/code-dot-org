---
title: <%= hoc_s(:title_partners).inspect %>
---
KoodiTund kampaaniat juhivad Hour of Code ja Computer Science Education Week nõuandvad ja järelvalve komiteed.

[Nõuandev komitee](%= resolve_url('/advisory-committee') %) liikmed on haridusasutuste, ülikoolide, mittetulundusorganisatsioonide, ettevõtete ja rahvusvaheliste organisatsioonide esindajad. See komitee juhib Hour of Code kampaania strateegiat.

[Järelvalve komitee](%= resolve_url('/review-committee') %) koosneb 15-st haridustöötajast, kes hindab ja soovitab tegevusi lähtuvalt nõustava komitee visioonist. Need haridustöötajad hindavad iseseisvaks õppimiseks mõeldud tegevusi ning õpetajate juhendeid, mille on koostanud sajad partnerid. Hinnatakse hariduslikku väärtust ning seda, kui paljudele erinevatele õpilastele tegevus huvi pakuks.

Mõlema komitee tegevus on kaasa aidanud Hour of Code edule ning eesmärgile pakkuda igale õpilasele võimalust õppida arvutiteadusi.

<% if @country == 'la' %>

# Ladina-Ameerika partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Aafrika partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Austraalia partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Hiina partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Prantsusmaa partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Indoneesia partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Iirimaa partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# India partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Jaapani partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Hollandi partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Uus-Meremaa partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Suurbritannia partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Kanada partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Peamised partnerid ja korporatiivtoetajad

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# Rahvusvahelised partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# Tunniplaani ja juhendite koostamise partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# Infrastruktuuri ja vahendite partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# Täiendavad partnerid

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>