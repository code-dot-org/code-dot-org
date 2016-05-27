---
title: CS Fundamentals Unplugged Lessons
theme: none
video_player: true
---


# Computer Science Fundamentals: Unplugged


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