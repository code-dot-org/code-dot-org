---
from: 'Hadi Partovi (Code.org) <hadi_partovi@code.org>'
subject: "Your gift code"
---
<% survey_url = "http://hourofcode.com/survey/#{Poste.encrypt(recipient.email)}" %>

Thank you! Use this code to redeem your gift:  <<SKYPE/DROPBOX CODE>>


## If you enjoyed the Hour of Code, consider going beyond

<% if country == 'us'  && students == (pre-K || 1st || 2nd || 3rd || 4th || 5th) %>

Our learning platform Code Studio offers [multiple 20-lesson courses for elementary grades](https://code.org/k5).  We offer high-quality one day weekend-workshops with computer science experts to help you get started. [Find a workshop near you](https://code.org/k5). 

<% else %>

Across all grade levels, there are [student-guided learning options for students](https://code.org/learn/beyond), and [educational/curriculum resources for teachers](https://code.org/educate/3rdparty). Our own Code Studio offers [courses for elementary grades](https://code.org/k5). Please recruit teachers to help expose the youngest students to computer science at an early age. 

<% end %>

<% if event_location == (public || charter || private || religious || after school) %>

## Ask us to visit your school
While we get asked often, we’re usually not able to speak at school assemblies, but we'd love to help *when* we can. If you’re interested is hosting a Code.org ambassador, [let us know here](http://code.org/k5) and we’ll reach out if a visit becomes possible.

<% end %>

<% if organizer_type == computer science teacher || plan to teach follow on course == yes %>

## Add your classroom to the Code.org map

If you’re teaching computer science or computer programming, we’d love to include your class in our classroom database for students and parents. 

Step 1) Please [check if your classroom or course is already listed on the map](http://code.org/learn/local).  
Step 2) If it’s not, please [add it by submitting information on your class](http://code.org/schools/new).

<% end %>

<% if country != 'us' %>
## Want to get more involved in <<your country>>?
[Join our international mailing list](https://docs.google.com/forms/d/1qYJFBjXRRiCchqtYunTUy7qyYwNHpUIZKAxh1T-bGL8/viewform) to be updated by our international partners, and find out how you can promote computer science education near you.
<% end %>



<br/>
<hr/>

You’re receiving this email because you signed up to host an Hour of Code at [hourofcode.com](https://hourofcode.com/). We’ll send you only a few updates a year on new ways to learn. Don’t like these emails? [Unsubscribe](<%= unsubscribe_link %>).

![](<%= tracking_pixel %>)
