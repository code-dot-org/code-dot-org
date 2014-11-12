---
title: Prizes
layout: wide
---
<div class="row">
    <h1 class="col-sm-9">The Hour of Code — prizes for every organizer</h1>
    <div class="col-sm-3 button-container centered">
        <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Sign up for a chance to win</button></a>
    </div>
</div>

<% if @country ==  'us' || @country == 'ca' %>

## One classroom will win a trip to Washington, D.C. for a historic, top-secret Hour of Code!
Code.org will select one lucky classroom to attend a very special Hour of Code event in the nation’s capital — so special that all the details are under wraps! Winning students (with chaperones) will enjoy an all-expenses-covered trip to Washington, D.C. Students will participate in a full day of top-secret activities on Monday, December 8. 

<% end %>

## Every organizer wins a thank you gift-code
Every educator who hosts an Hour of Code for students will receive 10 GB of Dropbox space or $10 Skype credit as a thank you gift!

<% if @country == 'uk' %>

## Lucky classrooms win a video chat with a guest speaker!
20 lucky classrooms will be invited to join a video chat to celebrate the Hour of Code during December 8-14. Your students will be able to ask questions and chat with technology-industry leaders. [Check out last year’s chats](http://www.youtube.com/playlist?list=PLzdnOPI1iJNckJ81gRpJe5mR7imAHDl9a) with Bill Gates, Twitter founder Jack Dorsey, Susan Wojcicki of Google and Gabe Newell of Valve.

<% end %>

<% if @country ==  'us' || @country == 'ca' %>

## 100 classrooms win a video chat with a guest speaker!

100 lucky classrooms will be invited to participate in live video Q&As with tech titans and tech-loving celebrities. Students will be able to ask questions and chat with these exciting role models to kick off your Hour of Code. 

Any classroom (public or private) within the U.S. or Canada is eligible to win this prize. Your whole school does not need to apply.

### This year's celebrity video chat  participants:
<%= view :video_chat_speakers %>

<% end %>

<% if @country == 'us' %>

## 51 schools win a class-set of laptops (or $10,000 for other technology)
One lucky school in ***every*** U.S. state (+ Washington D.C.) will win $10,000 worth of technology. Organize the Hour of Code for every student in your school to qualify. Fill out the form below to apply.

## Hardware Prize application form:
If you’ve signed up your entire school to participate in the Hour of Code, enter to win a class-set of laptops (or $10,000 for other technology) for your school! Only one teacher needs to apply for your entire school.

<%= view :hardware_prizes_form %>

<What are your odds of winning?>

<See a list of all schools signed up for the Hour of Code in your state. One public K-12 school in every U.S. state will win a class-set of laptops.>

<% end %>

<% if @country == 'ca' %>

## $2000 Brilliant Project
[Brilliant Labs](http://brilliantlabs.com/hourofcode) will provide the resources necessary, up to a value of $2000.00, to implement a technology based, hands on, student centric learning project to one classroom in each province and territory (note: with the exception of Quebec). To qualify, teachers must register at hourofcode.com/ca#signup by December 6, 2014. For more details, terms, and conditions, please visit [brilliantlabs.com/hourofcode](http://brilliantlabs.com/hourofcode).

## Lucky Schools win an Actua Workshop
15 lucky schools across Canada will be gifted 2 hands-on STEM workshops delivered by one of Actua's [33 Network Members](http://www.actua.ca/about-members/). Actua members deliver science, technology, engineering, and math (STEM) workshops that are connected to provincial and territorial learning curriculum for K-12 students. These in-classroom experiences are delivered by passionate, highly-trained undergraduate student role models in STEM. Teachers can expect exciting demonstrations, interactive experiments and a lot of STEM fun for their students! Please note that in-classroom workshop availability may vary in remote and rural communities.

[Actua](http://actua.ca/) is Canada’s leader in Science, Technology, Engineering, and Math Outreach. Each year Actua reaches over 225,000 youth in over 500 communities through its barrier-breaking programming.

## Kids Code Jeunesse will help support you in the classroom!

Are you a teacher who wants to introduce computer programming to your students and would like support in the classroom? Any teacher that would like a trained Computer Programming volunteer to assist in the classroom can contact [Kids Code Jeunesse](http://www.kidscodejeunesse.org) and we’ll work on getting you supported! [Kids Code Jeunesse](http://www.kidscodejeunesse.org) is a Canadian not for profit aimed at providing every child with the opportunity to learn to code. And every teacher the opportunity to learn how to teach computer programming in the classroom.

<% end %>

<% if @country ==  'us' || @country == 'ca' %>

## 100 classrooms will win a set of programmable robots
[Sphero](http://www.gosphero.com/) is the app-controlled robotic ball changing the way students learn. Powered by [SPRK lessons](http://www.gosphero.com/education/), these round robots give kids a fun crash course in programming while sharpening their skills in math and science. Sphero is giving away 100 classroom sets – each including 5 robots. Any classroom (public or private) within the U.S. or Canada is eligible to win this prize. 

<% end %>

## More questions about prizes?

Check out <a href="<%= hoc_uri('/prizes-terms') %>">Terms and Conditions</a> or visit our forum to see [FAQs](http://support.code.org) and ask your questions.

<% if @country == 'us' %>

# Frequently Asked Questions


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
<a style="display: block" href="<%= hoc_uri('/#join') %>"><button style="float: right;">Sign up for a chance to win</button></a>
<% end %>


