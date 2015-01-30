<% standards = lesson[:standards_s].split(";").collect{|id| DB[:cdo_standards].where(id_s:id).first}.reject(&:blank?).group_by{|s| s[:family_s]} %>

[standards]

<details>
<summary>Standards Alignment</summary>

<% standards.each do |family| %>
### <%= family[0] %>
<% family[1].each do |standard| %>
- **<%= standard[:id_s] %>** - <%= standard[:desc_t] %>
<% end %>
<% end %>

</details>

[/standards]

<a href="http://creativecommons.org/"><img src="http://www.thinkersmith.org/images/creativeCommons.png" border="0"></a>  

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css"/>