---
title: CS in Algebra Curriculum Framework
view: page_curriculum
theme: none
---

<%= partial('doc_header', :title => 'CS in Algebra', :disclaimer=>'Code.org Curriculum Framework') %>

<%
course = 'Algebra'
lessons = DB[:cdo_lessons].where(course_s:course)
%>

[content]


<% lessons.each_with_index do |lesson, index| %>

[together]

<table style="width: 100%">
<thead>
<tr>
<th colspan="2">
Lesson <%= index + 1 %>: <%=lesson[:name_s] %>
</th>
</tr>
</thead>
<tr>
<td>Overview</td>
<td>
<%= lesson[:overview_t] %>
</td>
</tr>
<tr>
<td>Objectives</td>
<td>
<ul>
<% lesson[:objectives_t].split(";").each do |objective| %>
<li><%= objective %></li>
<% end %>
</ul>
</td>
</tr>
<tr>
<td>Standards</td>
<td>
<% standards = lesson[:standards_t].split(";").collect{|id| DB[:cdo_standards].where(id_s:id).first}.reject(&:blank?).group_by{|s| s[:family_s]} %>
<% standards.each do |family| %>
<strong><%= family[0] %></strong>:
<% family[1].each_with_index do |standard, index| %>
<%= standard[:id_s] %>
<%= index < family[1].size - 1 ? ", " : "." %>
<% end %>
<br/>
<% end %>

</td>
</tr>
</table>

[/together]

<br/>
<% end %>


[/content]

<link rel="stylesheet" type="text/css" href="../morestyle.css"/>