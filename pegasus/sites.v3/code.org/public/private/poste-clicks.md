---
title: Poste Clicks
---

<%
  rows = DB.fetch('
SELECT
  poste_messages.id as id,
  poste_messages.name as message,
  poste_urls.url as url,
  COUNT(poste_clicks.id) as clicks
FROM poste_clicks
LEFT JOIN poste_messages ON poste_messages.id = poste_clicks.message_id
LEFT JOIN poste_urls ON poste_urls.id = poste_clicks.url_id
GROUP BY poste_clicks.message_id, poste_clicks.url_id
ORDER BY poste_messages.name
')
%>

<br/>
<br/>

<table>
  <tr>
    <th>Message</th>
    <th>Link</th>
    <th>Clicks</th>
  </tr>
  <% rows.each do |row| %>
    <tr>
      <td><%= row[:message] %></td>
      <td><a href='<%= row[:url] %>'><%= row[:url] %></a></td>
      <td><%= row[:clicks] %></td>
    </tr>
  <% end %>
</table>

