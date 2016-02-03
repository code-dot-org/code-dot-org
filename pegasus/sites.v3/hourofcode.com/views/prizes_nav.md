<% if @country ==  'us' %>
- <a href="<%= resolve_url('/prizes#dc') %>"><%= hoc_s(:prizes_nav_dc)%></a>
<br/>
<% end %>
<% if @country ==  'us' %>
- <a href="<%= resolve_url('/prizes#hardware_prize') %>"><%= hoc_s(:prizes_nav_technology)%></a>
<br/>
<% end %>
<% if @country == 'uk' || @country ==  'us' || @country == 'ca' %>
- <a href="<%= resolve_url('/prizes#video_chat') %>"><%= hoc_s(:prizes_nav_video_chat)%></a>
<br />
<% end %>
- <a href="<%= resolve_url('/prizes#gift_code') %>"><%= hoc_s(:prizes_nav_skype_dropbox)%></a>
<br/>
<% if @country == 'ca' %>
- <a href="<%= resolve_url('/prizes#brilliant_project') %>"><%= hoc_s(:prizes_nav_brilliant)%></a>
<br/>
- <a href="<%= resolve_url('/prizes#actua_workshop') %>"><%= hoc_s(:prizes_nav_actua)%></a>
<br/>
- <a href="<%= resolve_url('/prizes#kids_code') %>"><%= hoc_s(:prizes_nav_kids_code)%></a>
<br/>
<% end %>
- <a href="<%= resolve_url('/prizes-terms') %>"><%= hoc_s(:prizes_nav_terms)%></a>
<br/>
<% if @country == 'us' %>
- <a href="<%= resolve_url('/prizes#faq') %>"><%= hoc_s(:prizes_nav_faq)%></a>
<br/>
<% end %>