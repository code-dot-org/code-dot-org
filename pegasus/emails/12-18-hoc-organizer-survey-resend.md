---
from: 'Hadi Partovi (Code.org) <hadi_partovi@code.org>'
subject: "Update about your thank-you gift"
---
<% survey_url = "http://hourofcode.com/survey/#{Poste.encrypt(recipient.email)}" %>

Dear Hour of Code organizer,

We are re-sending your Hour of Code survey link. There was a glitch in our system that caused 82 people to receive the 2014 Hour of Code survey. You may have noticed the Skype code you requested is invalid too.

While the link looks the same, it will re-direct you to the 2015 survey and you can select a new prize.

Apologies for the issue and thank you for your support!

Thank you for hosting an Hour of Code! We promised a thank-you gift for organizers (**supplies limited**). First, we need 10-minutes of your time to help inform future Hour of Code campaigns. No matter how you did the Hour of Code, we want to know how it went and count your participation. 

**Complete [this 10-minute survey](<%= survey_url %>) by January 15, 2016 to claim your gift. Supplies limited.**

At the end of the survey, select a thank-you gift from one of the available options. **Supplies are limited so not all prize options may be available.** Your gift code will be emailed to you. Make sure to check your spam in case it ends up there.

**Note:** if you choose Dropbox and have redeemed a 10 GB Dropbox code in the past, you can only apply your new code to a *different* account or choose a different thank-you gift, if available.

Because of your passion, we are changing the face of computer science. Millions of students tried an Hour of Code last week ― coding a few lines (or a few dozen) that are the beginning of new skills and new open doors.

<% if domestic == 'true' %>  
**Beyond one hour**  
We offer high-quality, zero-cost, 1-day workshops to prepare elementary educators and content-area teachers (librarians, tech-ed specialists, etc.) to introduce computer science basics in grades K-5. [Find a workshop near you](http://code.org/professional-development-workshops).  
<% end %>

Thank you for all your support,

Hadi Partovi, Code.org

**Take [the survey](<%= survey_url %>).**

<br/>
<hr/>

<p><small>You’re receiving this email because you signed up to host an Hour of Code on <a href="https://hourofcode.com/">hourofcode.com</a>. Code.org is a 501c3 non-profit. Our address is 1301 5th Ave, Suite 1225, Seattle, WA, 98101.</small> <br />
<small><strong>Don't want these emails? <a href="<%= unsubscribe_link %>">Unsubscribe here</a>.</strong></small></p>
<p><small>Stay in touch with us. Follow Code.org on
<a href="https://www.facebook.com/Code.org">Facebook</a>, <a href="https://twitter.com/codeorg">Twitter</a>, <a href="https://instagram.com/codeorg">Instagram</a>.
</small></p>

![](<%= tracking_pixel %>)
