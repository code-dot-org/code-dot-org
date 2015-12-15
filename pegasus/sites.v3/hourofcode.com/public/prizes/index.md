---
title: <%= hoc_s(:title_prizes) %>
layout: wide
nav: prizes_nav
---


# 2015 Hour of Code prizes

<% if @country == 'la' %>

# Prizes for every organizer

Every educator who hosted an Hour of Code for students received 10 GB of Dropbox space as a thank-you gift!

<% else %>

## Prizes for EVERY organizer

**Every** educator who hosted an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png"/>

<img style="float:left;" src="/images/fit-130/apple_giftcards.png"/>

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png"/>

<p style="clear:both">&nbsp;</p>

*While supplies last

<% if @country == 'us' %>

## 51 schools won a class-set of laptops (or $10,000 for other technology)

Sign up for this prize is now closed. Check back to see this year's winners.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg"/>

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png"/>

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png"/>

<p style="clear:both; height: 0px;">&nbsp;</p>

<% end %>

<% if @country == 'us' || @country == 'ca'  %>


<a id="video-chats"></a>
## 30 classrooms won a video chat with a guest speaker

Lucky classrooms had the opportunity to talk with guest speakers who shared how computer science has impacted their lives and careers. 

<%= view :video_chat_speakers %>

<% end %>

<% if @country == 'us' %>


## One lucky classroom will win an exclusive, behind-the-scenes “Making of Star Wars” experience in San Francisco with Disney and Lucasfilm
One lucky classroom will win the grand prize – a trip to San Francisco, CA for an exclusive, behind-the-scenes “Making of Star Wars” experience with the visual effects team who worked on Star Wars: The Force Awakens. The grand prize is courtesy of [ILMxLAB](http://www.ilmxlab.com/), a new laboratory for immersive entertainment, combining the talents of Lucasfilm, Industrial Light & Magic and Skywalker Sound.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize1.jpg"/>

<img style="float: left; padding-right: 25px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize2.png"/>

<p style="clear:both; height: 0px;">&nbsp;</p>

<% end %>

<% if @country == 'us' %>



## 100 classrooms will win programmable robots including a BB-8 droid robot by Sphero
In honor of Hour of Code tutorial "Star Wars: Building a Galaxy with Code," 100 participating classrooms in the United States or Canada will a set of four Sphero 2.0 robots plus a BB-8™ App-enabled Droid that students can program. Sign up your Hour of Code event to qualify. [Learn more about BB-8 from Sphero](http://sphero.com/starwars) and [about Sphero education](http://sphero.com/education).

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-220x160/bb8.png"/>

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-200x160/bb8-girl.jpg"/>

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-300x160/sphero-robot.png"/>

<p style="clear:both; height: 0px;">&nbsp;</p>

<% end %>


<% if @country == 'ro' %>

Organizatorii evenimentelor Hour of Code în România vor beneficia de un premiu din partea Bitdefender România, constand intr-o solutie de securitate online.

<% end %>

# FAQ

## Who is eligible to receive the all organizer thank-you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank-you gift?
Organizers who signed up **before** December 11 are eligible to receive the all organizer thank-you gift. 

## When will I receive my thank-you gift?
We will contact you in December after Computer Science Education Week (<%= campaign_date('full') %>) with next steps on how to redeem your choice of thank-you gift.

## Can I redeem all of the thank-you gift options? 
No. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

## I’m outside the United States. Can I qualify for prizes?
Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %>
