---
from: 'Hadi Partovi (Code.org) <hadi_partovi@code.org>'
subject: "your thank you gift"
---
<% survey_url = "http://hourofcode.com/survey/#{Poste.encrypt(recipient.email)}" %>

Thank you for hosting an Hour of Code! We promised a thank-you gift for organizers (**supplies limited**). First, we need 10 minutes of your time to help us inform future Hour of Code campaigns. No matter how you did the Hour of Code, we want to know how it went and count your participation. 

**Complete [this 10-minute survey](<%= survey_url %>) by January 15, 2016 to claim your gift. Supplies limited.**

At the end of the survey, select a thank-you gift from one of the available options. **Supplies are limited so not all prize options may be available.** Your gift code will be emailed to you. Make sure to check your spam incase it ends up there.

**Note:** if you choose Dropbox and have redeemed a 10 GB Dropbox code in the past, you can only apply your new code to a *different* account or choose a different thank-you gift, if available.

Because of you, students tried an Hour of Code last week ― coding a few lines (or a few dozen) that are the beginning of new skills and new open doors.

Thank you for all your support,

Hadi Partovi, Code.org

**Take [the survey](<%= survey_url %>).**

<br/>
<hr/>

You’re receiving this email because you signed up to host the Hour of Code at [hourofcode.com](https://hourofcode.com/). We’ll send you only a few updates a year on new ways to learn and help. Don’t like these emails? [Unsubscribe](<%= unsubscribe_link %>).

![](<%= tracking_pixel %>)
