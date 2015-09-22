<div style=" background-color: rgba(0,0,0,0.02); font-size: 16px; padding: 10px 0px;">
<div style="padding: 20px 0px 0px 25px;" >How to guides</div>
<ul>
<li><a href="<%= resolve_url('/resources/how-to') %>"><%= hoc_s(:how_to_nav_educators)%></a></li>
<li><a href="<%= resolve_url('/resources/how-to-public-officials') %>"><%= hoc_s(:how_to_nav_public_officials)%></a></li>
<li><a href="<%= resolve_url('/resources/how-to-districts') %>"><%= hoc_s(:how_to_nav_districts)%></a></li>
<li><a href="<%= resolve_url('/resources/how-to-events') %>"><%= hoc_s(:how_to_nav_assemblies)%></a></li>
<li><a href="<%= resolve_url('/resources/how-to-organizations') %>"><%= hoc_s(:how_to_nav_organizations)%></a></li>
</ul>
</div>

<%= view :resources_nav %>

<!--
  # Order should be educators, after school, parents, officials, districts, assemblies. Add in after school and parents
  # when these pages are ready
  - <a href="<%= resolve_url('/resources/how-to-after-school') %>"><%= hoc_s(:howto_nav_after_school)%></a>
  - <a href="<%= resolve_url('/resources/how-to-parents') %>"><%= hoc_s(:howto_nav_parents)%></a> 
-->
