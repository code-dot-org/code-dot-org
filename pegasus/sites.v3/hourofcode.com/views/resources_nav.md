<% if @country == 'ie' %>
- <a href="<%= hoc_uri('/resources/how-to-ireland') %>">How to get started in Ireland</a>
<br/>
<% end %>
- <a href="<%= hoc_uri('/resources/how-to') %>"><%= hoc_s(:resources_how_to)%></a>
<br/>
<% if @country == 'us' %>
- <a href="<%= hoc_uri('/resources/how-to-events') %>"><%= hoc_s(:resources_how_to_events)%></a>
<br />
<% end %>
- <a href="<%= hoc_uri('/resources#handouts') %>"><%= hoc_s(:resources_handouts)%></a>
<br/>
- <a href="<%= hoc_uri('/resources#videos') %>"><%= hoc_s(:resources_videos)%></a>
<br/>
- <a href="<%= hoc_uri('/resources#posters') %>"><%= hoc_s(:resources_posters)%></a>
<br/>
- <a href="<%= hoc_uri('/resources#social') %>"><%= hoc_s(:resources_social)%></a>
<br/>
<% if @country != 'uk' %>
- <a href="<%= hoc_uri('/resources#banners') %>"><%= hoc_s(:resources_banners)%></a>
<br/>
<% end %>
- <a href="<%= hoc_uri('/resources#sample-emails') %>"><%= hoc_s(:resources_emails)%></a>
<br/>
<% if @country != 'uk' %>
- <a href="<%= hoc_uri('/resources/stats') %>"><%= hoc_s(:resources_stats)%></a>
<br />
<% end %>
- <a href="<%= hoc_uri('/resources/press-kit') %>"><%= hoc_s(:resources_press_kit)%></a>
<% if @country == 'us' %>
- <a href="<%= hoc_uri('/resources/how-to-districts') %>"><%= hoc_s(:resources_how_to_districts)%></a>
<br />
<% end %>
<% if @country == 'us' %>
- <a href="<%= hoc_uri('/resources/how-to-public-officials') %>"><%= hoc_s(:resources_how_to_officials)%></a>
<br />
<% end %>

