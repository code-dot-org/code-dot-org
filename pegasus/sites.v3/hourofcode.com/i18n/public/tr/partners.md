---
title: <%= hoc_s(:title_partners) %>
---
Kod Saati, Kod Saatleri ve Bilgisayar Bilimleri Eğitim Haftası Danışma ve Değerlendirme Komiteleri tarafından yönetilmektedir.

[ Danışma Komitesi ](<%= resolve_url('/advisory-committee') %>), K-12, akademi, kar amacı gütmeyen kuruluşlar, kâr amacı gütmeyen kuruluşlar ve uluslararası kuruluşlardan temsilcilerden oluşmaktadır. Bu komite, Kodlama Saati kampanyası için stratejiyi yönlendirir.

[ Gözden Geçirme Komitesi ](<%= resolve_url('/review-committee') %>) Danışma Komitesi'nin değerlendirme tablosunu kullanarak faaliyetleri değerlendiren ve tavsiye eden K-12 sınıfındaki 15 eğitimciden oluşur. These educators review student-led activities and teacher-led lesson plans submitted by hundreds of activity partners, evaluating the activities' educational value, ability to engage learners, and potential appeal to diverse sets of students.

Her iki komitenin çalışmaları ve özveri, Kod Saatinin başarısı ve her öğrenci için bilgisayar bilimlerine bir giriş sunma vizyonuna katkıda bulunmuştur.

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

# Majör Ortaklar ve Kurumsal Destekleyenler

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

---

# Majör Promosyon Ortaklarımız

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

---

# Uluslararası Ortaklarımız

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

---

# Activity Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# Infrastructure Partners and Tools

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# Diğer Ortaklar

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>