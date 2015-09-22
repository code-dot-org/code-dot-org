<div style="padding: 20px 0px 0px 25px;" >How to guides</div>
- <a href="<%= resolve_url('/resources/how-to') %>"><%= hoc_s(:how_to_nav_educators)%></a>
- <a href="<%= resolve_url('/resources/how-to-public-officials') %>"><%= hoc_s(:how_to_nav_public_officials)%></a>
- <a href="<%= resolve_url('/resources/how-to-districts') %>"><%= hoc_s(:how_to_nav_districts)%></a>
- <a href="<%= resolve_url('/resources/how-to-events') %>"><%= hoc_s(:how_to_nav_assemblies)%></a>
- <a href="<%= resolve_url('/resources/how-to-organizations') %>"><%= hoc_s(:how_to_nav_organizations)%></a>

<%= view :resources_nav %>

<!-- 
# Order should be educators, after school, parents, officials, districts, assemblies. Add in after school and parents
# when these pages are ready
- <a href="<%= resolve_url('/resources/how-to-after-school') %>"><%= hoc_s(:howto_nav_after_school)%></a>
- <a href="<%= resolve_url('/resources/how-to-parents') %>"><%= hoc_s(:howto_nav_parents)%></a> 
-->
