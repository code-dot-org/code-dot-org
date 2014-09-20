---
<%
  workshop_row = DB[:forms].first(id:form.parent_id)
  workshop = JSON.parse(workshop_row[:data]).merge(JSON.parse(workshop_row[:processed_data]))
%>
to: <%= format_email_address(workshop['email_s'], workshop['name_s']) %>
from: '"Code.org" <info@code.org>'
subject: "[Code.org] Workshop registration"
---

<%
  workshop_row = DB[:forms].first(id:form.parent_id)
  workshop = JSON.parse(workshop_row[:data]).merge(JSON.parse(workshop_row[:processed_data]))
%>

The following teacher has signed up for one of your workshops:

- Name: <%= name_s %>
- Email address: [<%= email_s %>](<%= email_s %>)
- Role: <%= (teacher_role_ss || []).join(', ') %>
- School name: <%= school_name_s %>
- School location: <%= school_location_s %>
- School type: <%= (school_type_ss || []).join(', ') %>
- School level: <%= (school_levels_ss || []).join(', ') %>
- Number of students at school: <%= number_students_s %>

Workshop details:

- Date(s): <%= workshop['dates'].map{|i| i['date_s']}.join(', ') %>
- Location: [<%= workshop['location_name_s'] %>](http://<%=CDO.canonical_hostname('code.org')%>/manage-professional-development-workshops#/<%= workshop_row[:secret] %>/view)
