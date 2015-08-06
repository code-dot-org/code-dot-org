<% anchor = DB[:cdo_standards].where(id_s:lesson[:anchor_s]).first %>

<% if !lesson[:overview_t].nil? %>
## Lesson Overview

<%= lesson[:overview_t] %>
<% end %>

<% if !lesson[:objectives_t].nil? %>
## Lesson Objectives 
### Students will:

<% lesson[:objectives_t].split(";").each do |objective| %>
- <%= objective %>
<% end %>

<% end %>

<% if !lesson[:anchor_s].nil? %>
<details>
<summary>Anchor Standard</summary>

<h3><%= anchor[:family_s] %></h3>

<ul>
<li><b><%= anchor[:id_s] %></b>: <%= anchor[:desc_t] %></li>
</ul>

<p><i>Additional standards alignment can be found at the end of this lesson</i></p>

</details>
<% end %>

<% if !lesson[:prereqs_t].nil? %>
<details>
<summary>Prerequisite Knowledge</summary>
<h3>This lesson assumes that students can:</h3>

<ul>
<% lesson[:prereqs_t].split(";").each do |prereq| %>
<li><%= prereq %></li>
<% end %>
</ul>

</details>
<% end %>
