* * *

crwdns45411:0crwdne45411:0<%= hoc_s(:title_partners) %>

* * *

<%= view :signup_button %>

<% if @country == 'la' %>

# crwdns48795:0crwdne48795:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# crwdns50962:0crwdne50962:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# crwdns50963:0crwdne50963:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'id' %>

# crwdns50964:0crwdne50964:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'in' %>

# crwdns50965:0crwdne50965:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# crwdns50966:0crwdne50966:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nz' %>

# crwdns50979:0crwdne50979:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# crwdns50980:0crwdne50980:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# crwdns50981:0crwdne50981:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# crwdns50982:0crwdne50982:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# crwdns50983:0crwdne50983:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# crwdns50984:0crwdne50984:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# crwdns50985:0crwdne50985:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# crwdns50986:0crwdne50986:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# crwdns50987:0crwdne50987:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>