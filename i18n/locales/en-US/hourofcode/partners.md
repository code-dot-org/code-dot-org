* * *

crwdns45411:0crwdne45411:0<%= hoc_s(:title_partners) %>

* * *

<%= view :signup_button %>

<% if @country == 'la' %>

# crwdns48795:0crwdne48795:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'au' %>

# crwdns48796:0crwdne48796:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'uk' %>

# crwdns48797:0crwdne48797:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# crwdns50235:0crwdne50235:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# crwdns50236:0crwdne50236:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# crwdns50237:0crwdne50237:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# crwdns50238:0crwdne50238:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# crwdns50239:0crwdne50239:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# crwdns50240:0crwdne50240:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# crwdns50241:0crwdne50241:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>