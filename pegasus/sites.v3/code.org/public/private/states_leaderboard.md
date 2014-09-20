# Hour of Code Results by State

<% fetch_hoc_metrics['states'].each_pair do |state,count| %>
- <%= state %>: <%= count %>
<% end %>