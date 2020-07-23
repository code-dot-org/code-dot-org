---
from: 'Hadi Partovi (Code.org) <hadi_partovi@code.org>'
subject: "Your gift code"
---
## Thank you! Use this code to redeem your gift:

- Gift Type: <%= local_assigns.fetch(:prize_choice_s, "") %>
- Gift Code: `<%= local_assigns.fetch(:prize_code_s, "") %>`

<% if defined?(prize_choice_s) && prize_choice_s == "Dropbox" %>
Note: Dropbox space expires 1 year after it's applied to your account. Limit one redemption per organizer. Redeem your gift at [https://www.dropbox.com/coupons](https://www.dropbox.com/coupons).
<% end %>

<% if defined?(prize_choice_s) && prize_choice_s == "Skype" %>

**To redeem your Skype gift code:**
1. Sign into your Skype account [on your browser](http://www.skype.com/go/myaccount).
2. Scroll down to "Billing and Payments" and click "Redeem Voucher."

![image](https://code.org/images/email/fit-200/skype_redeem_voucher.jpg)

3. Enter your voucher number and submit.

<% end %>

## If you enjoyed the Hour of Code, consider going beyond

<% if defined?(event_country_s) && event_country_s == 'United States' && ((['Pre-kindergarten','Kindergarten','1st','2nd','3rd','4th','5th','6th'] & students_grade_levels_ss).first) %>

Our learning platform Code Studio offers [multiple 20-lesson courses for elementary grades](https://code.org/k5).  We offer high-quality one day weekend-workshops with computer science experts to help you get started. [Find a workshop near you](https://code.org/k5). 

<% else %>

Across all grade levels, find [student-guided learning options](https://code.org/learn/beyond) and [educational/curriculum resources for teachers](https://code.org/educate/3rdparty). Our own Code Studio offers [courses for elementary grades](https://code.org/k5). Please, recruit more teachers to help expose the youngest students to computer science at an early age. 

<% end %>

<% if defined?(event_location_type_s) && ['Public school','Public charter school','Private school','Parochial/Religious school','After school'].include?(event_location_type_s) %>

## Ask us to visit your school
While we get asked often, we’re usually not able to speak at school assemblies, but we'd love to help *when* we can. If you’re interested in hosting a Code.org ambassador, [let us know here](http://code.org/visit) and we’ll reach out if a visit becomes possible.

<% end %>

<% if local_assigns.fetch(:teacher_description_s, "") == 'Computer Science teacher' || local_assigns.fetch(:teacher_plan_teach_cs_s, "") == 'Yes' %>

## Add your classroom to the Code.org map

If you’re teaching computer science or computer programming, we’d love to include your class in our classroom database for students and parents. 

Step 1) Check if your classroom or course is [already listed on the map](http://code.org/learn/local).  
Step 2) If it’s not, please [add it by submitting information on your class](http://code.org/schools/new).

<% end %>

<% if local_assigns.fetch(:event_country_s, "") != 'United States' %>
## Want to get more involved in <%= local_assigns.fetch(:event_country_s, 'your country') %>?
[Join our international mailing list](https://docs.google.com/forms/d/1qYJFBjXRRiCchqtYunTUy7qyYwNHpUIZKAxh1T-bGL8/viewform) to be updated by our international partners, and find out how you can promote computer science education near you.
<% end %>



<p><br/>
<hr/></p>

You’re receiving this email because you signed up to host an Hour of Code at [hourofcode.com](https://hourofcode.com/). We’ll send you only a few updates a year on new ways to learn or help. Don’t like these emails? [Unsubscribe](<%= local_assigns.fetch(:unsubscribe_link, "") %>).

![](<%= local_assigns.fetch(:tracking_pixel, "") %>)

