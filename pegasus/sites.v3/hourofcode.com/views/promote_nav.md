<div class="resources-navigation">
	<div class="nav-header">Promote</div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/promote#onepager') %>"><%= hoc_s(:resources_one_pager)%></a></div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/promote#brochure') %>"><%= hoc_s(:resources_brochure)%></a></div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/promote#videos') %>"><%= hoc_s(:resources_videos)%></a></div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/promote#posters') %>"><%= hoc_s(:resources_posters)%></a></div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/promote#banners') %>"><%= hoc_s(:resources_banners)%></a></div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/promote#stickers') %>"><%= hoc_s(:resources_stickers)%></a></div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/promote#sample-emails') %>"><%= hoc_s(:resources_emails)%></a></div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/promote/stats') %>"><%= hoc_s(:resources_stats)%></a></div>
	<div class="nav-item"><a class="nav-link" href="<%= resolve_url('/promote/press-kit') %>"><%= hoc_s(:resources_press_kit)%></a></div>
</div>

<%= view :resources_nav %>

<!-- 
# Include this when blurb about HoC logo is ready
- <a href="<%= resolve_url('/resources#logo') %>"><%= hoc_s(:resources_logo)%></a> 
-->
