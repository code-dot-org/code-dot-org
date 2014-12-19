---
from: 'Hadi Partovi (Code.org) <hadi_partovi@code.org>'
subject: "Your gift code"
---
<%
  prize_choice_s = 'Skype'
  prize_code_s = '1234'
  country_s = 'us'
  grade_s = '1st'
  event_location_s = 'public'
  organizer_type_s = 'computer science teacher'
  plan_to_teach_follow_on_course_s = 'yes'
%>

## Thank you! Use this code to redeem your gift:

- Gift Type: <%= prize_choice_s %>
- Gift Code: `<%= prize_code_s %>`

## If you enjoyed the Hour of Code, consider going beyond

<% if country_s == 'us'  && ['pre-K','1st','2nd','3rd','4th','5th'].include?(grade_s) %>

Our learning platform Code Studio offers [multiple 20-lesson courses for elementary grades](https://code.org/k5).  We offer high-quality one day weekend-workshops with computer science experts to help you get started. [Find a workshop near you](https://code.org/k5). 

<% else %>

Across all grade levels, there are [student-guided learning options for students](https://code.org/learn/beyond), and [educational/curriculum resources for teachers](https://code.org/educate/3rdparty). Our own Code Studio offers [courses for elementary grades](https://code.org/k5). Please recruit teachers to help expose the youngest students to computer science at an early age. 

<% end %>

<% if ['public','charter','private','religious','after school'].include?(event_location_s) %>

## Ask us to visit your school
While we get asked often, we’re usually not able to speak at school assemblies, but we'd love to help *when* we can. If you’re interested is hosting a Code.org ambassador, [let us know here](http://code.org/k5) and we’ll reach out if a visit becomes possible.

<% end %>

<% if organizer_type_s == 'computer science teacher' || plan_to_teach_follow_on_course_s == 'yes' %>

## Add your classroom to the Code.org map

If you’re teaching computer science or computer programming, we’d love to include your class in our classroom database for students and parents. 

Step 1) Please [check if your classroom or course is already listed on the map](http://code.org/learn/local).  
Step 2) If it’s not, please [add it by submitting information on your class](http://code.org/schools/new).

<% end %>

<% if country_s != 'us' %>
## Want to get more involved in <%= country_s ? country_s : 'your country' %>?
[Join our international mailing list](https://docs.google.com/forms/d/1qYJFBjXRRiCchqtYunTUy7qyYwNHpUIZKAxh1T-bGL8/viewform) to be updated by our international partners, and find out how you can promote computer science education near you.
<% end %>



<br/>
<hr/>

You’re receiving this email because you signed up to host an Hour of Code at [hourofcode.com](https://hourofcode.com/). We’ll send you only a few updates a year on new ways to learn. Don’t like these emails? [Unsubscribe](<%= unsubscribe_link %>).

![](<%= tracking_pixel %>)

