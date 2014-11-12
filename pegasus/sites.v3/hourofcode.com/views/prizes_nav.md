<% if @country ==  'us' || @country == 'ca' %>
- <a href="<%= hoc_uri('/prizes#dc') %>">Trip to Washington D.C.</a>
<br/>
<% end %>
<% if @country ==  'us' %>
- <a href="<%= hoc_uri('/prizes#hardware_prize') %>">$10,000 hardware prize</a>
<br/>
<% end %>
<% if @country == 'uk' || @country ==  'us' || @country == 'ca' %>
- <a href="<%= hoc_uri('/prizes#video_chat') %>">Guest speaker video chat</a>
<br />
<% end %>
<% if @country ==  'us' %>
- <a href="<%= hoc_uri('/prizes#laptops') %>">$10,000 of laptops or other tech</a>
<br/>
<% end %>
- <a href="<%= hoc_uri('/resources#gift_codes') %>">Skype or Dropbox gift codes</a>
<br/>
<% if @country == 'ca' %>
- <a href="<%= hoc_uri('/prizes#brilliant_project') %>">$2,000 Brilliant Labs project</a>
<br/>
- <a href="<%= hoc_uri('/prizes#actua_workshop') %>">Actua workshop</a>
<br/>
- <a href="<%= hoc_uri('/prizes#kids_code') %>">Kids Code Jeunesse</a>
<br/>
<% end %>
- <a href="<%= hoc_uri('/prizes#more_questions') %>">More questions</a>
<br/>
<% if @country == 'us' %>
- <a href="<%= hoc_uri('/prizes#faq') %>">FAQ</a>
<br/>
<% end %>