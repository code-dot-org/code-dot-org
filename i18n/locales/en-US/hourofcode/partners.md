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

<% if @country == 'uk' %>

# crwdns50967:0crwdne50967:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# crwdns50968:0crwdne50968:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# crwdns50969:0crwdne50969:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# crwdns50970:0crwdne50970:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# crwdns50971:0crwdne50971:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# crwdns50972:0crwdne50972:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# crwdns50973:0crwdne50973:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# crwdns50974:0crwdne50974:0

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>