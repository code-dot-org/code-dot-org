<div style="background-color: rgba(0,0,0,0.02); font-size: 16px; padding: 10px 0px;">
<ul>
<li><a href="<%= resolve_url('/promote#onepager') %>"><%= hoc_s(:resources_one_pager)%></a></li>
<li><a href="<%= resolve_url('/promote#brochure') %>"><%= hoc_s(:resources_brochure)%></a></li>
<li><a href="<%= resolve_url('/promote#videos') %>"><%= hoc_s(:resources_videos)%></a></li>
<li><a href="<%= resolve_url('/promote#posters') %>"><%= hoc_s(:resources_posters)%></a></li>
<li><a href="<%= resolve_url('/promote#banners') %>"><%= hoc_s(:resources_banners)%></a></li>
<li><a href="<%= resolve_url('/promote#stickers') %>"><%= hoc_s(:resources_stickers)%></a></li>
<li><a href="<%= resolve_url('/promote#sample-emails') %>"><%= hoc_s(:resources_emails)%></a></li>
<li><a href="<%= resolve_url('/promote/stats') %>"><%= hoc_s(:resources_stats)%></a></li>
<li><a href="<%= resolve_url('/promote/press-kit') %>"><%= hoc_s(:resources_press_kit)%></a></li>
</ul>
</div>

<%= view :resources_nav %>

<!-- 
# Include this when blurb about HoC logo is ready
- <a href="<%= resolve_url('/resources#logo') %>"><%= hoc_s(:resources_logo)%></a> 
-->
