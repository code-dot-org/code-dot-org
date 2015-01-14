---
title: Prizes
layout: wide
<% if @country ==  'us' || @country == 'ca' %>nav: prizes_nav<% end %>
---
<div class="row">
    <h1 class="col-sm-9">Prizes for every organizer</h1>
</div>

<% if @country ==  'us' %>

<h2 id="dc">One classroom will win a trip to Washington, D.C. for a historic, top-secret Hour of Code!</h2>
Code.org will select one lucky classroom to attend a very special Hour of Code event in the nation’s capital — so special that all the details are under wraps! Winning students (with chaperones) will enjoy an all-expenses-covered trip to Washington, D.C. Students will participate in a full day of top-secret activities on Monday, December 8. 

<% end %>

<% if @country == 'us' %>

<h2 id="hardware_prize" style="font-size: 18px">51 schools win a class-set of laptops (or $10,000 for other technology)</h2>
One lucky school in ***every*** U.S. state (+ Washington D.C.) won $10,000 worth of technology. [**See all 51 winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners)

<% end %>


<% if @country == 'uk' %>

<h2 id="video_chat">Lucky classrooms win a video chat with a guest speaker!</h2>
20 lucky classrooms will be invited to join a video chat to celebrate the Hour of Code during December 8-14. Your students will be able to ask questions and chat with technology-industry leaders. **The submission period has ended. Winners will be announced soon.**

<% end %>

<% if @country ==  'us' || @country == 'ca' %>

<h2 id="video_chat">100 classrooms win a video chat with a guest speaker!</h2>

100 lucky classrooms are invited to participate in live video Q&As with tech titans and tech-loving celebrities. Students will be able to ask questions and chat with these exciting role models to kick off your Hour of Code.

### Tune into the live chats, or watch the video archives:

