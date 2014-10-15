---
title: Professional Development Workshops
---

# Professional Development Workshops

<%
  from, to = nil
  if params[:from] && params[:to]
    from = Chronic.parse(params[:from])
    to = Chronic.parse(params[:to])
  end  

  rows = generate_professional_development_workshop_payment_report(from, to)
%>

## Filter by date:

<form>
  From: <input type="text" name="from" value="<%= params[:from] ? URI.escape(params[:from]) : '' %>"/>
  To: <input type="text" name="to" value="<%= params[:to] ? URI.escape(params[:to]) : '' %>"/>
  <input type="submit"/>
</form>

<% if rows.empty? %>
## No results
<% else %>

## [<i class="fa fa-download"></i> Download CSV](/private/professional-development-workshop-report.csv?from=<%= params[:from] ? URI.escape(params[:from]) : ''%>&to=<%= params[:to] ? URI.escape(params[:to]) : '' %>)

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
