---
title: Workshop signups
---
<%
  authentication_required!
  forbidden! unless have_permission?('create_professional_development_workshop') || dashboard_user[:admin]
  
  from, to = nil
  if params[:from] && params[:to]
    from = Chronic.parse(params[:from])
    to = Chronic.parse(params[:to])
  end  

  rows = generate_professional_development_workshops_report(from, to)
%>
# Workshop signups

## Filter by date:

<form>
  From: <input type="text" name="from" value="<%= params[:from] ? URI.escape(params[:from]) : '' %>"/>
  To: <input type="text" name="to" value="<%= params[:to] ? URI.escape(params[:to]) : '' %>"/>
  <input type="submit"/>
</form>

<% if rows.empty? %>
## No results
<% else %>

## [<i class="fa fa-download"></i> Download CSV](/manage-professional-development-workshops/workshop-signups.csv?from=<%= params[:from] ? URI.escape(params[:from]) : ''%>&to=<%= params[:to] ? URI.escape(params[:to]) : '' %>)

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
