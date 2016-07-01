---
title: CS in Algebra Standards Alignment
view: page_curriculum
theme: none
---

<%= partial('doc_header', :title => 'CS in Algebra', :disclaimer=>'Code.org Standards Alignment') %>

<%
course = 'Algebra'
lessons = DB[:cdo_lessons].where(course_s:course)
%>

[content]

[together]

<% lessons.each_with_index do |lesson, index| %>
<table>
<thead>
<tr>
<th colspan="2">
Lesson <%= index + 1 %>: <%=lesson[:name_s] %>
</th>
</tr>
</thead>
<% standards = lesson[:standards_t].split(";").collect{|id| DB[:cdo_standards].where(id_s:id).first}.reject(&:blank?).group_by{|s| s[:family_short_s]} %>
<% standards.each do |family| %>
<tr>
<td>
<strong><%= family[0] %></strong>
</td>
<td>
<% family[1].each_with_index do |standard| %>
<strong><%= standard[:id_s] %></strong> - <%= standard[:desc_t] %><br/>
<% end %>
</td>
<% end %>
</tr>
</table>
<% end %>

[/together]


[/content]

<link rel="stylesheet" type="text/css" href="../morestyle.css"/>