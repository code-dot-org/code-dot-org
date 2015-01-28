<% anchor = DB[:cdo_standards].where(id_s:lesson[:anchor_s]).first %>

## Lesson Overview

<%= lesson[:overview_t] %>

## Lesson Objectives 
### Students will:

<% lesson[:objectives_s].split(";").each do |objective| %>
- <%= objective %>
<% end %>

<details>
<summary>Anchor Standard</summary>

### <%= anchor[:family_s] %>

- **<%= anchor[:id_s] %>**: <%= anchor[:desc_t] %>

_Additional standards alignment can be found at the end of this lesson_
</details>

<details>
<summary>Curriculum Connections</summary>
### Connections to external or internal curricular content
- Graphing and number lines
</details>

<details>
<summary>Prerequisite Knowledge</summary>
### This lesson assumes that students can:

<% lesson[:prereqs_s].split(";").each do |prereq| %>
- <%= prereq %>
<% end %>

</details>