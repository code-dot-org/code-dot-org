<div class="resources-navigation">
	<div class="nav-header">How to guides</div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/how-to') %>"><%= hoc_s(:how_to_nav_educators)%></a></div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/how-to/how-to-public-officials') %>"><%= hoc_s(:how_to_nav_public_officials)%></a></div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/how-to/how-to-districts') %>"><%= hoc_s(:how_to_nav_districts)%></a></div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/how-to/how-to-events') %>"><%= hoc_s(:how_to_nav_assemblies)%></a></div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/how-to/how-to-organizations') %>"><%= hoc_s(:how_to_nav_organizations)%></a></div>
</div>

<%= view :resources_nav %>

<!--
  # Order should be educators, after school, parents, officials, districts, assemblies. Add in after school and parents
  # when these pages are ready
  - <a href="<%= resolve_url('/resources/how-to-after-school') %>"><%= hoc_s(:howto_nav_after_school)%></a>
  - <a href="<%= resolve_url('/resources/how-to-parents') %>"><%= hoc_s(:howto_nav_parents)%></a> 
-->
