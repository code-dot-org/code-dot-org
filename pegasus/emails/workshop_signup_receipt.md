---
<%
workshop_row = DB[:forms].first(id:form.parent_id)
affiliate = DASHBOARD_DB[:users].where(id: workshop_row[:user_id]).first
%>
from: <%= affiliate[:name] + " <" + affiliate[:email] + ">" %>
subject: "[Code.org] Workshop registration"
litmus_tracking_id: "iujowffk"
---

<%
  workshop = JSON.parse(workshop_row[:data]).merge(JSON.parse(workshop_row[:processed_data]))

  cancel_link = "http://#{CDO.canonical_hostname('code.org')}/professional-development-workshops/cancel/#{form.secret}"
%>

Thank you for signing up to attend a Code.org K-5 workshop.

**To prepare for your workshop:** Sign up for a [teacher account](http://learn.code.org/users/sign_up?user%5Buser_type%5D=teacher) at Code.org if you don’t already have one. Review the following [introductory course materials](http://code.org/educate/k5/introPD). These will give you a head start into the course materials to be covered and maximizing learning time during the in-person workshop.

**Technology Requirements:** This workshop requires you bring your own technology. Review [this page](https://support.code.org/hc/en-us/articles/202591743-What-kind-of-operating-system-and-browser-do-I-need-to-use-Code-org-s-online-learning-system-) for more information regarding compatible operating systems and browsers.

Workshop details:

- Date(s): <%= workshop['dates'].map{|i| "#{i['date_s']} (#{i['start_time_s']} - #{i['end_time_s']})"}.join(', ') %>
- Location: <%= workshop['location_name_s'] %>
- Workshop facilitator: <%= affiliate[:name] %> - <%= affiliate[:email] %>

> <%= workshop['notes_s'] %>

### How to cancel your registration
**If you are unable to attend the workshop, please [cancel your registration](<%= cancel_link %>), in advance so other teachers may take your spot.**

![](<%= tracking_pixel %>)
