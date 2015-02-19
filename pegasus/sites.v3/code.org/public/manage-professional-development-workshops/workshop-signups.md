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

<form class="form-inline">
  <h3> Filter by date:</h3>
  <div class="form-group">
    <input type="text" class="form-control" name="from" id="filter-date-from" value="<%= params[:from] ? URI.escape(params[:from]) : '' %>" placeholder="From">
  </div>
  <div class="form-group">
    <input type="text" class="form-control" name="to" id="filter-date-to" value="<%= params[:to] ? URI.escape(params[:to]) : '' %>" placeholder="To">
  </div>
  <button type="submit" class="btn btn-default">Submit</button>
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
