<% if @country ==  'us' %>
- <a href="<%= hoc_uri('/prizes#dc') %>">crwdns35023:0crwdne35023:0</a>
<br/>
<% end %>
<% if @country ==  'us' %>
- <a href="<%= hoc_uri('/prizes#hardware_prize') %>">crwdns35024:0crwdne35024:0</a>
<br/>
<% end %>
<% if @country == 'uk' || @country ==  'us' || @country == 'ca' %>
- <a href="<%= hoc_uri('/prizes#video_chat') %>">crwdns35025:0crwdne35025:0</a>
<br />
<% end %>
- <a href="<%= hoc_uri('/prizes#gift_code') %>">crwdns35026:0crwdne35026:0</a>
<br/>
<% if @country == 'ca' %>
- <a href="<%= hoc_uri('/prizes#brilliant_project') %>">crwdns35027:0crwdne35027:0</a>
<br/>
- <a href="<%= hoc_uri('/prizes#actua_workshop') %>">crwdns35028:0crwdne35028:0</a>
<br/>
- <a href="<%= hoc_uri('/prizes#kids_code') %>">crwdns35029:0crwdne35029:0</a>
<br/>
<% end %>
- <a href="<%= hoc_uri('/prizes-terms') %>">crwdns35030:0crwdne35030:0</a>
<br/>
<% if @country == 'us' %>
- <a href="<%= hoc_uri('/prizes#faq') %>">crwdns35031:0crwdne35031:0</a>
<br/>
<% end %>