**TUESDAY**, December 9 <br />
10:00 AM PST - [Lyndsey Scott](http://www.youtube.com/watch?v=6s5oxGmbXy4) <br />
12:00 PM PST - [Jack Dorsey](http://www.youtube.com/watch?v=PBGJfpbSWjY) <br />
3:00 PM PST - [Ashton Kutcher](http://www.youtube.com/watch?v=d1LuhJPJP9s) <br />

**WEDNESDAY**, December 10 <br />
7:30 AM PST - [Cory Booker](http://www.youtube.com/watch?v=wD0Heuvv87I) <br />
10:00 AM PST - [JR Hildebrand](http://www.youtube.com/watch?v=DfhAdnosy58) <br />
11:00 AM PST - [Clara Shih](http://www.youtube.com/watch?v=2p7uhb1qulA) <br />
12:00 PM PST - [Jessica Alba](http://youtu.be/m4oEbAQbWCE) <br />

**THURSDAY**, December 11 <br />
5:30 AM PST - [Karlie Kloss](http://www.youtube.com/watch?v=6SzsRGTmjy0) <br />
9 AM PST - [David Karp](http://www.youtube.com/watch?v=1tVei0jOyVQ) <br />
10 AM PST - [Jess Lee](http://www.youtube.com/watch?v=wXKPrtfaoi8) <br />
11 AM PST - [Usher](http://www.youtube.com/watch?v=xvQSSaCD4yw) <br />

**FRIDAY**, December 12 <br />
10:00 AM PST - [Hadi Partovi](http://www.youtube.com/watch?v=PDnjt6iIBzo)

\*Recordings of Bill Gates and Sheryl Sandberg chats will be available on [our YouTube channel](https://www.youtube.com/user/CodeOrg/)

### This year's celebrity video chat  participants:
<%= view :video_chat_speakers %>

<% end %>


<h2 id="gift_code">Every organizer wins a thank you gift-code</h2>
Every educator who hosts an Hour of Code for students will receive 10 GB of Dropbox space or $10 Skype credit as a thank you gift!

<% if @country == 'ca' %>

<h2 id="brilliant_project">$2000 Brilliant Project</h2>
[Brilliant Labs](http://brilliantlabs.com/hourofcode) will provide the resources necessary, up to a value of $2000.00, to implement a technology based, hands on, student centric learning project to one classroom in each province and territory (note: with the exception of Quebec). To qualify, teachers must register at hourofcode.com/ca#signup by December 6, 2014. For more details, terms, and conditions, please visit [brilliantlabs.com/hourofcode](http://brilliantlabs.com/hourofcode).

<h2 id="actua_workshop">Lucky Schools win an Actua Workshop</h2>
15 lucky schools across Canada will be gifted 2 hands-on STEM workshops delivered by one of Actua's [33 Network Members](http://www.actua.ca/about-members/). Actua members deliver science, technology, engineering, and math (STEM) workshops that are connected to provincial and territorial learning curriculum for K-12 students. These in-classroom experiences are delivered by passionate, highly-trained undergraduate student role models in STEM. Teachers can expect exciting demonstrations, interactive experiments and a lot of STEM fun for their students! Please note that in-classroom workshop availability may vary in remote and rural communities.

[Actua](http://actua.ca/) is Canada’s leader in Science, Technology, Engineering, and Math Outreach. Each year Actua reaches over 225,000 youth in over 500 communities through its barrier-breaking programming.

**Congratulations to the 2014 winners!**

|School|City|Actua Network Member|
|---|---|---|
|Spencer Middle School|Victoria|Science Venture|
|Malcolm Tweddle School|Edmonton|DiscoverE|
|Britannia Elementary|Vancouver|GEERing Up|
|Captain John Palliser|Calgary|Minds in Motion|
|St. Josaphat School|Regina|EYES|
|Bishop Roborecki School|Saskatoon|SCI-FI|
|Dalhousie Elementary School|Winnipeg|WISE Kid-Netic Energy|
|Hillfield Strathallan College|Hamilton|Venture Engineering and Science|
|Byron Northview Public School|London|Discovery Western|
|Stanley Public School|Toronto|Science Explorations|
|Ottawa Catholic School Board|Ottawa|Virtual Ventures|
|École Arc-en-Ciel|Montreal|Folie Technique|
|Saint Vincent Elementary School|Laval|Musee Armand Frappier|
|Garden Creek School|Fredericton|Worlds UNBound|
|Armbrae Academy|Halifax|SuperNOVA|

<h2 id="kids_code">Kids Code Jeunesse will help support you in the classroom!</h2>

Are you a teacher who wants to introduce computer programming to your students and would like support in the classroom? Any teacher that would like a trained Computer Programming volunteer to assist in the classroom can contact [Kids Code Jeunesse](http://www.kidscodejeunesse.org) and we’ll work on getting you supported! [Kids Code Jeunesse](http://www.kidscodejeunesse.org) is a Canadian not for profit aimed at providing every child with the opportunity to learn to code. And every teacher the opportunity to learn how to teach computer programming in the classroom.

<% end %>

<% if @country ==  'us' || @country == 'ca' %>

<h2 id="programmable_robots">100 classrooms will win a set of programmable robots</h2>
[Sphero](http://www.gosphero.com/) is the app-controlled robotic ball changing the way students learn. Powered by [SPRK lessons](http://www.gosphero.com/education/), these round robots give kids a fun crash course in programming while sharpening their skills in math and science. Sphero is giving away 100 classroom sets – each including 5 robots. Any classroom (public or private) within the U.S. or Canada is eligible to win this prize.

<% end %>

<h2 id="more_questions">More questions about prizes?</h2>

Check out <a href="<%= hoc_uri('/prizes-terms') %>">Terms and Conditions</a> or visit our forum to see [FAQs](http://support.code.org) and ask your questions.

<% if @country == 'us' %>

<h1 id="faq">Frequently Asked Questions</h1>

## If I received Dropbox space as a gift last year, can I get it again?

If you have redeemed a 10 GB Dropbox code in the past, you can only apply your new code to a *different* account or choose Skype credit as your gift. Dropbox space is valid for one year after it is applied to your account. 


## Does your whole school have to enter to win the $10,000 in hardware?

Yes. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form <a href="<%= hoc_uri('/prizes') %>">here</a>.


## Does your whole school have to enter to win a the tech chat?
Any classroom (public or private school) is eligible to win this prize. Your whole school need not apply.


## Can non-public schools win the video chat prize?

Yes! Private and independent schools are eligible along with public schools to win the video chat prizes.

## Can non-US schools win the video chat prize?

No, unfortunately, because of logistics we are unable to offer the video chat prize to schools outside of the U.S. and Canada. All international organizers **are** eligible to receive Dropbox space or Skype credit.

## Why is the $10,000 hardware prize only available to public schools?

We would love to help teachers in public and private schools alike, but at this time, it comes down to logistics. We have partnered with [DonorsChoose.org](http://donorschoose.org) to administer classroom funding prizes, which only works with public, US K-12 schools. According to DonorsChoose.org, the organization is better able to access consistent and accurate data that's available for public schools.

## I’m outside the United States. Can I qualify for prizes?

Due to a small full-time staff, Code.org is unable to handle the logistics of administering international prizes. Because of this people outside the US are unable to qualify for prizes.

## When is the deadline to apply for the hardware prize?

To qualify, your entire school must register for the Hour of Code as well as complete the <a href="<%= hoc_uri('/prizes') %>">Hardware Application form</a> by November 14, 2014. One school in every U.S. state will receive a class-set of computers. Code.org will select and notify winners via email by December 1, 2014.


## When is the deadline to be eligible to win a tech chat?

To qualify, you must register your classroom for the Hour of Code by November 14, 2014. Classrooms will win a video chat with a celebrity. Code.org will select and notify winners via email by December 1, 2014.

## When will I be notified if my school or classroom wins a prize?

To qualify, your entire school must register for the Hour of Code as well as complete the <a href="<%= hoc_uri('/prizes') %>">Hardware Application form</a> by November 14, 2014. Code.org will select and notify winners via email by December 1, 2014.

## If my whole school can’t do the Hour of Code during Computer Science Education Week (Dec. 8-14), can I still qualify for prizes?
Yes, just be sure to submit a logistics plan that outlines how your whole school is participating over a reasonable length of time and register for the Hour of Code by November 14th.
<% end %>


