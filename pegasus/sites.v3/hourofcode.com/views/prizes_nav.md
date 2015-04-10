<% if @country ==  'us' %>
- <a href="<%= hoc_uri('/prizes#dc') %>"><%= hoc_s(:prizes_nav_dc)%></a>
<br/>
<% end %>
<% if @country ==  'us' %>
- <a href="<%= hoc_uri('/prizes#hardware_prize') %>"><%= hoc_s(:prizes_nav_technology)%></a>
<br/>
<% end %>
<% if @country == 'uk' || @country ==  'us' || @country == 'ca' %>
- <a href="<%= hoc_uri('/prizes#video_chat') %>"><%= hoc_s(:prizes_nav_video_chat)%></a>
<br />
<% end %>
- <a href="<%= hoc_uri('/prizes#gift_code') %>"><%= hoc_s(:prizes_nav_skype_dropbox)%></a>
<br/>
<% if @country == 'ca' %>
- <a href="<%= hoc_uri('/prizes#brilliant_project') %>"><%= hoc_s(:prizes_nav_brilliant)%></a>
<br/>
- <a href="<%= hoc_uri('/prizes#actua_workshop') %>"><%= hoc_s(:prizes_nav_actua)%></a>
<br/>
- <a href="<%= hoc_uri('/prizes#kids_code') %>"><%= hoc_s(:prizes_nav_kids_code)%></a>
<br/>
<% end %>
- <a href="<%= hoc_uri('/prizes-terms') %>"><%= hoc_s(:prizes_nav_terms)%></a>
<br/>
<% if @country == 'us' %>
- <a href="<%= hoc_uri('/prizes#faq') %>"><%= hoc_s(:prizes_nav_faq)%></a>
<br/>
<% end %>