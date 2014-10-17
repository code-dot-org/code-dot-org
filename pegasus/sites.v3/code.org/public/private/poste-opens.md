---
title: Poste Opens
---

<%
  rows = DB.fetch('
SELECT
  poste_messages.id as message_id,
  poste_messages.name as message,
  COUNT(distinct poste_deliveries.id) as opens,
  COUNT(poste_opens.id) as views
FROM poste_opens
JOIN poste_deliveries ON poste_deliveries.id = poste_opens.delivery_id
JOIN poste_messages ON poste_messages.id = poste_deliveries.message_id
GROUP BY poste_messages.id
ORDER BY poste_messages.name
')
%>

<br/>
<br/>

<table>
  <tr>
    <th>Message</th>
    <th>Opens</th>
    <th>Views</th>
  </tr>
  <% rows.each do |row| %>
    <tr>
      <td><%= row[:message] %></td>
      <td><%= row[:opens] %></td>
      <td><%= row[:views] %></td>
    </tr>
  <% end %>
</table>
