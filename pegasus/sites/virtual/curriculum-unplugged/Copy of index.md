---
title: CS Fundamentals Unplugged Lessons
theme: none
video_player: true
---


# Computer Science Fundamentals: Unplugged


<!-- <%= partial('doc_header', :title => 'CS Fundamentals Unplugged', :disclaimer=>'Code.org Standards Alignment') %> -->

<%
course = 'Unplugged'
lessons = DB[:cdo-unplugged].where(course_s:course)
%>

[content]


<!-- Use this only if we have extra info to share
<table>
<tr>
  <td style="background-color: #00ADBC; color: #FFFFFF; font-size: 20px; font-weight: bold;">Looking for lessons that don't require computers?</td>
</tr>
<tr>
  <td> 
  
  If this is your first time programming, you may want to go through one of the following online courses before teaching this material:
<li> <a href="https://www.codecademy.com/learn/javascript" target="_blank">Codecademy</a>
<li> <a href="https://www.khanacademy.org/computing/computer-programming/programming" target="_blank">Khan Academy</a>
<li> <a href="https://codehs.com/library/course/1/module/1" target="_blank">CodeHS</a>

  
  </td>
</tr>
</table> -->

<br/>
Each of these activities can either be used alone or with other computer science lessons on related concepts.


<table cellpadding="10">
  <colgroup>
    <col width="20%" style="background-color:#999999;">
    <col width="25%" style="border:1px solid #999999;">
    <col width="30%" style="border:1px solid #999999;">
    <col width="25%" style="border:1px solid #999999;">
  </colgroup>
  <thead>
    <tr>
      <th style="text-align: center;">Concept</th>
      <th style="text-align: center;">Lessons</th>
      <th style="text-align: center;">Curriculum Video</th>
      <th style="text-align: center;">Additional Resources</th>
    </tr>
  </thead>
</table>





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

<a href="http://creativecommons.org/"><img src="https://code.org/curriculum/docs/k-5/creativeCommons.png" border="0"></a>

[/content]

<link rel="stylesheet" type="text/css" href="../morestyle.css"/>