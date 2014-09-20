---
title: "Lesson 10: The Internet"
view: page_curriculum
theme: none
---

<!--
live preview (once saved to dropbox) is at http://staging.code.org/curriculum/4-5/10-TheInternet/Teacher.  don't share this URL!
-->

<%= partial('curriculum_header', :unitnumber=>1, :unittitle=>'A Bit of Everything', :lesson=>10, :title=> 'The Internet', :time=>60, :days=>1) %>

[content]

## K-1 Lesson Overview (Discovery, New Learning, Guided Practice, Creative, Assessment -pick one)
In this lesson, students will pretend to flow through the Internet, all the while learning about web addresses, IPs and the DNS.


[summary]
## Teaching Summary
Students will learn how the Internet works, as it relates to URL addresses and web pages.


### **Getting Started** - 15 minutes

1) Review  
2) Introduce 

### **Activity** - 30  minutes  

3) 

### **Wrap-up** - 5  minutes 
4) Reflection


[/summary]

## Lesson Objectives 

Students will:

  - Learn about the complexity of sending messages over the Internet  
- Translate web addresses into IP addresses   
- Practice creative problem solving






# Teaching Guide
## Materials, Resources and Prep

- DNS Translation Table  
- Server Address Name Tags  
- Message Packets  
- #10 envelopes  
- Scissors



### For the Teacher

- Print out some special messages and images from Message Packets.  
- Write a copy of the DNS Translation Table on the board or use with document camera  
- Print out Server Address Name Tags  
- Bundle messages together with the URL to which it’s going and the method of transfer (DSL/Cable, Wi-Fi, or fiber)



## Getting Started (15 min)
### 1)Review 
This review segment is intended to get the class thinking back to the last lesson.  If you are covering these activities out of order, please substitute your own review subjects here.

> **Class Participation Questions**:  
 - What is debugging?  
- Why is it important?

> **Elbow Partner Discussion**:
 - 

### 2) Introduce  
Let students know that the Internet is a busy place.  It may seem like everything happens instantly, but in reality, there is a lot of information traveling through virtual channels at all times of the day and night.  

This is a good time to inject an Internet Safety lecture, if you haven’t already.  After you warn of the do’s and don’ts of worldwide communication, it’s time to move on to teaching students how it all works.

Ask students how they would get to your school’s website.  Many of them will offer a solution similar to:

<center>“ type www.SCHOOLNAME.com into my web browser” or
“enter school name on a search engine”</center>

While that might be true, it’s worth mentioning that there is no “SCHOOLNAME.com” place that information can travel to.  All addresses inside the Internet are actually combinations of numbers, rather than names.  It’s kind of like your telephone. You may call someone by selecting “Grandma’s Cell” from your address book, but underneath, it’s really dialing a ten-digit number.  Something similar happens with web pages.

When you ask for “SCHOOLNAME.com” the inquiry goes out to the Internet to translate that name into an IP address.  After a series of steps, the inquiry comes upon the DNS TranslationTable, where it can get the numerical version of the URL address that you originally entered.  At last, you have the number of the place where you are going to send or receive your information, but that’s only part of the challenge.

Believe it or not, the Internet isn’t able to send and receive an unlimited amount of information at one time.  Think of it like trying to send all of your  favorite pictures to your grandma in just one single envelope.  It just wouldn’t all fit.  Instead, you need to break your message up into smaller pieces.  You can send a series of these envelopes to your grandma, each with its own “packet.”  

So, what if there is a delay in the mail and a few of the envelopes come at the wrong time and a few of the envelopes are missing altogether?  How can she know if all of the envelopes arrived?  How can she know which ones are missing, or what order to open them?

To solve that problem, we can number each of the envelopes as X of Y.  That is to say, if one of our messages is cut into 10 pieces, we will label the pieces 1 of 10, 2 of 10, and so on. 

Now we’re going to play an Internet game.  We will have five students come to the front of the class and get ready to deliver messages to five students standing in the back of the class.  First, we will need five volunteers to be Internet Users in the front.  Next, five users to be Servers in the back.

The Servers will all have numbers that they can hold to identify where each Internet User needs to go. These are called IP addresses.

The Internet Users will select a message from the pile.  Each message tells us the URL where it needs to be delivered, how many pieces it must be broken into, and what method it is using to be delivered (fiber, Wi-Fi, or DSL/Cable).  The Internet User has to:
> 1)  Translate the URL to an IP address using the DNS Translation Table on the board.  
2)  Rip the message into the number of pieces mentioned on the envelope.  
3)  Number each piece appropriately  
4)  Carry the message, one piece at a time, to the Server in the method appropriate for the transmission type:  
> > - Fiber gets to carry its messages with one hand.  
- DSL/Cable must carry its messages on its head.  
- Wi-Fi carries its messages on its head also, but the teacher will randomly walk up and try to blow the piece of paper away. 

