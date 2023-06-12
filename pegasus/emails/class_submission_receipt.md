---
from: '"Hadi Partovi (Code.org)" <hadi_partovi@code.org>'
reply-to: '"Code.org" <support@code.org>'
subject: Submission Received
---
<% edit_link = "http://#{CDO.canonical_hostname('code.org')}/schools/edit/#{form.secret}" %>

Thank you for submitting a school/activity. After review, it will appear on our site. If necessary, you can make changes by clicking here: [<%= edit_link %>](<%= edit_link %>).

Thanks again for your support,

Hadi Partovi,<br/>
Founder, Code.org

<hr/>

Code.org is a 501c3 non-profit. Our address is 801 5th Avenue, Suite 2100, Seattle, WA 98104. Don't like these emails? [Unsubscribe](<%= local_assigns.fetch(:unsubscribe_link, "") %>).

![](<%= local_assigns.fetch(:tracking_pixel, "") %>)
