<% if @country ==  'us' %>
- <a href="<%= hoc_uri('/prizes#dc') %>">Mystery trip to Washington D.C.</a>
<br/>
<% end %>
<% if @country ==  'us' %>
- <a href="<%= hoc_uri('/prizes#hardware_prize') %>">$10,000 of technology for your school</a>
<br/>
<% end %>
<% if @country == 'uk' || @country ==  'us' || @country == 'ca' %>
- <a href="<%= hoc_uri('/prizes#video_chat') %>">Video chat with a tech titan</a>
<br />
<% end %>
- <a href="<%= hoc_uri('/prizes#gift_code') %>">Skype credit or Dropbox space for every organizer</a>
<br/>
<% if @country == 'ca' %>
- <a href="<%= hoc_uri('/prizes#brilliant_project') %>">$2,000 Brilliant Labs project</a>
<br/>
- <a href="<%= hoc_uri('/prizes#actua_workshop') %>">Actua workshop</a>
<br/>
- <a href="<%= hoc_uri('/prizes#kids_code') %>">Kids Code Jeunesse</a>
<br/>
<% end %>
- <a href="<%= hoc_uri('/prizes-terms') %>">Terms and Conditions</a>
<br/>
<% if @country == 'us' %>
- <a href="<%= hoc_uri('/prizes#faq') %>">FAQ</a>
<br/>
<% end %>
