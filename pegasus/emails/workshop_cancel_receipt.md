---
from: "Code.org <info@code.org>"
subject: "[Code.org] Workshop signup cancellation"
---

<%
  workshop_row = DB[:forms].first(id:form.parent_id)
  workshop = JSON.parse(workshop_row[:data]).merge(JSON.parse(workshop_row[:processed_data]))

  affiliate = DASHBOARD_DB[:users].where(id: workshop_row[:user_id]).first
%>

You have canceled your registration for the Code.org K-5 workshop with <%= affiliate[:name] %> on <%= workshop['dates'].map{|i| "#{i['date_s']} (#{i['start_time_s']} - #{i['end_time_s']})"}.join(', ') %> at <%= workshop['location_name_s'] %>.

We’re sorry to hear you can no longer attend. You can sign up for a different workshop [here](http://<%=CDO.canonical_hostname('code.org')%>/professional-development-workshops).

If this is a mistake and you did not mean to cancel your workshop registration, contact your facilitator at <%= affiliate[:name] %> - <%= affiliate[:email] %>.

![](<%= tracking_pixel %>)
