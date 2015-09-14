---
<%
workshop_row = DB[:forms].first(id:form.parent_id)
affiliate = DASHBOARD_DB[:users].where(id: workshop_row[:user_id]).first
%>
from: <%= affiliate[:name] + " <" + affiliate[:email] + ">" %>
subject: "Your [Code.org] Workshop is coming up!"
litmus_tracking_id: "e5cj1of6"
---

<%
  workshop = JSON.parse(workshop_row[:data]).merge(JSON.parse(workshop_row[:processed_data]))
  
  cancel_link = "http://#{CDO.canonical_hostname('code.org')}/professional-development-workshops/cancel/#{form.secret}"
%>

This is a friendly reminder that your Code.org workshop is coming up soon!

### How to cancel your workshop registration
**If you can’t make it:** please [cancel your registration](<%= cancel_link %>) in advance so other teachers may take your spot.

### How to prepare for your workshop
1. Sign up for a [teacher account](http://learn.code.org/users/sign_up?user%5Buser_type%5D=teacher) at Code.org if you don’t already have one. 

2. Update your name in your Code Studio account settings to be the name you want to appear on your PD completion certificate. To do so: 
	- Log into your account
	- Click the organge block in the upper right hand corner that says "Hi Your Name" 
	- Select "My account" 
	- Change your "Display name" 
	- Click "Update"


**Technology Requirements:** This workshop requires you bring your own technology. Review [this page](https://support.code.org/hc/en-us/articles/202591743-What-kind-of-operating-system-and-browser-do-I-need-to-use-Code-org-s-online-learning-system-) for more information regarding compatible operating systems and browsers.

### Workshop details:

- Date(s): <%= workshop['dates'].map{|i| "#{i['date_s']} (#{i['start_time_s']} - #{i['end_time_s']})"}.join(', ') %>
- Location: <%= workshop['location_name_s'] %>
- Workshop facilitator: <%= affiliate[:name] %> - <%= affiliate[:email] %>

> <%= workshop['notes_s'] %>

![](<%= tracking_pixel %>)

