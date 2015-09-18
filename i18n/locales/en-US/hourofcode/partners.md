* * *

crwdns45411:0crwdne45411:0<%= hoc_s(:title_partners) %>

* * *

<%= view :signup_button %>

# crwdns43844:0crwdne43844:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# crwdns43845:0crwdne43845:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# crwdns43846:0crwdne43846:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# crwdns43847:0crwdne43847:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# crwdns43848:0crwdne43848:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# crwdns43849:0crwdne43849:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>