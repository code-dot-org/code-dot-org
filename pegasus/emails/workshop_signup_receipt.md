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

### Next steps to prepare for your workshop: 

1. Sign up for a [teacher account](http://learn.code.org/users/sign_up?user%5Buser_type%5D=teacher) at Code.org if you don’t already have one. 

2. Update your name in your Code Studio account settings to be the name you want to appear on your PD completion certificate.

3. If you have any food allergies, please bring your own meal or eat responsibly. 

4. Other workshop attendees may post photos from the workshop to social media. If you don't want your photo taken, make sure the facilitator knows before the workshop begin.


**Technology Requirements:** This workshop requires you bring your own technology. Review [this page](https://support.code.org/hc/en-us/articles/202591743-What-kind-of-operating-system-and-browser-do-I-need-to-use-Code-org-s-online-learning-system-) for more information regarding compatible operating systems and browsers.

**Workshop details:**

- Date(s): <%= workshop['dates'].map{|i| "#{i['date_s']} (#{i['start_time_s']} - #{i['end_time_s']})"}.join(', ') %>
- Location: <%= workshop['location_name_s'] %>
- Workshop facilitator: <%= affiliate[:name] %> - <%= affiliate[:email] %>

> <%= workshop['notes_s'] %>

### How to cancel your registration
**If you are unable to attend the workshop, please [cancel your registration](<%= cancel_link %>), in advance so the facilitator can plan accordingly.**

![](<%= tracking_pixel %>)
