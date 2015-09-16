* * *

title: <%= hoc_s(:title_partners) %>

* * *

<%= view :signup_button %>

# اہم شراکت دار اور کارپوریٹ سپورٹرز

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# بڑے پروموشنل پارٹنرز

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# بین الاقوامی پارٹنرز

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# سبق کےشراکت دار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# بنیادی ڈھانچے کے شراکت داروں اور اوزار

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# اضافی پارٹنرز

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>