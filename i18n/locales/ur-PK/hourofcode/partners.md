---
title: <%= hoc_s(:title_partners) %>
---
کوڈ کا قیام کوڈ آفس اور کمپیوٹر سائنس تعلیم ہفتہ مشاورتی اور جائزہ لینے والے کمیٹیوں کے ذریعہ چلایا جاتا ہے.

[ مشاورتی کمیٹی ](٪= resolve_url('/advisory-committe') ٪) کے مطابق 12 -12، اکیڈمی، غیر منافع بخش، منافع اور بین الاقوامی تنظیموں کے نمائندوں پر مشتمل ہے. یہ کمیٹی کوڈ آفس کی مہم کے لئے حکمت عملی کی ہدایت کرتا ہے.

<a href="٪= resolve_url('/ جائزہ ملاحظہ کریں')٪ "جائزہ لینے کی کمیٹی </a> K-12 گریڈ بینڈ کے 15 تعلیم دہندگان پر مشتمل ہے جو مشاورت کمیٹی کے روک کا استعمال کرتے ہوئے سرگرمیوں کا جائزہ لینے اور سفارش کرتی ہے. یہ محققین طالب علم کی قیادت کی سرگرمیوں اور سینکڑوں سرگرمی شراکت داروں کی جانب سے جمع کردہ طالب علموں کی قیادت کی منصوبہ بندی کا مطالعہ کرتے ہیں، سرگرمیوں کی 'تعلیمی قیمت، سیکھنے والوں کو مشغول کرنے کی صلاحیت، اور طالب علموں کے متنوع سیٹوں پر ممکنہ اپیل کی تشخیص کرتے ہیں.

کمیٹریشن کی کامیابی اور ہر طالب علم کے لئے کمپیوٹر سائنس کے تعارف پیش کرنے کے اس نقطہ نظر میں دونوں کمیٹیوں کے کام اور وقفے نے حصہ لیا.

<% if @country == 'la' %>

# لاطینی امریکہ کے شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# افریقہ شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# آسٹریلیا کے شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# چین شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# فرانس شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# انڈونیشیا پارٹنر

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# آئر لینڈ کے شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# بھارت شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# جاپان کے شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# ہالینڈ شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# نیوزی لینڈ کے شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# برطانیہ شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# کینیڈا کے شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# بڑے شراکت دار اور کارپوریٹ معاونین

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# بڑے پروموشنل شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# بین الاقوامی شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# سرگرمی شراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# انفراسٹرکچر شراکت داروں اور اوزار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# Additional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>