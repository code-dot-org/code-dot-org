* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Προωθήστε την Ώρα του Κώδικα

## Φιλοξενείτε μία Ώρα του Κώδικα; [Δείτε τον οδηγό πως-να](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Κρεμάστε αυτές τις αφίσες στο σχολείο σας

<%= view :promote_posters %>

<a id="social"></a>

## Δημοσιεύσε τα στα κοινωνικά μέσα

[![εικόνα](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![εικόνα](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![εικόνα](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Χρησιμοποιήστε το λογότυπο της Ώρας του Κώδικα για να τη διαδώσετε

[![εικόνα](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Κατεβάστε εκδόσεις υψηλής ανάλυσης](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. Οποιαδήποτε αναφορά στην "Ώρα του Κώδικα" θα δεν πρέπει να χρησιμοποιείται έτσι ώστε να φαίνεται ότι πρόκειται για δικό σας λογότυπο αλλά ότι αφορά στην "Ώρα του Κώδικα" ως ένα λαϊκό κίνημα. Ένα καλό παράδειγμα: "Λάβε μέρος στην Ώρα του Κώδικα στο ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Συμπεριλάβετε γλώσσα στην σελίδα (ή στο υποσέλιδο), συμπεριλαμβάνοντας συνδέσμους προς τις ιστοσελίδες CSEdWeek και Code.org, οι οποίοι θα λένε τα ακόλουθα:
    
    *“Η 'Ώρα του Κώδικα' είναι μια διεθνής πρωτοβουλία από την Εκπαιδευτική Εβδομάδα Πληροφορικής [csedweek.org] και την Code.org [code.org] για να εισαγάγει εκατομμύρια μαθητές σε μια ώρα της επιστήμης της πληροφορικής και του προγραμματισμού υπολογιστών.”*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Εκτυπώστε αυτά τα αυτοκόλητα και δώστε τα στους μαθητές σας

(Τα αυτοκόλητα έχουν 2.5 εκ. διάμετρο, 63 ανά φύλλο)  
[![εικόνα](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Στείλε αυτά τα e-mail για να βοηθήσεις στην προώθηση της Ώρας του Κώδικα

<a id="email"></a>

## Ζήτησε από το σχολείο, τον εργοδότη ή τους φίλους να εγγραφούν:

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. Τα καλά νέα είναι, ότι πρόκειται να το αλλάξουμε αυτό. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

Με την Ώρα του Κώδικα, η επιστήμη της πληροφορικής έχει βρεθεί στην αρχική σελίδα των Ιστοσελίδων των Google, MSN και Yahoo! και της Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Ξεκινήσετε στο http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Κάλεσε τα ΜΜΕ να καλύψουν την εκδήλωσή σου:

**Γραμμή Τίτλου:** Τοπικό σχολείο συμμετέχει στην αποστολή του να γνωρίσουν οι μαθητές την Επιστήμη της Πληροφορικής

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Τα καλά νέα είναι, ότι πρόκειται να το αλλάξουμε αυτό.

Με την Ώρα του Κώδικα, η επιστήμη της πληροφορικής έχει βρεθεί στην αρχική σελίδα των Ιστοσελίδων των Google, MSN και Yahoo! και της Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

Σας γράφω για να σας προσκαλέσω να παρακολουθήσετε την έναρξη της εκδήλωσης και να δείτε τα παιδιά να αρχίζουν τη δραστηριότητά τους στις [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Σας παρακαλούμε να έρθετε μαζί μας.

**Επικοινωνία:** [ΤΟ ΟΝΟΜΑ ΣΑΣ], [TITLE], ΑΡΙΘΜΟΣ ΕΠΙΚΟΙΝΩΝΙΑΣ

**Πότε:**[ΗΜΕΡΟΜΗΝΙΑ and ΩΡΑ της εκδήλωσής σας]

**Που** [ΔΙΕΥΘΥΝΣΗ και ΟΔΗΓΙΕΣ ΠΡΟΣΒΑΣΗΣ]

Ανυπομονώ να τα πούμε από κοντά.

<a id="parents"></a>

## Ενημέρωσε τους γονείς για την εκδήλωση του σχολείου σου:

Αγαπητοί Γονείς,

Ζούμε σε έναν κόσμο που περιβάλλεται από την τεχνολογία. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Προσκάλεσε έναν πολιτικό στην εκδήλωση του σχολείου σας:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]