---
from: '"Code.org" <info@code.org>'
subject: "[Code.org] Workshop added"
---
<% signup_link = "http://#{CDO.canonical_hostname('code.org')}/professional-development-workshops/#{form.id}" %>

You have added a workshop. To invite people to sign up for it, send them this link:

<%= signup_link %>

Thanks again for your support,

Hadi Partovi,<br/>
Founder, Code.org

<hr/>

Code.org is a 501c3 non-profit. Our address is 1301 5th Ave, Suite 1225, Seattle, WA, 98101. Don't like these emails? [Unsubscribe](<%= unsubscribe_link %>).

![](<%= tracking_pixel %>)
