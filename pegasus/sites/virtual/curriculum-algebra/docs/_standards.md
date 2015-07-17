<% standards = lesson[:standards_s].split(";").collect{|id| DB[:cdo_standards].where(id_s:id).first}.reject(&:blank?).group_by{|s| s[:family_s]} %>

[standards]

<details>
<summary>Standards Alignment</summary>

<% standards.each do |family| %>
<h3><%= family[0] %></h3>
<ul>
<% family[1].each do |standard| %>
<li><b><%= standard[:id_s] %></b> - <%= standard[:desc_t] %></li>
<% end %>
</ul>
<% end %>

</details>

[/standards]

