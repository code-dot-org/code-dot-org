---
<%
def format_email_address(email, name='')
  name = "\"#{name.gsub('"', '\"').gsub("'","\\'")}\"" if name =~ /[;,\"\'\(\)]/
  "#{name} <#{email}>".strip
end

  workshop_row = DB[:forms].first(id:form.parent_id)
  workshop = JSON.parse(workshop_row[:data]).merge(JSON.parse(workshop_row[:processed_data]))

  affiliate = DASHBOARD_DB[:users].where(id: workshop_row[:user_id]).first
%>
to: '<%= format_email_address(affiliate[:email], affiliate[:name]) %>'
from: "Code.org <info@code.org>"
subject: "[Code.org] Workshop signup cancellation - <%= workshop['dates'].map{|i| i['date_s']}.join(', ') %>"
---

<%
  workshop_row = DB[:forms].first(id:form.parent_id)
  workshop = JSON.parse(workshop_row[:data]).merge(JSON.parse(workshop_row[:processed_data]))
%>

This is an email notifying you that <%= name_s%> has canceled their registration for your workshop on <%= workshop['dates'].map{|i| i['date_s']}.join(', ') %> at [<%= workshop['location_name_s'] %>](http://<%=CDO.canonical_hostname('code.org')%>/manage-professional-development-workshops#/<%= workshop_row[:secret] %>/view).

Their registration has been removed from your affiliate dashboard and a spot has opened up for another teacher to sign up.

![](<%= tracking_pixel %>)
