* * *

title: Samarbeidsparnarar

* * *

# Store samarbeidspartnarar og bedrifter som støttar oss

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# Kodetimens samarbeidspartnerar for marknadsføring

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# Samarbeidspartnarar for leksjonar

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# Øvrige samarbeidspartnarar

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>