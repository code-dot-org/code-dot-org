---
from: 'Andrew Oberhardt (Code.org) <andrew@code.org>'
subject: "Your thank-you gift"
---
<% survey_url = "http://hourofcode.com/survey/prize/#{Poste.encrypt(recipient.email)}" %>

Thank you for participating in the Hour of Code. Unfortunately we ran out of your selected prize type. Please choose [another](<%= survey_url %>).
  
Sorry for the inconvenience.
<br/>
<hr/>

<p><small>You’re receiving this email because you signed up to host an Hour of Code on <a href="https://hourofcode.com/">hourofcode.com</a>. Code.org is a 501c3 non-profit. Our address is 1301 5th Ave, Suite 1225, Seattle, WA, 98101.</small> <br />
<small><strong>Don't want these emails? <a href="<%= unsubscribe_link %>">Unsubscribe here</a>.</strong></small></p>
<p><small>Stay in touch with us. Follow Code.org on
<a href="https://www.facebook.com/Code.org">Facebook</a>, <a href="https://twitter.com/codeorg">Twitter</a>, <a href="https://instagram.com/codeorg">Instagram</a>.
</small></p>

![](<%= tracking_pixel %>)
