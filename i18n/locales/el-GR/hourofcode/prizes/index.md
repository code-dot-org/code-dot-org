* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Βραβεία 2015 ώρα του κώδικα

<% if @country == 'la' %>

# Βραβεία για κάθε διοργανωτή

Κάθε εκπαιδευτικός που φιλοξενεί μια ώρα κώδικα για μαθητές λαμβάνει 10 GB χώρου στο Dropbox ως ευχαριστήριο δώρο!

<% else %>

## Βραβεία για ΚΑΘΕ διοργανωτή

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!*

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

*While supplies last

<% if @country == 'us' %>

## 51 σχολεία θα κερδίσουν ένα σετ φορητών υπολογιστών για τάξη (ή 10.000$ σε τεχνολογικό εξοπλισμό)

Sign up for this prize is now closed. Check back to see this year's winners.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' || @country == 'ca' %>

<a id="video-chats"></a>

## 30 classrooms will win a video chat with a guest speaker

Lucky classrooms will have the opportunity to talk with guest speakers who will share how computer science has impacted their lives and careers.

[col-33]

![εικόνα](/images/fit-175/Kevin_Systrom.jpg)  
Kevin Systrom   
(co-founder and CEO of Instagram)   
[Watch live Dec. 9 11 am PST](https://plus.google.com/events/cpt85j7p1ohaqu5e86m272aukn4)

[/col-33]

[col-33]

![εικόνα](/images/fit-175/Dao_Nguyen.jpg)  
Dao Nguyen   
(Publisher, Buzzfeed)   
[Watch live Dec. 7 12 pm PST](https://plus.google.com/events/cag6mbpocahk8h8qr3hrd7h0skk)

[/col-33]

[col-33]

![εικόνα](/images/fit-175/Aloe_Blacc.jpg)  
Aloe Blacc   
(Recording artist)   
[Watch live Dec. 8 3 pm PST](https://plus.google.com/events/clir8qtd7t2fhh33n8d9o2m389g)

[/col-33]

  
  


[col-33]

![εικόνα](/images/fit-175/Julie_Larson-Green.jpg)  
Julie Larson-Green   
(Chief Experience Officer, Microsoft)   


[/col-33]

[col-33]

![εικόνα](/images/fit-175/Hadi-Partovi.jpg)  
Hadi Partovi   
(Code.org co-founder)   
[Watch live Dec. 11 10 am PST](https://plus.google.com/events/c2e67fd7el3es36sits1fd67prc)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' %>

## One lucky classroom will win an exclusive, behind-the-scenes “Making of Star Wars” experience in San Francisco with Disney and Lucasfilm

One lucky classroom will win the grand prize – a trip to San Francisco, CA for an exclusive, behind-the-scenes “Making of Star Wars” experience with the visual effects team who worked on Star Wars: The Force Awakens. The grand prize is courtesy of [ILMxLAB](http://www.ilmxlab.com/), a new laboratory for immersive entertainment, combining the talents of Lucasfilm, Industrial Light & Magic and Skywalker Sound.

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize1.jpg" />

<img style="float: left; padding-right: 25px; padding-bottom: 10px;" src="/images/fill-260x200/star-wars-prize2.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'us' %>

## 100 classrooms will win programmable robots including a BB-8 droid robot by Sphero

In honor of Hour of Code tutorial "Star Wars: Building a Galaxy with Code," 100 participating classrooms in the United States or Canada will a set of four Sphero 2.0 robots plus a BB-8™ App-enabled Droid that students can program. Sign up your Hour of Code event to qualify. [Learn more about BB-8 from Sphero](http://sphero.com/starwars) and [about Sphero education](http://sphero.com/education).

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-220x160/bb8.png" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-200x160/bb8-girl.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-300x160/sphero-robot.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% end %>

<% if @country == 'ro' %>

Organizatorii evenimentelor Hour of Code în România vor beneficia de un premiu din partea Bitdefender România, constand intr-o solutie de securitate online.

<% end %>

# Συχνές Ερωτήσεις

## Ποιος είναι επιλέξιμος για να λάβει το ευχαριστήριο δώρο;

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is limited to US residents only.

## Υπάρχει προθεσμία να εγγραφείτε ώστε να λαμβάνετε ευχαριστήριο δώρο;

Πρέπει να εγγραφείτε **πριν** < % = campaign_date('start_long') %> για να λάβετε το ευχαριστήριο δώρο.

## Πότε θα παραλάβω το δώρο μου;

Θα επικοινωνήσουμε μαζί σας το Δεκέμβριο μετά από την δράση της εβδομάδας επιστήμης υπολογιστών (< % = campaign_date('full') %>) με τα επόμενα βήματα για το πώς να εξαργυρώσετε το ευχαριστήριο αυτό δωράκι.

## Μπορώ να εξαργυρώσω όλες τις ευχαριστήριες επιλογές¨;

Όχι. Thank-you gifts are limited to one per organizer while supplies last. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## Πρέπει να συμμετάσχει όλο το σχολείο για να κερδίσει 10,000$ σε τεχνολογικό εξοπλισμό;

ναί. Όλο το σχολείο σας θα πρέπει να συμμετέχει για να έχουν δικαίωμα για το βραβείο, αλλά μόνο ένα άτομο πρέπει να εγγραφεί και να υποβάλει το έντυπο αίτησης υλικού βραβείου [εδώ](%= resolve_url('/prizes/hardware-signup') %). Κάθε συμμετέχων δάσκαλος πρέπει να εγγράψει την τάξη του ατομικά για να δικαιούται δώρο ως διοργανωτής.

## Ποιοι μπορούν να κερδίσουν το βραβείο σε εξοπλισμό;

Το βραβείο αυτό αφορά μόνο τα δημόσια σχολεία κατηγορίας K-12 των Η.Π.Α. . Όλο το σχολείο σας πρέπει να έχει εγγραφεί στην Ώρα του Κώδικα μέχρι τις 16 Νοεμβρίου 2015. Ένα σχολείο σε κάθε πολιτεία των Η.Π.Α. θα λάβει ένα σετ υπολογιστών. Το Code.org θα επιλέξει και θα ενημερώσει τους νικητές μέσω email μέχρι τη 1 Δεκεμβρίου 2015.

## Γιατί το βραβείο εξοπλισμού αξίας 10,000$ είναι διαθέσιο μόνο για τα δημόσια σχολεία;

Θα θέλαμε πολύ να βοηθήσουμε τόσο τους καθηγητές σε δημόσια όσο και ιδιωτικά σχολεία, αλλά αυτή τη στιγμή, το θέμα είναι λογιστικό. Έχουμε συνεργασία με [DonorsChoose.org](http://donorschoose.org) για τη διαχείριση και χρηματοδότηση τάξεων με βραβεία, που όμως λειτουργεί μόνο με δημόσια, Κ-12 σχολεία στις ΗΠΑ. Σύμφωνα με DonorsChoose.org της, η οργάνωση είναι καλύτερα σε θέση να έχει πρόσβαση σε συνεπή και ακριβή δεδομένα που είναι διαθέσιμα για δημόσια σχολεία.

## Πότε είναι η προθεσμία για την υποβολή αίτησης για το βραβείο εξοπλισμού;

Για να γίνετε δεκτοί πρέπει να συμπληρώσετε την αίτηση έως τις 16 Νοεμβρίου αλλά και πάλι αφορά ΜΟΝΟ σχολεία των ΗΠΑ. Ένα σχολείο σε κάθε πολιτεία των Η.Π.Α. θα λάβει ένα σετ υπολογιστών. Το Code.org θα επιλέξει και θα ενημερώσει τους νικητές μέσω email μέχρι τη 1 Δεκεμβρίου 2015.

## Αν όλο το σχολείο δεν μπορεί να κάνει την ώρα του κώδικα κατά τη διάρκεια της εβδομάδας εκπαίδευση επιστήμης υπολογιστών (< % = campaign_date('short') %>), μπορεί ακόμα να χαρακτηριστεί υποψήφιο για τα βραβεία;

Ναι, στην αίτηση υπάρχουν οι ημερομηνίες που όλο το σχολείο συμμετέχει. Τονίζουμε πως αφορά μόνο σχολεία στις ΗΠΑ.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Βίνετο συνομιλία με διακεκριμένο ομιλητή:

Prize limited to K-12 classrooms in the U.S. and Canada only. Code.org will select winning classrooms, provide a time slot for the web chat, and work with the appropriate teacher to set up the technology details. Your whole school does not need to apply to qualify for this prize. Both public and private schools are eligible to win.

<% end %>

## Είμαι εκτός των Ηνωμένων Πολιτειών. Έχω τις προϋποθέσεις να κερδίσω τα βραβεία;

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift while supplies last. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>