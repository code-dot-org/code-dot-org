## Press Kit

For all press and media inquiries, contact [press@code.org](mailto:press@code.org)


## Corporate Donors

<%= view :about_people, people:DB[:cdo_donors].where(kind_s:'corporate') %>


## Major Donors

<%= view :about_people, people:DB[:cdo_donors].where(kind_s:'founder') %>


## Major Partners

<%= view :about_people, people:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'major') %>

## Promotional Partners

<%= view :about_people, people:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'promotional') %>

## Tutorial Partners

<%= view :about_people, people:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'tutorial') %>

## All Other Partners

<%= view :about_people, people:DB[:cdo_partners].where(codeorg_b:true).and(kind_s:'additional') %>
