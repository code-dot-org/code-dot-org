* * *

title: Prizes layout: wide <% if @country == 'us' || @country == 'ca' %>nav: prizes_nav<% end %>

* * *

<div class="row">
  <h1 class="col-sm-9">
    Βραβεία για κάθε διοργανωτή
  </h1>
</div>

<% if @country == 'us' %>

## One classroom will win a trip to Washington, D.C. for a historic, top-secret Hour of Code! {#dc}

Η Code.org θα επιλέξει μία τυχερή τάξη για να παρακολουθήσει μια πολύ ιδιαίτερη εκδήλωση της Ώρας του Κώδικα στην πρωτεύουσα της χώρας — η εκδήλωση θα είναι τόσο ξεχωριστή που όλες οι λεπτομέρειες κρατούνται κρυφές! Winning students (with chaperones) will enjoy an all-expenses-covered trip to Washington, D.C. Students will participate in a full day of top-secret activities on Monday, December 8.

<% end %>

<% if @country == 'us' %>

<h2 id="hardware_prize" style="font-size: 18px">
  51 schools win a class-set of laptops (or $10,000 for other technology)
</h2>

One lucky school in ***every*** U.S. state (+ Washington D.C.) won $10,000 worth of technology. [**See all 51 winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners)

<% end %>

<% if @country == 'uk' %>

## Lucky classrooms win a video chat with a guest speaker! {#video_chat}

20 lucky classrooms will be invited to join a video chat to celebrate the Hour of Code during December 8-14. Your students will be able to ask questions and chat with technology-industry leaders. **The submission period has ended. Winners will be announced soon.**

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## 100 classrooms win a video chat with a guest speaker! {#video_chat}

100 lucky classrooms are invited to participate in live video Q&As with tech titans and tech-loving celebrities. Students will be able to ask questions and chat with these exciting role models to kick off your Hour of Code.

### Tune into the live chats, or watch the video archives:

**TUESDAY**, December 9   
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


**FRIDAY**, December 12   
10:00 AM PST - [Hadi Partovi](http://www.youtube.com/watch?v=PDnjt6iIBzo)

&#42;Recordings of Bill Gates and Sheryl Sandberg chats will be available on [our YouTube channel](https://www.youtube.com/user/CodeOrg/)

### This year's celebrity video chat participants:

<%= view :video_chat_speakers %>

<% end %>

## Every organizer wins a thank you gift-code {#gift_code}

Every educator who hosts an Hour of Code for students will receive 10 GB of Dropbox space or $10 Skype credit as a thank you gift!

<% if @country == 'ca' %>

## $2000 Brilliant Project {#brilliant_project}

[Brilliant Labs](http://brilliantlabs.com/hourofcode) will provide the resources necessary, up to a value of $2000.00, to implement a technology based, hands on, student centric learning project to one classroom in each province and territory (note: with the exception of Quebec). To qualify, teachers must register at hourofcode.com/ca#signup by December 6, 2014. For more details, terms, and conditions, please visit [brilliantlabs.com/hourofcode](http://brilliantlabs.com/hourofcode).

## Lucky Schools win an Actua Workshop {#actua_workshop}

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

## Kids Code Jeunesse will help support you in the classroom! {#kids_code}

Are you a teacher who wants to introduce computer programming to your students and would like support in the classroom? Any teacher that would like a trained Computer Programming volunteer to assist in the classroom can contact [Kids Code Jeunesse](http://www.kidscodejeunesse.org) and we’ll work on getting you supported! [Kids Code Jeunesse](http://www.kidscodejeunesse.org) is a Canadian not for profit aimed at providing every child with the opportunity to learn to code. And every teacher the opportunity to learn how to teach computer programming in the classroom.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## 100 τάξεις θα κερδίσουν ένα σετ από προγραμματιζόμενα ρομπότ {#programmable_robots}

[Sphero](http://www.gosphero.com/) is the app-controlled robotic ball changing the way students learn. Powered by [SPRK lessons](http://www.gosphero.com/education/), these round robots give kids a fun crash course in programming while sharpening their skills in math and science. Sphero is giving away 100 classroom sets – each including 5 robots. Any classroom (public or private) within the U.S. or Canada is eligible to win this prize.

<% end %>

## More questions about prizes? {#more_questions}

Check out [Terms and Conditions](<%= hoc_uri('/prizes-terms') %>) or visit our forum to see [FAQs](http://support.code.org) and ask your questions.

<% if @country == 'us' %>

# Frequently Asked Questions {#faq}

## Πρέπει να συμμετάσχει όλο το σχολείο για να κερδίσει 10,000$ σε τεχνολογικό εξοπλισμό;

Yes. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](<%= hoc_uri('/prizes') %>).

## Πρέπει να συμμετάσχει όλο το σχολείο σας για να κερδίσει ένα chat τεχνολογίας;

Any classroom (public or private school) is eligible to win this prize. Your whole school need not apply.

## Μπορεί ένα ιδιωτικό σχολείο να κερδίσει μια βίντεο - διάσκεψη;

Yes! Private and independent schools are eligible along with public schools to win the video chat prizes.

## Μπορεί ένα σχολείο εκτός ΗΠΑ να κερδίσει μια βιντεο-διάσκεψη;

No, unfortunately, because of logistics we are unable to offer the video chat prize to schools outside of the U.S. and Canada. All international organizers **are** eligible to receive Dropbox space or Skype credit.

## Γιατί το βραβείο εξοπλισμού αξίας 10,000$ είναι διαθέσιο μόνο για τα δημόσια σχολεία;

We would love to help teachers in public and private schools alike, but at this time, it comes down to logistics. We have partnered with [DonorsChoose.org](http://donorschoose.org) to administer classroom funding prizes, which only works with public, US K-12 schools. According to DonorsChoose.org, the organization is better able to access consistent and accurate data that's available for public schools.

## Είμαι εκτός των Ηνωμένων Πολιτειών. Έχω τις προϋποθέσεις να κερδίσω τα βραβεία;

Due to a small full-time staff, Code.org is unable to handle the logistics of administering international prizes. Because of this people outside the US are unable to qualify for prizes.

## Πότε είναι η προθεσμία για την υποβολή αίτησης για το βραβείο εξοπλισμού;

To qualify, your entire school must register for the Hour of Code as well as complete the [Hardware Application form](<%= hoc_uri('/prizes') %>) by November 14, 2014. One school in every U.S. state will receive a class-set of computers. Code.org will select and notify winners via email by December 1, 2014.

## Πότε είναι η προθεσμία για να μπορεί κανείς να διεκδικήσει μια βίντεο - συνομιλία τεχνολογίας;

To qualify, you must register your classroom for the Hour of Code by November 14, 2014. Classrooms will win a video chat with a celebrity. Code.org will select and notify winners via email by December 1, 2014.

## Πότε θα ειδοποιηθώ αν το σχολείο ή η τάξη μου κερδίσει ένα βραβείο;

To qualify, your entire school must register for the Hour of Code as well as complete the [Hardware Application form](<%= hoc_uri('/prizes') %>) by November 14, 2014. Code.org will select and notify winners via email by December 1, 2014.

## Αν όλο το σχολείο μου δεν μπορεί να κάνει στην Ώρα του Κώδικα κατά τη διάρκεια της Εβδομάδας Εκπαίδευσης Επιστήμης Υπολογιστών (8-14 Δεκεμβρίου), μπορώ ακόμα να διεκδικήσω τα βραβεία;

Yes, just be sure to submit a logistics plan that outlines how your whole school is participating over a reasonable length of time and register for the Hour of Code by November 14th. <% end %>