---
title: <%= hoc_s(:title_partners) %>
---

The Hour of Code is driven by the Hour of Code and Computer Science Education Week Advisory and Review Committees. Representatives from K-12, academia, nonprofits, for-profits, and international organizations compose the [Advisory Committee](<%= resolve_url('/advisory-committee') %>) that has guided the strategy of the Hour of Code campaign.

The [Review Committee](<%= resolve_url('/review-committee') %>) is composed of 15 educators across K-12 grade bands teamed up to assess and recommend activities using the Advisory Committee's rubric. These educators reviewed student-led tutorials and teacher-led lesson plans submitted by hundreds of tutorial partners, evaluating these activities on metrics such as their educational value, fun and engagement, and appeal to a diverse set of students.

Both committees' work and dedication has contributed to the success of the Hour of Code and its goal that any student of any age can try an introduction to computer science.

<% if @country == 'la' %>

# Latin America Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Africa Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Australia Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# China Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# France Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Indonesia Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Ireland Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# India Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Japan Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Netherlands Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# New Zealand Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# United Kingdom Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Canada Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

#  Major Partners and Corporate Supporters

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

<HR>


# Major Promotional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

<HR>

# International Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

<HR>

# Tutorial Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

<HR>

# Infrastructure partners and tools

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

<HR>

# Additional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>
