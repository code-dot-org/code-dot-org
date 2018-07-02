---
title: <%= hoc_s(:title_partners) %>
---
Kod Saati, Kod Saatleri ve Bilgisayar Bilimleri Eğitim Haftası Danışma ve Değerlendirme Komiteleri tarafından yönetilmektedir.

[ Danışma Komitesi ](<%= resolve_url('/advisory-committee') %>), K-12, akademi, kar amacı gütmeyen kuruluşlar, kâr amacı gütmeyen kuruluşlar ve uluslararası kuruluşlardan temsilcilerden oluşmaktadır. Bu komite, Kodlama Saati kampanyası için stratejiyi yönlendirir.

[ Gözden Geçirme Komitesi ](<%= resolve_url('/review-committee') %>) Danışma Komitesi'nin değerlendirme tablosunu kullanarak faaliyetleri değerlendiren ve tavsiye eden K-12 sınıfındaki 15 eğitimciden oluşur. Bu eğitimciler, yüzlerce etkinlik ortağı tarafından sunulan öğrenci yönlendirmeli ve öğretmen yönlendirmeli ders planlarını gözden geçirirken etkinliklerin eğitimsel değerini, öğrencilerin ilgisini çekip çekmeyeceğini ve farklı öğrenci gruplarına hitap edip etmeyeceğini değerlendirir.

Her iki komitenin çalışmaları ve özveri, Kod Saatinin başarısı ve her öğrenci için bilgisayar bilimlerine bir giriş sunma vizyonuna katkıda bulunmuştur.

<% if @country == 'la' %>

# Latin Amerika Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Afrika Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Avustralya Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Çin Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Fransa Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Endonezya Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# İrlanda Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Hindistan Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Japon Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Hollanda Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Yeni Zelanda Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# İngiltere Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Kanada Ortakları

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

# Etkinlik Ortakları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# Altyapı ortakları ve araçları

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# Diğer Ortaklar

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>