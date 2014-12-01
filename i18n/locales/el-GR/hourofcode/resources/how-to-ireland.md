* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Πώς να διδάξετε την Ώρα του Κώδικα
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Sign up your event</button></a>
  </div>
</div>

<font size="4">On December 8th, as part of the global Hour of Code movement Microsoft is seeking to enable as many people as possible in Ireland to have the opportunity to learn how to code.</p> 

<p>
  On 19th November Microsoft will run a training session for people hosting events at its campus in Sandyford from 6pm - 8pm.
</p>

<p>
  This will run through the curriculum which can be delivered for Hour of Code on 8th December. If you would like to register to attend this event please email cillian@q4pr.ie. Places are on a first come first served basis. </font>
</p>

<h2>
  Details of the curriculum can be found <a href="https://www.touchdevelop.com/hourofcode2">here</a>
</h2>

<h2>
  1) Try the tutorials:
</h2>

<p>
  Θα φιλοξενήσουμε μια μεγάλη ποικιλία διασκεδαστικών οδηγών, μιας ώρας, για μαθητές όλων των ηλικιών από διάφορους συνεργάτες. Σύντομα έρχονται και άλλοι οδηγοί ειδικά φτιαγμένοι για την Ώρα του Κώδικα πριν από την εβδομάδα 8-14 Δεκεμβρίου.
</p>

<p>
  <strong>Όλοι οι εκπαιδευτικοί οδηγοί για την Ώρα του Κώδικα:</strong>
</p>

<ul>
  <li>
    Απαιτούν ελάχιστο χρόνο προετοιμασίας από τους εκπαιδευτικούς
  </li>
  <li>
    Είναι αυτο-καθοδηγούμενοι - επιτρέποντας στους μαθητές να δουλεύουν με τον δικό τους ρυθμό και σύμφωνα με τις ικανότητές τους
  </li>
</ul>

<p>
  <a href="http://<%=codeorg_url() %>/learn"><img src="http://<%= codeorg_url() %>/images/tutorials.png" /></a>
</p>

<h2>
  2) Plan your hardware needs - computers are optional
</h2>

<p>
  The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every child, and can even do the Hour of Code without a computer at all.
</p>

<ul>
  <li>
    <strong>Δοκίμασε τους οδηγους στους υπολογιστές ή τις συσκευές των μαθητών.</strong> Βεβαιώσου ότι δουλεύουν σωστά (με ήχο και βίντεο).
  </li>
  <li>
    <strong>Κάνε προεπισκόπηση της σελίδας των συγχαρητηρίων</strong> για να δεις τι θα βλέπουν οι μαθητές όταν τελειώνουν.
  </li>
  <li>
    <strong>Δώσε ακουστικά στην τάξη σου</strong>, ή ζητήστε από τους μαθητές να φέρουν τα δικά τους, αν ο εκπαιδευτικός οδηγός που επιλέγεις λειτουργεί καλύτερα με ήχο.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>Δεν έχεις αρκετές συσκευές;</strong> Χρησιμοποίησε τον <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">προγραμματισμό σε ζευγάρια</a>. Όταν οι μαθητές συνεργάζονται, βοηθούν ο ένας τον άλλο και να βασίζονται λιγότερο στον εκπαιδευτικό. Καταλαβαίνουν επίσης ότι η Επιστήμη των Υπολογιστών είναι κοινωνική και συνεργατική.
  </li>
  <li>
    <strong>Έχεις αργή σύνδεση στο δίκτυο;</strong> Δείξε τα βίντεο κεντρικά σε όλη την τάξη ώστε να μη χρειάζεται ο κάθε μαθητής να κατεβάζει το δικό του βίντεο. Ή δοκίμασε εκπαιδευτικούς οδηγούς που δεν απαιτούν σύνδεση στο Internet.
  </li>
</ul>

<h2>
  4) Inspire students - show them a video
</h2>

<p>
  Show students an inspirational video to kick off the Hour of Code. Examples:
</p>

