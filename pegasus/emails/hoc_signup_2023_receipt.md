---
from: "Hadi Partovi (Code.org) <noreply@code.org>"
reply-to: noreply@code.org
subject: "You're signed up for Hour of Code!"
---
  <% hourofcode = CDO.canonical_hostname('hourofcode.com') %>
  <% codedotorg = CDO.canonical_hostname('code.org') %>
  <% storedotcodedotorg = CDO.canonical_hostname('store.code.org') %>

## Thank you for signing up for Hour of Code!
Your event is now registered. By volunteering to host an Hour of Code event, you're making it possible for more students to learn computer science. While Hour of Code events are held all over the world during the celebration of Computer Science Education Week, you can choose to organize an Hour of Code event or events at any time! 

## Here are some steps to get started:

### 1. Plan your event
Begin by exploring our library of [Hour of Code activities](https://<%= hourofcode %>/learn) and [review this how-to guide](https://<%= hourofcode %>/how-to) for helpful tips on how to find an activity, inspire students, and determine your technology needs. Try diving into the world of artificial intelligence - an exciting area of technology that’s shaping our future. There are various approaches to AI: empower your students to [learn how AI works](https://<%= codedotorg %>/ai/how-ai-works) and your teachers to [learn with AI 101 for teachers](https://<%= codedotorg %>/ai/pl/101).

### 2. Spread the word
We need your help to inspire volunteers and organizers from across the globe. Tell your friends about your #HourOfCode and [use these helpful resources](https://<%= hourofcode %>/promote/resources) to promote your event.

You can also help engage more people from your school and community by [sending our sample emails](https://<%= hourofcode %>/promote/resources#sample-emails) to your principal, a local group, or even some friends.


### 3. Invite a local volunteer to inspire your students
[Search our volunteer map](https://<%= codedotorg %>/volunteer/local) to find volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science!

### 4. Check-out Hour of Code swag
Swag is a great way to get students excited about the Hour of Code and reward them for completing their activity. At the [Code.org store](https://<%= storedotcodedotorg %>), you can order Hour of Code swag kits, fun stickers, buttons, temporary tattoos, and more. But hurry, supplies are limited.

### 5. Encourage kids to continue learning 
An Hour of Code is just the beginning! We hear over and over again how much students love the Hour of Code and discover a newfound interest in computer science. Encourage them to continue learning. Whether you're an administrator, teacher, or advocate, we have professional learning, free classroom curriculum and lesson plans, and resources to help you [bring computer science classes to your school](https://<%= codedotorg %>/teach) or expand your offerings.  

Many of the organizations offering activities on HourofCode.com also have curriculum and professional learning available as well. We've highlighted [curriculum providers that can help you or your students go beyond an hour.](https://<%= hourofcode %>/beyond)


Hadi Partovi<br />
Founder, Code.org<br />

<hr/>
<small>
You're receiving this email because you signed up for Hour of Code, supported by more than 400 partners and organized by Code.org. Code.org is a 501c3 non-profit. Our address is [801 5th Avenue, Suite 2100, Seattle, WA 98104](https://www.google.com/maps/place/801+5th+Ave,+Seattle,+WA+98104/@47.6051193,-122.3336564,17z). Don't want these emails? [Unsubscribe](<%= local_assigns.fetch(:unsubscribe_link, "") %>).
</small>

![](<%= local_assigns.fetch(:tracking_pixel, "") %>)