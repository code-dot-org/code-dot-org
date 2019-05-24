---
title: <%= hoc_s(:title_partners).inspect %>
---
Hour of Codeは、Hour of Codeおよびコンピューターサイエンス教育週間の諮問委員会および審査委員会により推進されています。

[諮問委員会](<%= resolve_url('/advisory-committee') %>)は、K-12、学界、非営利団体、営利目的団体、および国際機関からの代表者で構成されています。 この委員会はHour of Codeのキャンペーン戦略に影響を与えます。

[審査委員会](<%= resolve_url('/review-committee') %>)はK-12グレードバンドに渡る15人の教育者で構成され、諮問委員会の規程を使用して活動を評価し推奨します。 これらの教育者たちは、アクティビティーパートナーから提出される何百もの学生主導のアクティビティーや先生主導のレッスンプランをレビューし、アクティビティーの教育的価値や学習者を引き込む能力、多様な生徒たちへの潜在的な魅力を評価します。

この2つの委員会の献身的な働きは、Hour of Codeの成功と、すべての生徒にコンピューターサイエンス入門を提供するというビジョンを支えています。

<% if @country == 'la' %>

# ラテンアメリカのパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# アフリカのパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# オーストラリアのパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# 中国のパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# フランスのパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# インドネシアのパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# アイルランドのパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# インドのパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# 日本のパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# オランダのパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# ニュージーランドのパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# イギリスのパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# カナダのパートナー

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# 主要なパートナーおよび協賛企業

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

---

# International Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

---

# Curriculum and Tutorial Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# Infrastructure Partners and Tools

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# Additional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>