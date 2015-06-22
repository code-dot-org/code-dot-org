<% standards = lesson[:standards_t].split(";").collect{|id| DB[:cdo_standards].where(id_s:id).first}.reject(&:blank?).group_by{|s| s[:family_s]} %>

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

<a href="//code.org"><img src="../docs/codelogo.png" style="float:left; height: 80px;"></a>

<span style="float:right">Derived from</span>
<a href="http://www.bootstrapworld.org" target="_blank"><img src="../docs/bootstraplogo.png" style="float:right; height: 60px; clear: right;"></a>
</div>

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css"/>