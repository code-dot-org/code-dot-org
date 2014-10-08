---
layout: sendy
theme: none
subject: Calling all engineers. Worldwide. 
---
<%
  tracking_pixel = '/images/1x1.png'
  unsubscribe_link = '#'
  domestic = params['domestic'].nil? || params['domestic'] == 'true'
%>

### <%= @header['subject'] %>

Last year, 40,000 teachers led a grassroots effort called the [Hour of Code](http://hourofcode.com) – to introduce ten million students to one hour of computer science. Kids of all ages tried one hour of writing code and making apps in classrooms, and they loved it.

This year, supported by over 100 organizations, we want to reach 100 million students, across every country in the world, during Computer Science Education Week (Dec 8 – 14).

<br/>
<center>
<a href="http://hourofcode.com/"><img src="http://code.org/images/fit-250/calling-teachers.png"/></a>
</center>
<br/>

### What’s an Hour of Code?

It’s a fun introduction to computer science, for anyone to learn the basics. We provide [easy tutorials](http://code.org/learn) - featuring Mark Zuckerberg and Bill Gates - on computers, tablets, or smartphones.

### Software engineers, we need your help

1) [Donate to our crowdfunding campaign](http://code.org/donate). To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign in history](http://code.org/donate), and we need your support. Every dollar will be matched, doubling your impact 

2) Recruit a local classroom. Share this [video](http://hourofcode.com), [email](http://hourofcode.com/resources#sample-emails), and [handout](http://hourofcode.com/us/resources#handouts) with a teacher. If you have a child in elementary school, tell their teacher about our [K-5 courses](http://code.org/k5) and professional development workshops. 

3) Host an Hour of Code (with children, or at work). See this short [how-to guide](http://hourofcode.com/us/resources/how-to).

4) Spread the word. [Share on Facebook](https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fhourofcode.com%2Fus), [post to Twitter](https://twitter.com/share?hashtags=&amp;related=codeorg&amp;text=I%27m+participating+in+this+year%27s+%23HourOfCode%2C+are+you%3F+%40codeorg&amp;url=http%3A%2F%2Fhourofcode.com).

<% unless domestic %>

5) Our courses are available in 30 languages. [Help us translate](http://code.org/translate). Help us reach non-English-
speaking schools

<% end %>

### Welcome to the 21st Century

Computer science is foundational for all students. Yet most schools don’t teach it, and most students never get a chance to try it. We owe it to our children to give them one hour. 

Together, we’re making history. Please support our work.

Hadi Partovi<br/>
Founder, Code.org

<hr>

You signed our petition at http://code.org, to bring computer science to all our schools. Code.org is a 501c3 non-profit. Our address is 1301 5th Ave, Suite 1225, Seattle, WA, 98101. Don't like these emails? [Unsubscribe](<%= unsubscribe_link %>).

![](<%= tracking_pixel %>)
