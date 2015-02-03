<% anchor = DB[:cdo_standards].where(id_s:lesson[:anchor_s]).first %>

<% if !lesson[:overview_t].nil? %>
## Lesson Overview

<%= lesson[:overview_t] %>
<% end %>

<% if !lesson[:objectives_s].nil? %>
## Lesson Objectives 
### Students will:

<% lesson[:objectives_s].split(";").each do |objective| %>
- <%= objective %>
<% end %>

<% end %>

<% if !lesson[:anchor_s].nil? %>
<details>
<summary>Anchor Standard</summary>

### <%= anchor[:family_s] %>

- **<%= anchor[:id_s] %>**: <%= anchor[:desc_t] %>

_Additional standards alignment can be found at the end of this lesson_
</details>
<% end %>

<% if !lesson[:prereqs_s].nil? %>
<details>
<summary>Prerequisite Knowledge</summary>
### This lesson assumes that students can:

<% lesson[:prereqs_s].split(";").each do |prereq| %>
- <%= prereq %>
<% end %>

</details>
<% end %>