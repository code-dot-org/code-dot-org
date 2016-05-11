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

<% lessons.each_with_index do |lesson, index| %>

[together]

## <a name="lesson_<%= index + 1 %>"></a> Lesson <%= index + 1 %>: <%=lesson[:name_s] %>
<% standards = lesson[:standards_t].split(";").collect{|id| DB[:cdo_standards].where(id_s:id).first}.reject(&:blank?).group_by{|s| s[:family_s]} %>
<% standards.each do |family| %>
### <%= family[0] %>
<ul>
<% family[1].each_with_index do |standard| %>
<li><strong><%= standard[:id_s] %></strong> - <%= standard[:desc_t] %></li>
<% end %>
</ul>
<% end %>
<hr/>

[/together]

<% end %>


[/content]

<link rel="stylesheet" type="text/css" href="../morestyle.css"/>