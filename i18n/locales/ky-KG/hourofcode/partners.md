---
title: <%= hoc_s(:title_partners) %>
---
Код сааты долбоорун Код сааты жана Информатика аптасы сыяктуу кеңеш берүүчү жана текшерүүчү комитеттери түзгөн.

[Кеңеш берүүчү комитети](%= resolve_url('/advisory-committee') %) K-12 өкүлдөрүнөн, илимий мекемелерден, коммерциялык эмес жана коммерциялык уюмдардан жана эл аралык уюмдардан түзүлгөн. Бул комитет Код сааты өнөктөштүгүнүн стратегиясын аныктайт.

[Текшерүүчү комитетине](%= resolve_url('/review-committee') %) Кеңеш берүүчү комитетинин рубрикасы менен кошо тапшырмаларды баалап тастыктаган K-12 класстардын 15 окутуучусу кирет. Бул окутуучулар тапшырмалардын билим берүү баалуулугун, окуучуларды кызыктыра алгандыгын жана ар түрдүү окуучуларга потенциалдуу чакырык болуп бергендигин текшерип, окуучулар тарабынан аткарылган тапшырмаларды жана аткара турган жүздөгөн өнөктөрдүн окуу тартиптерин карап чыгышат.

Ушул эки коммитеттин ишмердүүлүгү жана берилгендиктери Код сааты долбоорунун өнүгүүсүнө жана ар бир окуучунун компүтер илими менен таанышуусуна бир кыйла пайда көрсөткөн.

<% if @country == 'la' %>

# Латын Америкасындагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Африкадагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Австралиядагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Кытайдагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Франциядагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Индонезиядагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Ирландиядагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Индиядагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Жапониядагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Нидерланддагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Жаңы Зеландиядагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Бириккен Королдугундагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Канададагы өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Башкы өнөктөр жан колдогон компаниялар

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# Башкы жарнама өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# Эл аралык өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# Тапшырмалар боюнча өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# Инфраструктура Өнөктөрүбүз жана Жабдуулар

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# Кошумча өнөктөрүбүз

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>