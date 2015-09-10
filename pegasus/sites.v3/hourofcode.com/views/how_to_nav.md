<% if @country ==  'us' %>
- <a href="<%= hoc_uri('/resources/how-to') %>"><%= hoc_s(:for_educators)%></a>
<br/>
- <a href="<%= hoc_uri('/resources/how-to-after-school') %>"><%= hoc_s(:for_after_school)%></a>
<br />
- <a href="<%= hoc_uri('/resources/how-to-parents') %>"><%= hoc_s(:for_parents)%></a>
<br />
- <a href="<%= hoc_uri('/resources/how-to-public-officials') %>"><%= hoc_s(:for_public_officials)%></a>
<br />
- <a href="<%= hoc_uri('/resources/how-to-districts') %>"><%= hoc_s(:for_districts)%></a>
<br />
- <a href="<%= hoc_uri('/resources/how-to-events') %>"><%= hoc_s(:for_school_assemblies)%></a>
<br />
<% end %>