<ul>
  <li>
    Το αρχικό βίντεο του Code.org, με τον Bill Gates, τον Mark Zuckerberg και τον παίχτη του ΝΒΑ Chris Bosh (Υπάρχουν εκδόσεις <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">1 λεπτού</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">5 λεπτών</a> και <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">9 λεπτών</a>)
  </li>
  <li>
    Το βίντεο ανοίγματος της <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">Εβδομάδας του Κώδικα 2013</a>, ή το βίντεο της <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">Εβδομάδας του Κώδικα 2014</a><% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">Εβδομάδας του Κώδικα 2014</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">Ο πρόεδρος Ομπάμα καλεί όλους του μαθητές να μάθουν την Επιστήμη της Πληροφορικής</a>
  </li>
</ul>

<p>
  <strong>Get your students excited - give them a short intro</strong>
</p>

<p>
  Most kids don’t know what computer science is. Here are some ideas:
</p>

<ul>
  <li>
    Εξήγησε με απλό τρόπο, περιλαμβάνοντας παραδείγματα που θα ενδιαφέρουν και τα αγόρια και τα κορίτσια (π.χ. προστασία της ζωής του ανθρώπου, επικοινωνία, βοήθεια κλπ).
  </li>
  <li>
    Δοκίμασε το εξής: «Σκεφτείτε πράγματα της καθημερινότητάς σας που χρησιμοποιούν την Επιστήμη των Υπολογιστών: το κινητό, ο φούρνος μικροκυμάτων, ο υπολογιστής, τα φανάρια κυκλοφορίας... όλα αυτά χρειάστηκαν έναν επιστήμονα πληροφορικής για να κατασκευαστούν.»
  </li>
  <li>
    Ή: "επιστήμη υπολογιστών είναι η τέχνη της ανάμειξης ανθρώπινων ιδεών και ψηφιακών εργαλείων για να αυξήσουμε την δύναμη μας. Οι επιστήμονες Πληροφορικής εργάζονται σε πάρα πολλούς τομείς: αναπτύσσουν εφαρμογές για τηλέφωνα, βοηθούν στην αντιμετώπιση ασθενιών, δουλεύουν στην ανάπτυξη κοινωνικών δικτύων, κατασκευάζουν ρομπότ που εξερευνούν άλλους πλανήτες και πολλά άλλα."
  </li>
  <li>
    Δες προτάσεις για να κάνεις τα κορίτσια να ενδιαφερθούν για την Επιστήμη της Πληροφορικής <a href="http://<%= codeorg_url() %>/girls"> εδώ</a>.
  </li>
</ul>

<h2>
  5) Start your Hour of Code
</h2>

<p>
  <strong>Direct students to the activity</strong>
</p>

<ul>
  <li>
    Γράψε τον σύνδεσμο για τον οδηγό στον πίνακα. Θα βρεις τον σύνδεσμο στις <a href="http://<%= codeorg_url() %>/learn">πληροφορίες για τον επιλεγμένο οδηγό</a> κάτω από τον αριθμό των συμμετεχόντων. <a href="http://hourofcode.com/co">hourofcode.com/co</a>
  </li>
  <li>
    Πες στους μαθητές να επισκεφτούν τον σύνδεσμο και να ξεκινήσουν τον οδηγό.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Πες στους μαθητές, "Ρώτησε 3 και μετά εμένα." Ρωτήστε 3 συμμαθητές, και αν δεν έχουν την απάντηση, στη συνέχεια ρωτήστε τον καθηγητή.
  </li>
  <li>
    Ενθάρρυνε και ενίσχυσε τους μαθητές: «Τα πας πολύ καλά, συνέχισε την προσπάθεια.»
  </li>
  <li>
    Δεν υπάρχει πρόβλημα να πεις "Δεν γνωρίζω. Ας το βρούμε μαζί." Αν δεν μπορείς να λύσεις ένα πρόβλημα, χρησιμοποίησέ το ως ένα καλό μάθημα για την τάξη: «Η τεχνολογία δεν λειτουργεί πάντα όπως θα θέλαμε. Μαζί, είμαστε μια κοινότητα μάθησης.» Και: «Η εκμάθηση του προγραμματισμού είναι όπως η εκμάθηση μιας νέας γλώσσας. Δεν μιλάς αμέσως πολύ καλά."
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Οι μαθητές μπορούν να δούν όλους του οδηγούς και να δοκιμάσουν και άλλη δραστηριότητα της Ώρας του Κώδικα στο <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
  </li>
  <li>
    Ή, ζήτησε από τους μαθητές που έχουν τελειώσει, να βοηθήσουν του συμμαθητές τους που έχουν δυσκολίες με την δραστηριότητα.
  </li>
</ul>

<p>
  <strong>How do I print certificates for my students?</strong>
</p>

<p>
  Each student gets a chance to get a certificate via email when they finish the <a href="http://studio.code.org">Code.org tutorials</a>. You can click on the certificate to print it. However, if you want to make new certificates for your students, visit our <a href="http://<%= codeorg_url() %>/certificates">Certificates</a> page to print as many certificates as you like, in one fell swoop!
</p>

<p>
  <strong>What comes after the Hour of Code?</strong>
</p>

<p>
  The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. <% if @country == 'uk' %> The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey, <a href="http://uk.code.org/learn/beyond">encourage your children to learn online</a>. <% else %> To continue this journey, find additional resources for educators <a href="http://<%= codeorg_url() %>/educate">here</a>. Or encourage your children to learn <a href="http://<%= codeorg_url() %>/learn/beyond">online</a>. <% end %> <a style="display: block" href="<%= hoc_uri('/#join') %>"><button style="float: right;">Sign up your event</button></a>
</p>