# Οδηγός σεναρίων εκμάθησης για την Ώρα του Κώδικα και την Εκπαιδευτική Εβδομάδα Πληροφορικής (CSEdWeek)

**The deadline to submit a tutorial for Hour of Code 2014 has passed. You may still submit an entry and we will try to review it if time allows.**

Code.org will host a variety of Hour of Code activities on the Code.org, Hour of Code, and CSEdWeek website(s). The current list is at [<%= codeorg_url() %>](http://<%= codeorg_url() %>/learn).

We’d like to host a variety of engaging options, but the primary goal is to optimize the experience for students and teachers who are new to computer science. Please use this document to guide the creation of your activity, targeted to the user who has no background in coding, computer programming, and computer science.

<a id="top"></a>

## Ευρετήριο:

  * [Τρόπος αξιολόγησης των σεναρίων προς ανάρτηση](#inclusion)
  * [Γενικές κατευθύνσεις για τη δημιουργία μιας δραστηριότητας για την Ώρα του Κώδικα](#guidelines)
  * [Τρόπος υποβολής (προθεσμία 1/10/2014)](#submit)
  * [Προτάσεις για το σχεδιασμό της δραστηριότητάς σας](#design)
  * [Βασικές κατευθύνσεις](#tm)
  * [Εικονοστοιχείο ανίχνευσης](#pixel)
  * [Πώς να προωθήσετε τα σενάριά σας, την Εκπαιδευτική Εβδομάδα Πληροφορικής (CSEdWeek) και την Ώρα του Κώδικα](#promote)
  * [Μια σημείωση για τους μαθητές με αναπηρία](#disabilities)

<a id="inclusion"></a>

## Τρόπος αξιολόγησης των σεναρίων προς ανάρτηση

A committee of computer science educators will rank submissions based on qualitative and quantitative metrics, including survey results from a broader set of educators.

**Tutorials will be listed higher if they are:**

  * είναι υψηλής ποιότητας
  * είναι αυτο-κατευθυνόμενα, χωρίς να απαιτούν κάποια επεξήγηση
  * είναι σχεδιασμένα για αρχάριους
  * είναι σχεδιασμένα για περίπου 1 ώρας δραστηριότητα
  * λειτουργούν σε πολλά λειτουργικά συστήματα/πλατφόρμες συσκευών, συμπεριλαμβανομένων κινητών τηλεφώνων και ταμπλετών
  * λειτουργούν σε πολλαπλές γλώσσες
  * προωθούν τη μάθηση σε όλες τις δημογραφικές ομάδες (ιδιαίτερα στις ομάδες με μερική εκπροσώπηση)
  * δεν αποτελούν απλή σχεδίαση HTML+CSS - (ο στόχος μας είναι η επιστήμη των υπολογιστών, όχι απλά ο προγραμματισμός σε HTML)

**Tutorials will be listed lower if they are:**

  * είναι χαμηλής ποιότητας
  * αφορούν σε προχωρημένο επίπεδο διδασκαλίας (όχι για αρχάριους)
  * έχουν περιορισμένη υποστήριξη σε λειτουργικά συστήματα/πλατφόρμες συσκευών - για τις διαδικτυακές πλατφόρμες θα πρέπει να υποστηρίζονται όλα τα ακόλουθα: IE9+, και οι πιο πρόσφατοι Chrome, Firefox και Safari
  * υποστηρίζουν μόνο Αγγλικά
  * κλίνουν προς ένα συγκεκριμένο φύλο (π.χ. η θεματολογία αφορά κυρίως αγόρια)
  * χρησιμοποιούνται ως μέσο προώθησης προς εκπαιδευτικές πλατφόρμες που χρεώνουν δίδακτρα

**Tutorials will NOT be listed if they:**

  * απαιτούν υψηλό βαθμό συμμετοχής και προετοιμασίας από τον εκπαιδευτκό (δηλαδή να μην είναι αυτοκαθοδηγούμενα για τους μαθητές)
  * δεν έχουν σχεδιαστεί να διαρκούν (περίπου) μια ώρα
  * απαιτούν εγγραφή 
  * απαιτούν πληρωμή
  * απαιτούν εγκατάσταση
  * επικεντρώνονται μόνο σε σχεδίση HTML + CSS
  * υποβάλλονται μετά την προθεσμία υποβολής, ή με ελλειπή πληροφόρηση (βλ. παρακάτω)

Ultimately, the goal of the Hour of Code campaign is to broaden participation in computer science by students and teachers, and to help show that computer science is accessible to all, and “easier than you think.” In many ways, this goal is better achieved by giving students and teachers fewer and simpler choices, with a focus on the highest quality options for a first-time user.

Note also, that the 2013 CSEdWeek was a fantastic success as measured by the responses from teachers and students - 20M participants from Dec 9 - 23, and 97% said they enjoyed it and want to repeat the campaign!!

As a result, the existing listings are certainly “good enough,” and the driving reason to add tutorials to the Hour of Code listings isn’t to broaden the choices, but to raise the quality (or freshness) for students, or to expand the options for non-English speakers given the global nature of the 2014 campaign.

[**Back to the top**](#top)

<a id="guidelines"></a>

## Γενικές κατευθύνσεις για τη δημιουργία μιας δραστηριότητας για την Ώρα του Κώδικα

  * **Θέμα:** Εισαγωγή στην επιστήμη των υπολογιστών ή προγραμματισμός (όχι HTML).
  * **Στόχος:** Να δωθεί στους αρχάριους μια προσιτή πρώτη γεύση προγραμματισμού.
  * **Τόνος:** 
      * Η επιστήμη των υπολογιστών δεν είναι μόνο για ιδιοφυίες. Δεν έχει σημασία η ηλικία, το φύλο, η φυλή. Όλοι μπορούν να μάθουν!
      * Η επιστήμη των υπολογιστών συνδέεται με πολλά διαφορετικά πεδία και ενδιαφέροντα. Όλοι πρέπει να μάθουν!
      * Ενθάρρυνε τους μαθητές να δημιουργήσουν κάτι που μπορούν μα μοιραστούν με τους φίλους τους ηλεκτρονικά.
  * **Τύποι δραστηριοτήτων:** 
      * **Προτιμώνται:** Διαδικτυακές δραστηριότητες, δραστηριότητες για "έξυπνα" κινητά τηλέφωνα ή δραστηριότητες που διδάσκουν τις έννοιες της πληροφορικής επιστήμης χωρίς τη χρήση υπολογιστή (δες <http://csunplugged.com/>). 
      * **Καλοί, αλλά δεν προτιμώνται :** εφαρμογές που απαιτούν εγκατάσταση, εφαρμογές για υπολογιστή ή που προφέρουν εμπειρία μέσα από κονσόλες παιχνιδιών.
  * **Μορφή:** Αυτοκαθοδηγούμενα σενάρια ή μαθήματα, που προαιρετικά απαιτούν τη συνδρομή του εκπαιδευτικού. Πρέπει να υπάρχουν οδηγίες για του μαθητές και όχι μια χωρίς στόχο απασχόληση μιας ώρας. Στην ιδανική περίπτωση, οι οδηγίες και τα σενάρια, βρίσκονται ενσωματωμένα στην προγραμματισική πλατφόρμα, ώστε να μην εναλλάσσονται καρτέλες ή παράθυρα μεταξύ του σεναρίου και της προγραμματιστικής πλατφόρμας.

[**Back to the top**](#top)

<a id="submit"></a>

## Τρόπος υποβολής (προθεσμία 1/10/2014)

Visit the [Hour of Code Activity Submission page](https://docs.google.com/a/code.org/forms/d/16FZ2a24YsZzhoCiThzUf1DI7nkuYG5sJURMEPd3wDvU/viewform) and follow the steps to submit your tutorial.

**What you’ll need:**

  * Το όνομά σου, λογότυπο (jpg, png, κλπ.)
  * Διεύθυνση URL για screenshot ή διαφημιστική αφίσα για την Ώρα του Κώδικα. Οι εικόνες/screenshots πρέπει να έχουν ανάλυση 446 x 335 ακριβώς. Εάν δεν δοθεί κατάλληλη εικόνα, θα πάρουμε ένα screenshot από το σενάριό σου Ή μπορεί να μην το αναρτήσουμε.
  * Σύνδεσμο URL για το λογότυπο
  * Τίτλο της δραστηριότητας
  * Σύδνεσμο URL προς τη δραστηριότητα
  * Σύνδεσμο URL προς της σημειώσεις του εκπαιδευτικού (προαιρετικό, βλ. λεπτομέρειες παρακάτω)
  * Περιγραφή της δραστηριότητας (έκδοση και για υπολογιστές και για κινητές συσκευές) 
      * **Μέγιστος αριθμός χαρακτήρων για υπολογιστές (desktop-view):** 384
      * **Μέγιστος αριθμός χαρακτήρων για κινητές συσκευές (mobile-view):** 74
      * Παρακαλούμε να συμπεριλάβετε στην περιγραφή κατά πόσο το σενάριο είναι αυτοκαθοδηγούμενο για τους μαθητές ή απαιτεί τη συνδρομή του εκπαιδευτικού. Επιπλέον, μερικά σχολεία ενδιαφέρονται να γνωρίζουν εάν η Ώρα του Κώδικα υιοθετεί τα πρότυπα Common Core ή τα Next Generation Science. Εαν το σενάριο υιοθετεί συγκεκριμένα πρότυπα, μην αμελήσετε να το συμπεριλάβετε.
  * Ένας κατάλογος με ελεγμένες/συμβατές πλατφόρμες: 
      * **Διαδικτυακές:** 
          * OS - Mac, Win, και οι εκδόσεις τους
          * Προγράμματα περιήγησης - IE8, IE9, IE10, Firefox, Chrome, Safari
          * iOS mobile Safari (βελτιστοποιημένη για κινητές συσκευές)
          * Android Chrome (βελτιστοποιημένη για κινητές συσκευές)
      * **Μη διαδικτυακές:** καθορίστε την πλατφόρμα εγγενούς κώδικα (Mac, Win, iOS, Android, xBox, άλλη)
      * Χωρίς υπολογιστή
  * Ένας κατάλογος με τις υποστηριζόμενες γλώσσες και την κατάλληλη μορφή: 
      * Τα σενάρια θα πρέπει να υποστηρίζουν ποιες γλώσσες υποστηρίζουν χρησιμοποιώντας κωδικό γλώσσας 2 χαρακτήρων, π.χ. en - Αγγλικά; el - Ελληνικά
      * Εάν υποστηρίζονται περισσότερες είναι απαράιτητος ο διαχωρισμός με πάυλοες, π.χ. fr-be - Γαλλικά (Βελγίου) or fr-ca - Γαλλικά (Καναδά)
      * ***Σημείωση: Ο εντοπισμός της γλώσσας είναι δουλειά του δημιουργού του σεναρίου, εμείς θα κατευθύνουμε τους χρήστες στο URL που παρέχεται.*** 
  * Εάν υποβάλετε ένα σενάριο, χρειάζεται να γνωρίζουμε κατά πόσο είναι [COPPA συμβατό](http://en.wikipedia.org/wiki/Children's_Online_Privacy_Protection_Act) ή όχι.
  * Βαθμίδα(ες) εκπαίδευσης στον οποία απευθύνεται. Μπορείτε να αναφερθείτε στο [Computer Science Teachers’ Association’s K-12 Standards](http://csta.acm.org/Curriculum/sub/K12Standards.html) για την κατάλληλη βαθμίδα που αφορούν στην επιστήμη των υπολογιστών. Μερικά παραδείγματα εκπαιδευτικών βαθμίδων περιλαμβάνουν: 
      * Elementary school: βαθμίδες K-2 ή 3-5
      * Middle School: βαθμίδες 6-8
      * High School: βαθμίδες 9-12
      * Όλες τις ηλικίες
  * Παρακαλούμε συμπεριλάβετε επίσης την προτιμώμενη εμπειρία στην επιστήμη των υπολογιστών: Αρχάριοι, Προηγομένοι, Προχωρημένοι. Η ιστοσελίδα της Ώρας του Κώδικα θα επισημάνει τις δραστηριότητες για Αρχαρίους σε πιο περίοπτη θέση. Εάν επιθυμείτε να προετοιμάσετε Δραστηριότητες για την Ώρα του Κώδικα Προηγμένου και Προχωρημένου επιπέδου, παρακαλούμε να συμπεριλάβετε τις προηγούμενες γνώσεις που χρειάζονται στην περιγραφή της δραστηριότητάς σας.
  * Τεχνικές απαιτήσεις: 
      * Για να μπορούμε να προσδιορίσουμε με ακρίβεια τις συμμετοχές, θέλουμε κάθε τρίτος να συμπεριλαμβάνει εικόνες ανίχνευσης 1 εικονοστοιχείου στην πρώτη και στην τελευταία σελίδα των σεναρίων εκμάθησης της Ώρας του Κώδικα. Τοποθετήστε μια μια αρχική εικόνα 1 εικονοστοιχείου στην αρχική σελίδα και μια τελική εικόνα μια στην τελική σελίδα. Μην τοποθετείτε pixel στις ενδάμεσες σελίδες. Δείτε παρακάτω την ενότητα Εικονοστοιχείο Ανίχνευσης για περισσότερες πληροφορίες. 
      * Ολοκληρώνοντας τη δραστηριότητα, οι χρήστες πρέπει να κατευθύνονται στην <http://code.org/api/hour/finish> όπου θα μπορούν να: 
          * Προβάλλουν στα μέσα κοινωνικής δικτύωσης το γεγονός ότι ολοκλήρωσην μια Ώρα του Κώδικα
          * Να λάβουν ένα πιστοποιητικό για την ολοκλήρωση της Ώρας του Κώδικα
          * Να δουν τους πίνακες χωρών/πόλεων με τις περισσότερες συμμετοχές στις δραστηριότητες της Ώρας του Κώδικα
          * Για τους χρήστες που συμμετείχαν αλλά δεν ολοκλήρωσαν την Ώρα του Κώδικα, παρακαλούμε να συμπεριλάβετε ένα κουμπί με την ένδειξη "Ολοκλήρωσα την Ώρα του Κώδικα" το οποίο οδηγεί επίσης στο <http://code.org/api/hour/finish>. 
  * ***(Προαιρετικά)*** Η διαδικασία θα συνεχιστεί με ένα ηλεκτρονικό ερωτηματολόγιο/φόρμα όπου θα ζητείται μια αναφορά των παρακάτω μετρήσεων για την εβδομάδα από 8 Δεκεμβρίου, 12:01μμ έως και 14 Δεκεμβρίου 11:59πμ 
      * Για online δραστηριότητες (ειδικά για εφαρμογές smartphones/tablets): 
          * Αριθμός χρηστών
          * Πόσοι ολοκλήρωσαν τις εργασίες
          * Μέσος όρος χρόνου ανα εργασία
          * Συνολικός αριθμός γραμμών κώδικα που γράφηκαν από όλους τους χρήστες
          * Πόσοι συνέχισαν περαιτέρω (μετράται όταν κάποιος χρήστης που ολοκλήρωσε τις εργασίες συνεχίσει με επιπλέον εργασίες στη σελίδα σας)
      * Για τις offline δρατηριότητες 
          * Αριθμός λήψεων των δραστηριοτήτων σε χαρτί (κατά περίπτωση)

[**Back to the top**](#top)

<a id="design"></a>

## Προτάσεις για το σχεδιασμό της δραστηριότητάς σας

**Include the CSEdWeek logo in your tutorial.** You can include the CSEdWeek logo ([small](https://www.dropbox.com/s/ojlltuegr7ruvx1/csedweek-logo-final-small.jpg) or [big](https://www.dropbox.com/s/yolheibpxapzpp1/csedweek-logo-final-big.png)) in your tutorial, but this is not required. You may also contact us to request specific permission to use the “In Partnership with Code.org” logo. ***This logo can only be used if specific permission is granted in writing by Code.org.*** We may end up creating an Hour of Code logo, but at this time we do not have one. Under no circumstances can the Code.org logo and name be used. Both are trademarked, and can’t be co-mingled with a 3rd party brand name.

**Make sure that the average student can finish comfortably in an hour.** Consider adding an open-ended activity at the end for students who move more quickly through the lesson. Remember that most kids will be absolute beginners to computer science and coding.

**Include teacher notes.** Most activities should be student-directed, but if an activity is facilitated or managed by a teacher, please include clear and simple directions for the teacher in the form of teacher-notes at a separate URL submitted with your activity. Not only are the students novices, some of the teachers are as well. Include info such as:

  * Το σενάριο εκμάθησης λειτουργεί καλύτερα στις παρακάτω πλατφόρμες και προγράμματα περιήγησης
  * Λειτουρφεί σε smartphones; Σε ταμπλέτες;
  * Προτείνετε τον προγραμματισμό σε ζευγάρια; 
  * Απαιτήσεις για εφαρμογή στην αίθουσα; π.χ. εάν υπάρχουν βίντεο, συμβουλέψτε τους εκπαιδευτικούς να δείξουν τα βίντεο σε μια οθόνη προβολής ώστε να το παρακολουθήσει όλη η τάξη μαζί

**Incorporate feedback at the end of the activity.** (E.g.: “You finished 10 levels and learned about loops! Great job!”)

**Incorporate social media.** Encourage students to post to social media (where appropriate) when they’ve finished, for example “I’ve done an Hour of Code with ________ Have you? #HourOfCode” or “I’ve done an #HourofCode as a part of #CSEdWeek. Have you? @Scratch.” Use the hashtag **#HourOfCode** (with capital letters H, O, C)

**Create your activity in languages besides English.** We're focusing this campaign internationally this year and would like to have a number of activities to offer non-English speaking participants.

**Explain or connect the activity to a socially significant context.** Computer programming becomes a superpower when students see how it can change the world for the better!

**Do not require signup or payment before students can try your tutorial.** Tutorials that require signup or payment will not be listed

**Make sure your tutorial can be used in a [Pair Programming paradigm](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning).**

The three rules of pair programming in a school setting:

  * Ο Οδηγός ελέγχει το ποντίκι και το πληκτρολόγιο.
  * Ο Παρατηρήτής κάνει προτάσεις, επισημαίνει τα λάθη και θέτει ερωτήματα. 
  * Οι μαθητές πρέπει να εναλλάσουν ρόλους τουλάχιστον δύο φορές σε ένα μάθημα.

Benefits of Pair Programming:

  * Οι μαθητές μπορούν να βοηθούν ο ένας τον άλλο αντί να βασίζονται στον εκπαιδευτικό
  * Δείχνει ότι ο προγραμματισμός δεν είναι μια ατομική δραστηριότητα, αλλά μια δραστηριότητα που περιλαμβάνει κοινωνική αλληλεπίδραση
  * Δεν έχουν όλες οι αίθουσες ή τα εργαστήρια αρκετούς υπολογιστές για μια 1:1 εμπειρία

[**Back to the top**](#top)

<a id="tm"></a>

## Βασικές κατευθύνσεις

With ~40 million students having tried the Hour of Code, and over 97% of participating teachers asking us to repeat the event annually, we are taking steps to make sure we set up the Hour of Code as a movement that can repeat annually with greater fidelity and without confusion.

One piece of this is to protect the trademark "Hour of Code" to prevent confusion. Many of our tutorial partners have used "Hour of Code" on your web sites. We don't want to prevent this usage, but we want to make sure it fits within a few limits:

  1. Οποιαδήποτε αναφορά στην "Ώρα του Κώδικα" θα δεν πρέπει να χρησιμοποιείται έτσι ώστε να φαίνεται ότι πρόκειται για δικό σας λογότυπο αλλά ότι αφορά στην "Ώρα του Κώδικα" ως ένα λαϊκό κίνημα. Ένα καλό παράδειγμα: "Λάβε μέρος στην Ώρα του Κώδικα στο ACMECorp.com". Κακό παράδειγμα: "Δοκίμασε την Ώρα του Κώδικα από την ACME Corp"
  2. Να χρησιμοποιείτε την ένδειξη ΤΜ" ως δείκτη στις πιο εμφανής θέσεις όπου αναφέρετε την "Ώρα του Κώδικα", τόσο στις περιγραφές του ιστότοπού σας όσο και σε αυτές των εφαρμογών σας
  3. Συμπεριλάβετε γλώσσα στην σελίδα (ή στο υποσέλιδο), συμπεριλαμβάνοντας συνδέσμους προς τις ιστοσελίδες CSEdWeek και Code.org, οι οποίοι θα λένε τα ακόλουθα:
    
    ***“Η 'Ώρα του Κώδικα' είναι μια διεθνής πρωτοβουλία από την Εκπαιδευτική Εβδομάδα Πληροφορικής [csedweek.org] και την Code.org [code.org] για να εισαγάγει εκατομμύρια μαθητές σε μια ώρα πληροφορικής και προγραμματισμού υπολογιστών.”***

  4. Μην χρησιμοποιείται το "Ώρα του Κώδικα" ως ονόματα εφαρμογών

[**Back to the top**](#top)

<a id="pixel"></a>

## Εικονοστοιχείο ανίχνευσης

In order to more accurately track participation we ask every third party tutorial partners to include 1-pixel tracking images on the first and last page of their Hour of Code tutorials (A starting pixel-image on the start page and a final pixel-image on the end page. And not on interim pages).

This will allow us to count users who you directly recruit to visit your website to do their Hour of Code, or users who visit when a teacher types your URL directly on their whiteboard. It will lead to more accurate participation counts for your tutorial, which will help you attract users. If you integrate the pixel at the end it will also allow us to measure tutorial completion rates.

If your tutorial is approved and included on the final tutorial page, Code.org will provide you with a unique tracking pixel for you to integrate into your tutorial. See example below.

***NOTE: this isn't important to do for installable apps (iOS/Android apps, or desktop-install apps)***

**Example tracking pixels for AppInventor:**

IMG SRC="http://code.org/api/hour/begin_appinventor.png/"

IMG SRC="http://code.org/api/hour/finish_appinventor.png/"

[**Back to the top**](#top)

<a id="promote"></a>

## Πώς να προωθήσετε τα σενάριά σας, την Εκπαιδευτική Εβδομάδα Πληροφορικής (CSEdWeek) και την Ώρα του Κώδικα

We are asking everyone to promote their own 1-hour tutorial to your users. Please direct them to your Hour of Code page. Your users are much more likely to react to a mailing from you about your tutorial. Use the international Hour of Code campaign for Computer Science Education Week as an excuse to encourage users to invite others to join in, help us reach 100 million total participants.

  * Αναδείξτε την Ώρα του Κώδικα και την Εκπαιδευτική Εβδομάδα Πληροφορικής στην ιστοσελίδα σας.  
    Π.χ.: <http://www.tynker.com/hour-of-code>
  * Προωθείστε την Ώρα του Κώδικα στα μέσα κοινωνικής δικτύωσης, στα παραδοσιακά μέσα ενημέρωσης, λίστες ταχυδρομείου, κλπ. χρησιμοποιώντας το hashtag **#HourOfCode** (με κεφαλαία γράμματα H, O, C)
  * Διοργανώστε μια τοπική εκδήλωση ή ζητήστε από τους υπαλλήλους σας να διοργανώσουν μια εκδήλωση στα σχολεία ή στην γειτονιά τους.
  * Δείτε το κουτί παροχών μαν για περισσότερες πληροφορίες (προσεχώς).

[**Back to the top**](#top)

<a id="disabilities"></a>

## Ειδική σημείωση για τους μαθητές με αναπηρία

If you create a tutorial that is designed for the vision-impaired, we’d love to highlight it for viewers with screen-readers. We have not yet received such a tutorial, and would be eager to include one as an option for these students.

[**Back to the top**](#top)