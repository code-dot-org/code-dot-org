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

 def sent_count(row)
   DB[:poste_deliveries].where(message_id:row[:message_id]).count
 end
%>

<br/>
<br/>

<table>
  <tr>
    <th>Message</th>
    <th>Sends</th>
    <th>Opens</th>
    <th>Views</th>
  </tr>
  <% rows.each do |row|
       sent = sent_count(row)
       open_percent = (row[:opens]*100)/sent %>
    <tr>
      <td>
        <a href="#<%= row[:message] %>"><%= row[:message] %></a>
        <a name="<%= row[:message] %>"/>
      </td>
      <td><%= sent_count(row) %></td>
      <td><%= row[:opens] %> (<%= open_percent %>%)</td>
      <td><%= row[:views] %></td>
    </tr>
  <% end %>
</table>
