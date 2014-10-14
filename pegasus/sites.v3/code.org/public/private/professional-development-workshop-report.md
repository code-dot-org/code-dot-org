---
title: Professional Development Workshops
---

<h1>Professional Development Workshops</h1>

<%
  require 'cdo/csv'

  from, to = nil
  if params[:from] && params[:to]
    from = Chronic.parse(params[:from])
    to = Chronic.parse(params[:to])
  end  

  rows = ProfessionalDevelopmentWorkshop.report(from, to)
%>

<h3>Filter by date:</h3>
<form>
  From: <input type="text" name="from" value="<%= params[:from] ? URI.escape(params[:from]) : '' %>"/>
  To: <input type="text" name="to" value="<%= params[:to] ? URI.escape(params[:to]) : '' %>"/>
  <input type="submit"/>
</form>

<br/>
<br/>

[Download CSV](/private/professional-development-workshop-report.csv?from=<%= params[:from] ? URI.escape(params[:from]) : ''%>&to=<%= params[:to] ? URI.escape(params[:to]) : '' %>)

<br/>
<br/>

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
