---
from: "Hadi Partovi (Code.org) <hadi_partovi@code.org>"
subject: "You’re signed up for the Hour of Code!"
---
  <% hourofcode = CDO.canonical_hostname('hourofcode.com') %>
  <% codedotorg = CDO.canonical_hostname('code.org') %>
  <% storedotcodedotorg = CDO.canonical_hostname('store.code.org') %>

### Thank you for signing up for the Hour of Code!
Your event is now registered. By volunteering to host an Hour of Code, you’re making it possible for more students to get the chance to learn computer science. While Hour of Code events are held all over the world during the celebration of Computer Science Education Week, you can choose to organize an Hour of Code any time! 

## Here are some steps to get started:

### 1. Start planning your event
Explore our library of [Hour of Code activities](https://<%= hourofcode %>/learn) and [review this how-to guide](https://<%= hourofcode %>/how-to) for helpful tips on how to inspire students, determine your technology needs, and more. 

### 2. Spread the word and recruit more people
We need your help to inspire volunteers and organizers from across the globe. Tell your friends about the #HourOfCode and [use these helpful resources](https://<%= hourofcode %>/promote/resources) to promote your event.

You can also help recruit more people from your school and community by [sending our sample emails](https://<%= hourofcode %>/promote/resources#sample-emails) to your principal, a local group, or even some friends.


### 3. Invite a local volunteer to inspire your students
[Search our volunteer map](https://<%= codedotorg %>/volunteer/local) to find volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

### 4. Check-out Hour of Code swag
Swag is a great way to get students excited about the Hour of Code and reward them for completing their activity. At the Code.org [Amazon store](https://www.amazon.com/stores/page/8557B2A6-EBF2-4C9F-95C5-C3256FBA0220), you can [order posters](https://www.amazon.com/dp/B07J6T18DH?m=A2ZEA2ORKPFEVK) with inspirational role models, Hour of Code kits, fun stickers, and more! But hurry, supplies are limited.

### Encourage kids to continue learning 
<% if form.data["hoc_event_country_s"] == 'US' %> An Hour of Code is just the beginning! We hear over and over again how much students love the Hour of Code and discover a newfound interest in computer science. Encourage them to continue learning. Whether you’re an administrator, teacher, or advocate, we have professional learning, curriculum, and resources to help you [bring computer science classes to your school](https://<%= codedotorg %>/yourschool) or expand your offerings.  

Many of the organizations offering activities on HourofCode.com also have curriculum and professional learning available as well. We've highlighted [curriculum providers that can help you or your students go beyond an hour.](https://<%= hourofcode %>/beyond) 

<% else %> An Hour of Code is just the beginning! We hear over and over again how much students love the Hour of Code and discover a newfound interest in computer science. Encourage them to continue learning. 

Many of the organizations offering Hour of Code lessons also have curriculum available to go further. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://<%= hourofcode %>/beyond)

Code.org also offers full [introductory computer science courses](https://<%= codedotorg %>/educate/curriculum/cs-fundamentals-international) translated into over 67 languages at no cost to you or your school. <% end %> Thank you for leading the movement to give every student the chance to learn foundational computer science skills.


Hadi Partovi<br />
Founder, Code.org<br />

<hr/>
<small>
You're receiving this email because you signed up for the Hour of Code, supported by more than 200 partners and organized by Code.org. Code.org is a 501c3 non-profit. Our address is [1501 4th Avenue, Suite 900, Seattle, WA 98101](https://maps.google.com/?q=1501+4th+Avenue,+Suite+900,+Seattle,+WA+98101&entry=gmail&source=g). Don't want these emails? [Unsubscribe](<%= local_assigns.fetch(:unsubscribe_link, "") %>).
</small>

![](<%= local_assigns.fetch(:tracking_pixel, "") %>)