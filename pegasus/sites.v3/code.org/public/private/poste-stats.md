---
title: Poste Stats
---

<%
  rows = DB.fetch('
SELECT
  poste_messages.name AS message,
  COUNT(poste_deliveries.id) AS deliveries,
  COUNT(poste_deliveries.sent_at) AS sent,
  COUNT(DISTINCT poste_opens.id) as opens,
  (COUNT(DISTINCT poste_opens.id) * 100) / COUNT(poste_deliveries.sent_at) AS percent_opened,
  COUNT(poste_clicks.id) as clicks,
  (COUNT(poste_clicks.id) * 100) / COUNT(DISTINCT poste_opens.id) AS percent_clicked,
  (COUNT(poste_clicks.id) * 100) / COUNT(poste_deliveries.sent_at) AS percent_clicked_sent
FROM poste_messages
LEFT JOIN poste_deliveries ON poste_deliveries.message_id = poste_messages.id
LEFT JOIN poste_opens ON poste_opens.delivery_id = poste_deliveries.id
LEFT JOIN poste_clicks ON poste_clicks.delivery_id = poste_deliveries.id
GROUP BY poste_messages.name
ORDER BY poste_messages.name
')
%>

<br/>
<br/>

<table>
  <tr>
    <th>Message</th>
    <th>Members</th>
    <th>Sent</th>
    <th>Opens</th>
    <th>Clicks</th>
  </tr>
  <% rows.each do |row| %>
    <tr>
      <td><%= row[:message] %></td>
      <td><%= row[:deliveries] %></td>
      <td><%= row[:sent] %></td>
      <td><%= row[:opens] %><br/><%= row[:percent_opened].to_i %>% sent</td>
      <td><%= row[:clicks] %><br/><%= row[:percent_clicked].to_i %>% opened<br/><%= row[:percent_clicked_sent].to_i %>% sent</td>
    </tr>
  <% end %>
</table>
