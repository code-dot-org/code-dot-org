---
from: 'Hadi Partovi (Code.org) <hadi_partovi@code.org>'
subject: Volunteer Submission Received
---
<% hostname = CDO.canonical_hostname('hourofcode.com') %>
<% update_preferences = "http://#{CDO.canonical_hostname('code.org')}/volunteer/engineer/edit/#{form.secret}/" %>

Thank you for submitting your information to help local teachers for the Hour of Code, during Computer Science Education Week December 7-13. So what can you do now?

## 1. Recruit your co-workers to volunteer
Over 13,000 teachers have requested a volunteer but only 4,000 have signed up. Tell your friends and co-workers about the Hour of Code and ask them to [sign up as a volunteer](https://code.org/volunteer/engineer).

## 2. Join us for the Volunteer Webinar
On November 16 (1:00pm - 1:30pm PST) and December 3 (11:00am - 11:30am PST), we'll be hosting Hangouts on Air to answer any questions you may have about volunteering for the Hour of Code. Save the date for now, and closer to the date we'll send you a reminder about how to join. If you can't make it, we'll post a link so you can watch it later at your convenience.

## 3. Review the How-to Guide for Volunteers
To get a better idea about what your volunteer experience will be like, review [this guide](https://hourofcode.com/us/how-to/volunteers). There's also some extra tips about how you can get your employer and community involved with the Hour of Code.

If you need to update your information or want to unsubscribe from teacher requests, use this link:

<%= "https://#{CDO.canonical_hostname('code.org')}/volunteer/engineer/edit/#{form.secret}/" %>

Thanks again for your support,

Hadi Partovi,<br/>
Founder, Code.org

<hr/>

Code.org is a 501c3 non-profit. Our address is 1301 5th Ave, Suite 1225, Seattle, WA, 98101. You can update your email preferences at any time.

- [Unsubscribe from additional teacher requests **this year**](<%= update_preferences %>)
- [Unsubscribe from teacher requests **forever**](<%= update_preferences %>)
- [Unsubscribe from all Code.org emails](<%= unsubscribe_link %>)

![](<%= tracking_pixel %>)
