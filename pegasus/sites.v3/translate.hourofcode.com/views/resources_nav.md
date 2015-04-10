- <a href="<%= hoc_uri('/resources/how-to') %>">crwdns20683:0crwdne20683:0</a>
<br/>
<% if @country == 'us' %>
- <a href="<%= hoc_uri('/resources/how-to-events') %>">crwdns23780:0crwdne23780:0</a>
<br />
<% end %>
- <a href="<%= hoc_uri('/resources#handouts') %>">crwdns20684:0crwdne20684:0</a>
<br/>
- <a href="<%= hoc_uri('/resources#videos') %>">crwdns20685:0crwdne20685:0</a>
<br/>
- <a href="<%= hoc_uri('/resources#posters') %>">crwdns20686:0crwdne20686:0</a>
<br/>
- <a href="<%= hoc_uri('/resources#social') %>">crwdns21295:0crwdne21295:0</a>
<br/>
<% if @country != 'uk' %>
- <a href="<%= hoc_uri('/resources#banners') %>">crwdns20687:0crwdne20687:0</a>
<br/>
<% end %>
- <a href="<%= hoc_uri('/resources#sample-emails') %>">crwdns20688:0crwdne20688:0</a>
<br/>
<% if @country != 'uk' %>
- <a href="<%= hoc_uri('/resources/stats') %>">crwdns23783:0crwdne23783:0</a>
<br />
<% end %>
- <a href="<%= hoc_uri('/resources/press-kit') %>">crwdns20690:0crwdne20690:0</a>
<% if @country == 'us' %>
- <a href="<%= hoc_uri('/resources/how-to-districts') %>">crwdns23781:0crwdne23781:0</a>
<br />
<% end %>
<% if @country == 'us' %>
- <a href="<%= hoc_uri('/resources/how-to-public-officials') %>">crwdns23782:0crwdne23782:0</a>
<br />
<% end %>

