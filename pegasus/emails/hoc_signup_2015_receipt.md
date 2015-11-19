---
from: "Hadi Partovi (Code.org) <hadi_partovi@code.org>"
subject: "Thanks for signing up to host an Hour of Code!"
litmus_tracking_id: "5g5lyi1a"
---
<% hostname = CDO.canonical_hostname('hourofcode.com') %>

# Thanks for signing up to host an Hour of Code!

You're making it possible for students all around the world to learn one Hour of Code that can change the rest of their lives, during Dec. 7-13. 

*Every* Hour of Code organizer worldwide will receive a gift card to Amazon, iTunes, or Windows Store as a thank-you gift. [Details](https://<%= hostname %>/prizes).

#### We'll be in touch about new tutorials and other exciting updates. What can you do now?

## 1. Spread the word
We need your help to reach 100,000 organizers worldwide. Tell your friends about the #HourOfCode. [Use these helpful resources](https://<%= hostname %>/promote/resources) to promote your event.

<% if international == 'true' %>
## 2. Ask your whole school to offer an Hour of Code
[Send this email](https://<%= hostname %>/promote/resources#sample-emails) to your principal or [share these handouts](https://<%= hostname %>/promote/resources). 
<% else %>
## 2. Recruit your whole school for the Hour of Code and qualify to win $10,000
[Send this email](https://<%= hostname %>/promote/resources#sample-emails) to your principal or [share these handouts](https://<%= hostname %>/promote/resources).
<% end %>

## 3. Ask your employer to get involved
[Send this email](https://<%= hostname %>/promote/resources#sample-emails) to your manager, or the CEO.

## 4. Promote the Hour of Code in your community
Recruit a local group or even some friends. [Send this email](https://<%= hostname %>/resources#sample-emails).

## 5. Ask a local elected official to support the Hour of Code
[Send this email](https://<%= hostname %>/resources#politicians) to your mayor, city council, or school board and invite them to visit your school.

Thank you for leading the movement to give every student the chance to learn foundational computer science skills. 

Hadi Partovi<br />
Founder, Code.org

<hr/>
<small>
You're receiving this email because you signed up for the Hour of Code, supported by more than 200 partners and organized by Code.org. Code.org is a 501c3 non-profit. Our address is 1301 5th Ave, Suite 1225, Seattle, WA, 98101. Don't want these emails? [Unsubscribe](<%= unsubscribe_link %>).
</small>

![](<%= tracking_pixel %>)

