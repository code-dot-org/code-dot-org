---
from: 'Hadi Partovi (Code.org) <hadi_partovi@code.org>'
subject: "your thank you gift"
---
<% survey_url = "http://hourofcode.com/survey/#{Poste.encrypt(recipient.email)}" %>

Thank you. Nearly 25 million students tried an Hour of Code last week ― coding a few lines (or a few dozen) that are the beginning of new skills and new open doors.

**Your Gift:**
Of course, we promised Dropbox space or Skype credit as a thank you. After your Hour of Code event, we also want to know how it went. If you did an unplugged or shared-screen activity, we want to count your participation. **Complete this survey by Jan 31 to claim your gift.**

At the end of your survey, please choose between 10 GB of Dropbox space or $10 of Skype credit and your unique code will be emailed to you. Note: if you have redeemed a 10 GB Dropbox code in the past, you can only apply your new code to a *different* account or choose Skype credit as your gift.

Hadi Partovi, Code.org

Take [the survey](<%= survey_url %>).

<br/>
<hr/>

You’re receiving this email because you signed up to host the Hour of Code at [hourofcode.com](https://hourofcode.com/). We’ll send you only a few updates a year on new ways to learn and help. Don’t like these emails? [Unsubscribe](<%= unsubscribe_link %>).

![](<%= tracking_pixel %>)
