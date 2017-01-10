---

title: <%= hoc_s(:title_partners) %>

---

IHora loKufingqwa liqhutshwa iKomidi yoKweluleka noku Bhekisisa ye Hora loKufingqwa kanye neViki leMfundiso yeKhompyutha Sayensi.

I [Komidi yoKweluleka](<%= resolve_url('/advisory-committee') %>) yakhiwa abamele iK-12, ezemfundo, ezingenanzuzo, ezinenzuzo, kanye nezinhlangano eziphathelene nezizwe ezahlukene. Lekomiti ihola icebo lomkhankaso weHora loKufingqwa.

I [Komidi yoku Bhekisisa](<%= resolve_url('/review-committee') %>) yakhiwa ngothisha abayi 15 kuma zinga amabutho eK-12 ahlola aphinde ancome imisenzi esebenzisa imigomo yeKomiti yoKweluleka. Lothisha laba babhekisisa izifundiso eziholwa abafundi kanye nohlelo lokufunda oluholwa ngothisha afakwe ngamakhulu yabahlanganyele ngokwe mfundiso, bahlaziya ukubaluleka kwemfundiso yemisebenzi, ikhono lokubandakanya abafundi, kanye nesicelo esizoheha abafundi abahlukahlukene.

Umsebenzi kanye nokuzinikelela kwawo womabili lamakomiti kube nomthelela kumpumelelo yeHora loKufingqwa kanye nombono wayo wokunikezela ngokwazisa ikhompyutha sayensi kuwo wonke umfundi.

<% if @country == 'la' %>

# Latin America Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Africa Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Australia Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# China Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# France Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Indonesia Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Ireland Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# India Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Japan Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Netherlands Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# New Zealand Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# United Kingdom Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Canada Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Abahlanganyeli Abakhulu kanye nabaKhuthazi Bezinkampani

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

---

# Abakhulu bokukhuthaza abasebenzisana kubhizinisi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

---

# Abahlanganeli Bezizwe Ezihlikene

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

---

# Abahlanganyele Ngokwe Mfundiso

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# Ingqalasizinda yabahlanganyeli kanye namathulusi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# Abahlanganyeli Abangezelelwe

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>