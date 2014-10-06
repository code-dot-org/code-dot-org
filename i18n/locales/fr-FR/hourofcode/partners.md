* * *

title: Partners

* * *

# Major Partners and Corporate Supporters

<%= view :about\_logos, logos:DB[:cdo\_partners].where(hourofcode\_b:true).and(kind\_s:'major') %>

* * *

# Hour of Code Promotional partners

<%= view :about\_logos, logos:DB[:cdo\_partners].where(hourofcode\_b:true).and(kind\_s:'promotional') %>

* * *

# Tutorial partners

<%= view :about\_logos, logos:DB[:cdo\_partners].where(hourofcode\_b:true).and(kind\_s:'tutorial') %>

* * *

# Additional partners

<%= view :about\_logos, logos:DB[:cdo\_partners].where(hourofcode\_b:true).and(kind\_s:'additional') %>