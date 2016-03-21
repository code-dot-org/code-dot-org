---
from: 'Tanya Parker (Code.org) <tanya_parker@code.org>'
subject: Volunteer Submission Received
---
<% hostname = CDO.canonical_hostname('hourofcode.com') %>
<% update_preferences = "http://#{CDO.canonical_hostname('code.org')}/volunteer/engineer/edit/#{form.secret}/" %>

Thank you for submitting your information to help local teachers. Teachers will be using this [map of volunteers](https://code.org/volunteer/local) to find and contact volunteers like you. You can review [this guide](https://code.org/volunteer/guide) to get a better idea of what your volunteer experience will be like and to review tips for connecting with students.

If you need to update your information or want to unsubscribe from teacher requests, use this link:

<%= "https://#{CDO.canonical_hostname('code.org')}/volunteer/engineer/edit/#{form.secret}/" %>

Thanks again for your support,

Tanya Parker<br/>
Volunteer Coordinator, Code.org

<hr/>

Code.org is a 501c3 non-profit. Our address is 1301 5th Ave, Suite 1225, Seattle, WA, 98101. You can update your email preferences and edit your submitted information at any time.

- [Edit my information](<%= update_preferences %>)
- [Unsubscribe from additional teacher requests **this year**](<%= update_preferences %>)
- [Unsubscribe from teacher requests **forever**](<%= update_preferences %>)
- [Unsubscribe from all Code.org emails](<%= unsubscribe_link %>)

![](<%= tracking_pixel %>)