> > Whenever a piece of the message touches the ground, it is considered a “dropped packet” and the Internet User must ignore that packet until the rest of the pieces have been delivered, then return to the front of the room and re-deliver any dropped packets.

> 5) Servers will put all messages back together on their side of the room. The game is over when all Servers have completed and read their messages out loud.

Which method of delivery was easiest to complete without dropping a packet?
If Wi-Fi drops so many packets, why do you suppose it is still used?
Do you think it is possible to create a method of delivery that doesn’t require cables but is more reliable than radio waves?  What might that look like?



## Activity: The Internet (30 min)
### Steps
1) Describe the Internet and DNS to students.  
2) Explain the Internet Game.  
3) Choose volunteers to act as Internet Users, and an equal number to be Servers.  
4) Give each server an IP address.  
5) Give each Internet User a message with instructions for delivery.  
6) Internet User must prepare message for delivery as noted, translate the URL to an IP address, then deliver in the style required by the type of transmission.  
7) Server can put message back together in order and the game is complete when all Servers have read their messages.

### Rules
- Fiber gets to carry its messages with one hand.  
- DSL/Cable must carry its messages on its head.  
- Wi-Fi carries its messages on its head also, but the teacher will randomly walk up and try to blow the piece of paper away.

### Adjustments
K-2: This is far more complicated than a group of young children can expect to comprehend in one lesson.  As an adaptation, you may choose to break into one of three points to illustrate:

* Big messages can be broken into little chunks and delivered in order, where they can be put back together on the other side.  
* Some methods of delivery are more reliable than others (Relay with fiber, Wi-Fi, DSL/Cable).  
* URLs are translated into IP addresses using a DNS Translation Table.

3-5: Analyze whether your students are prepared for the full extent of this game.  If not, you can combine any number of the K-2 pieces into a game that begins to get the ideas across.

6-8: You should be able to play the game just about as described. If the game seems too simple for your students, add an extra step where the Server has to relay the information to a third party. This is a more accurate version of how message delivery actually works, since a message is rarely just left on the server.

### Samples
**DNS Translation Table**

|Address|  |I.P. Address|
|---|---|---|
|www.WeGotThis404.com | &nbsp;&nbsp;&nbsp; | 192.155.0.3 |
|www.YouRockUno.com | &nbsp;&nbsp;&nbsp; | 194.102.15.2 |
|www.TeamWooHoo.com | &nbsp;&nbsp;&nbsp; | 198.23.06.1 |
|www.SmartyAtTheParty.com | &nbsp;&nbsp;&nbsp; | 172.16.254.1 |
|www.AllTheBestest.com | &nbsp;&nbsp;&nbsp; | 172.16.0.0 |

<hr>
**Number of Pieces: 7  
To URL: www.WeGotThis404.com  
Using: Fiber**
<br><br>

<font size="9"> **This is a note to you.<br><br>From me!**</font>


<hr>
**Number of Pieces: 3  
To URL: www.WeGotThis404.com  
Using: Wi-Fi**
<br><br>
<font size="9"> **My note says less than your note!**</font>

<hr>
**Number of Pieces: 5  
To URL: www.AllTheBestest.com  
Using: DSL/Cable**
<br><br>
<font size="9"> **Here is a note!<br><br>
It’s just for you.**</font>



 



## Wrap-up (5 min)
### 4) Reflection 



## Extended Learning 


## Vocabulary


**IP (Internet Protocol)** - An agreed upon set of requirements for delivering packets across a network

**IP Address** - A number assigned to any item that is connected to the Internet

**DNS (Domain Name Service)** - The service that translates URLs to IP addresses

**URL (Universal Resource Locator)** - An easy-to-remember address for calling a web page (like www.code.org)

**Internet** - A group of computers and servers that are networked together

**Network** - A group of things that are connected to each other

**Packets** - Small chunks of information that have been carefully formed from larger chunks of information

**Routing** - Finding the best path through a network

**Servers** - Computers that exist only to provide information to others

**Fiber-Optic Cable** - A cable that uses light to send information (often shortened to “fiber”)

**Wi-Fi** - A wireless method of sending information using radio waves

**DSL/Cable** - A method of sending information using telephone or television cables


[/content]
