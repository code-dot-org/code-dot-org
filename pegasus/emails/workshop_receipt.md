---
from: '"Code.org" <info@code.org>'
subject: "[Code.org] Workshop added"
---
<% signup_link = "http://#{CDO.canonical_hostname('code.org')}/professional-development-workshops/#{form.id}" %>

You have added a workshop. To invite people to sign up for it, send them this link:

<%= signup_link %>

![](<%= tracking_pixel %>)
