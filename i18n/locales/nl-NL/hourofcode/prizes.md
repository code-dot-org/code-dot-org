* * *

Titel: prijzen lay-out: breed < % als @country == 'us' || @country == 'ca' % > nav: prizes_nav<% end %>

* * *

<div class="row">
  <h1 class="col-sm-9">
    Prijzen voor elke organisator
  </h1>
</div>

<% if @country == 'us' %>

## Een klas wint een reis naar Washington, DC voor een historische, top-secret Uur Code! {#dc}

Code.org zal een gelukkige klas uitkiezen om een zeer speciaal Uur Code bij te wonen in de hoofdstad — zo speciaal dat alle details stikt geheim zijn! Winnende leerlingen (met begeleiders) zullen kunnen genieten van een volledig betaalde trip baar Washington D.C. Leerlingen zullen er op maandag 8 december een ganse dag deelnemen aan ultra-geheime activiteiten.

<% end %>

<% if @country == 'us' %>

<h2 id="hardware_prize" style="font-size: 18px">
  51 Winnende scholen krijgen een set laptops voor in de klas (of $10.000 voor andere technologie)
</h2>

Een gelukkige school in ***elke*** Amerikaanse staat (+ Washington D.C.) wint ter waarde van $10000 aan technologie. [**Bekijk alle 51 winnaars**](http://codeorg.tumblr.com/post/104109522378/prize-winners)

<% end %>

<% if @country == 'uk' %>

## Winnende klaslokalen winnen een video-chat met een gastspreker! {#video_chat}

20 lucky classrooms will be invited to join a video chat to celebrate the Hour of Code during December 8-14. Your students will be able to ask questions and chat with technology-industry leaders. **De periode om in te schrijven is afgelopen. Winnaars zullen binnenkort worden bekendgemaakt.**

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## 100 klassen winnen een video-chat met een gastspreker! {#video_chat}

100 lucky classrooms are invited to participate in live video Q&As with tech titans and tech-loving celebrities. Students will be able to ask questions and chat with these exciting role models to kick off your Hour of Code.

### Tune into the live chats, or watch the video archives:

**Dinsdag**, December 9   
10:00 AM PST - [Lyndsey Scott](http://www.youtube.com/watch?v=6s5oxGmbXy4)   
12:00 PM PST - [Jack Dorsey](http://www.youtube.com/watch?v=PBGJfpbSWjY)   
3:00 PM PST - [Ashton Kutcher](http://www.youtube.com/watch?v=d1LuhJPJP9s)   


**WEDNESDAY**, December 10   
7:30 AM PST - [Cory Booker](http://www.youtube.com/watch?v=wD0Heuvv87I)   
10:00 AM PST - [JR Hildebrand](http://www.youtube.com/watch?v=DfhAdnosy58)   
11:00 AM PST - [Clara Shih](http://www.youtube.com/watch?v=2p7uhb1qulA)   
12:00 PM PST - [Jessica Alba](http://youtu.be/m4oEbAQbWCE)   


**THURSDAY**, December 11   
5:30 AM PST - [Karlie Kloss](http://www.youtube.com/watch?v=6SzsRGTmjy0)   
9 AM PST - [David Karp](http://www.youtube.com/watch?v=1tVei0jOyVQ)   
10 AM PST - [Jess Lee](http://www.youtube.com/watch?v=wXKPrtfaoi8)   
11 AM PST - [Usher](http://www.youtube.com/watch?v=xvQSSaCD4yw)   


**Vrijdag**, December 12   
10:00 AM PST - [Hadi Partovi](http://www.youtube.com/watch?v=PDnjt6iIBzo)

&#42;-Opnames van Bill Gates en Sheryl Sandberg chats zullen beschikbaar zijn op [ons YouTube-kanaal](https://www.youtube.com/user/CodeOrg/)

### De deelnemers aan de beroemdheden video chat van dit jaar zijn:

<%= view :video_chat_speakers %>

<% end %>

## Iedere organisator wint een "bedankt" geschenk-code {#gift_code}

Every educator who hosts an Hour of Code for students will receive 10 GB of Dropbox space or $10 Skype credit as a thank you gift!

<% if @country == 'ca' %>

## $2000 briljant Project {#brilliant_project}

[Brilliant Labs](http://brilliantlabs.com/hourofcode) will provide the resources necessary, up to a value of $2000.00, to implement a technology based, hands on, student centric learning project to one classroom in each province and territory (note: with the exception of Quebec). To qualify, teachers must register at hourofcode.com/ca#signup by December 6, 2014. For more details, terms, and conditions, please visit [brilliantlabs.com/hourofcode](http://brilliantlabs.com/hourofcode).

## Gelukkige scholen winnen een Actua Workshop {#actua_workshop}

15 lucky schools across Canada will be gifted 2 hands-on STEM workshops delivered by one of Actua's [33 Network Members](http://www.actua.ca/about-members/). Actua members deliver science, technology, engineering, and math (STEM) workshops that are connected to provincial and territorial learning curriculum for K-12 students. These in-classroom experiences are delivered by passionate, highly-trained undergraduate student role models in STEM. Teachers can expect exciting demonstrations, interactive experiments and a lot of STEM fun for their students! Please note that in-classroom workshop availability may vary in remote and rural communities.

[Actua](http://actua.ca/) is Canada’s leader in Science, Technology, Engineering, and Math Outreach. Each year Actua reaches over 225,000 youth in over 500 communities through its barrier-breaking programming.

**Congratulations to the 2014 winners!**

| School                          | City        | Actua Network Member            |
| ------------------------------- | ----------- | ------------------------------- |
| Spencer Middle School           | Victoria    | Science Venture                 |
| Malcolm Tweddle School          | Edmonton    | DiscoverE                       |
| Britannia Elementary            | Vancouver   | GEERing Up                      |
| Captain John Palliser           | Calgary     | Minds in Motion                 |
| St. Josaphat School             | Regina      | EYES                            |
| Bishop Roborecki School         | Saskatoon   | SCI-FI                          |
| Dalhousie Elementary School     | Winnipeg    | WISE Kid-Netic Energy           |
| Hillfield Strathallan College   | Hamilton    | Venture Engineering and Science |
| Byron Northview Public School   | London      | Discovery Western               |
| Stanley Public School           | Toronto     | Science Explorations            |
| Ottawa Catholic School Board    | Ottawa      | Virtual Ventures                |
| École Arc-en-Ciel               | Montreal    | Folie Technique                 |
| Saint Vincent Elementary School | Laval       | Musee Armand Frappier           |
| Garden Creek School             | Fredericton | Worlds UNBound                  |
| Armbrae Academy                 | Halifax     | SuperNOVA                       |

## Kids Code Jeunesse zal u helpen in uw klas! {#kids_code}

Are you a teacher who wants to introduce computer programming to your students and would like support in the classroom? Any teacher that would like a trained Computer Programming volunteer to assist in the classroom can contact [Kids Code Jeunesse](http://www.kidscodejeunesse.org) and we’ll work on getting you supported! [Kids Code Jeunesse](http://www.kidscodejeunesse.org) is a Canadian not for profit aimed at providing every child with the opportunity to learn to code. And every teacher the opportunity to learn how to teach computer programming in the classroom.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## 100 klaslokalen winnen een aantal programmeerbare robots {#programmable_robots}

[Sphero](http://www.gosphero.com/) is the app-controlled robotic ball changing the way students learn. Powered by [SPRK lessons](http://www.gosphero.com/education/), these round robots give kids a fun crash course in programming while sharpening their skills in math and science. Sphero is giving away 100 classroom sets – each including 5 robots. Any classroom (public or private) within the U.S. or Canada is eligible to win this prize.

<% end %>

## Meer vragen over de prijzen? {#more_questions}

Check out [Terms and Conditions](<%= hoc_uri('/prizes-terms') %>) or visit our forum to see [FAQs](http://support.code.org) and ask your questions.

<% if @country == 'us' %>

# Veelgestelde vragen {#faq}

## Moet uw hele school meedoen om $10.000 aan hardware te verdienen?

Ja. Uw hele school moet deelnemen om in aanmerking te komen voor de prijs, maar slechts één persoon hoeft zich te registreren en het aanvraagformulier in te dienen. [ registreer u hier](<%= hoc_uri('/prizes') %>).

## Moet je hele school deelnemen om een techchat te winnen?

Elke klas (openbare of particuliere school) komt in aanmerking om deze prijs te winnen. Uw hele school moet hier niet voor inschrijven.

## Kunnen niet openbare scholen het video-gesprek winnen?

Ja! Particuliere en onafhankelijke scholen komen in aanmerking samen met openbare scholen om de video chat prijzen te winnen.

## Kunnen niet-Amerikaanse scholen de video chat prijs winnen?

Nee, helaas, vanwege logistieke beperkingen zijn wij niet in staat om video-chat prijzen aan te bieden aan scholen buiten de VS en Canada. Alle internationale organisatoren **komen** in aanmerking voor Dropbox ruimte of Skypetegoed.

## Waarom is de prijs van $10.000 hardware alleen beschikbaar voor openbare scholen?

We willen graag leerkrachten in openbare en particuliere scholen evenveel helpen, maar op dit moment, het komt neer op logistiek. We have partnered with [DonorsChoose.org](http://donorschoose.org) to administer classroom funding prizes, which only works with public, US K-12 schools. According to DonorsChoose.org, the organization is better able to access consistent and accurate data that's available for public schools.

## Ik ben buiten de Verenigde Staten. Kom ik in aanmerking voor prijzen?

Due to a small full-time staff, Code.org is unable to handle the logistics of administering international prizes. Because of this people outside the US are unable to qualify for prizes.

## When is the deadline to apply for the hardware prize?

To qualify, your entire school must register for the Hour of Code as well as complete the [Hardware Application form](<%= hoc_uri('/prizes') %>) by November 14, 2014. Een school in iedere Amerikaanse staat krijgt computers voor een heel klaslokaal. Code.org selecteert winnaars en bericht ze via email voor 1 december 2014.

## Wat is de deadline om in aanmerking te komen om een tech chat te winnen?

Om in aanmerking te komen moet je je klas voor 14 november 2014 geregistreerd hebben voor Uur Code. Klassen kunnen een videochat met een beroemdheid winnen. Code.org selecteert winnaars en bericht ze via email voor 1 december 2014.

## Wanneer zal ik ervan op de hoogte worden gesteld als mijn school of klas een prijs wint?

To qualify, your entire school must register for the Hour of Code as well as complete the [Hardware Application form](<%= hoc_uri('/prizes') %>) by November 14, 2014. Code.org selecteert winnaars en bericht ze via email voor 1 december 2014.

## If my whole school can’t do the Hour of Code during Computer Science Education Week (Dec. 8-14), can I still qualify for prizes?

Yes, just be sure to submit a logistics plan that outlines how your whole school is participating over a reasonable length of time and register for the Hour of Code by November 14th. <% end %>