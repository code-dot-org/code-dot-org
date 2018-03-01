---
title: <%= hoc_s(:title_partners) %>
---
一小時玩程式活動是由一小時玩程式與計算機科學教育諮詢與審查委員會所推動。

[諮詢委員會](<%= resolve_url('/advisory-committee') %>) 是由 K-12、 學術界、 非營利組織、 利潤，為和國際組織的代表組成。 這個委員會是一小時玩程式的指導單位。

這個[審查委員會](<%= resolve_url('/review-committee') %>)是由來自 K-12 年級的 15 名教育工作者所組成的，他們使用諮詢委員會的標準來評估和建議所有活動。 這些教育工作者審查由數以百計的活動夥伴提交的學生主導的活動和由教師領導的課程計劃, 評估活動的教育價值、參與學習的能力以及對不同的學生的潛在吸引力。

這二個委員會所做的工作與貢獻讓一小時玩程式活動得以成功，同時提供了每個學生認識計算機科學的機會。

<% if @country == 'la' %>

# 拉丁美洲合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# 非洲合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# 澳大利亞合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# 中國合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# 法國合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# 印度尼西亞合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# 愛爾蘭合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# 印度合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# 日本合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# 荷蘭合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# 新西蘭合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# 英國的合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# 加拿大合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# 主要合作夥伴和企業的贊助者

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

---

# 宣傳的主要夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

---

# 國際夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

---

# 活動合作夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# 基礎設施合作夥伴和工具

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# 更多的夥伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>