---
from: 'Sarah Fairweather (Code.org) <teacher@code.org>'  
subject: "Sorry to bear bad news..."
---
Hi <%= preferred_first_name_s %>,

Thank you for applying to Code.org’s Professional Learning Program for CS Discoveries. 
We really appreciated the opportunity to read your application and learn more about your 
interest in teaching computer science.

<% if regional_partner_name_s.blank? %>

Our current program model prioritizes candidates in areas where Code.org has established 
Regional Partners who provide continued learning support throughout the year. 

Unfortunately, without a local Partner to facilitate your professional development, 
we cannot offer you a space in the full Professional Learning Program experience this year. 

As we continue to grow, we plan to establish more local partnerships. We’d love your help 
in identifying organizations in your area to become Regional Partners. See our 
[Partner page](https://code.org/educate/regional-partner) for more information.

<% else %>

We’re unfortunately unable to offer you a space this year. Due to record interest in 
this year’s program and limited space, we don’t have the capacity to accept all applicants. 

<% end %>

Please remember that all of our curricula are free online, so you can teach our courses even 
if you are not part of the Professional Learning Program. Be sure to check out our 
[curriculum and resources](http://code.org/educate/csd), and 
[join our forum](https://forum.code.org/) to connect with other computer science teachers across the 
country for support and advice.

We wish you the best in the upcoming year, and sincerely thank you for your commitment to 
making computer science available for all students.

Thank you,  
Sarah Fairweather  
Code.org Teacher Development Program Manager
