---
title: Professional Development Workshop Teachers
---

# Professional Development Workshops Teachers

<%
  rows = generate_professional_development_workshop_teachers_report
%>

<% if rows.empty? %>
## No results
<% else %>

## [<i class="fa fa-download"></i> Download CSV](/private/professional-development-workshop-teachers-report.csv)

## Preview

<table>
  <tr>
    <% rows[0].keys.each do |key| %>
      <th><%= key %></th>
    <% end %>
  </tr>
  <% rows.each do |row| %>
  <tr>
    <% row.values.each do |value| %>
      <td><%= value %></td>
    <% end %>
  </tr>
  <% end %>
</table>

<% end %>
