---
view: page_curriculum
theme: none
---

# Computer Science Fundamentals: Unplugged Test2

<%= partial('doc_header', :title => 'CS Fundamentals Unplugged', :disclaimer=>'Code.org Standards Alignment') %>


<%
course = 'Algebra'
lessons = DB[:cdo_lessons].where(course_s:course)
%>

[content]

<% lessons.each_with_index do |lesson, index| %>

  <%= lesson[:id_s] %>
  <br/>
  <%= lesson[:name_s] %>
  <link rel="stylesheet" type="text/css" href="../morestyle.css"/>

<% end %>

[/content]
