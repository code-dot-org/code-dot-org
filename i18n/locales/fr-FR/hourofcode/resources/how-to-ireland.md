* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    Comment enseigner une Heure de Code
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
  Nous allons accueillir une variété de tutoriels divertissants, des tutoriels d'une heure pour les étudiants de tout âge, créés par divers partenaires. De nouveaux tutoriels arriveront avant le coup d'envoi de l'Heure de Code du 8 au 14 décembre.
</p>

<p>
  <strong>Tous les tutoriels Heure de Code:</strong>
</p>

<ul>
  <li>
    Nécessitent un minimum de temps de préparation pour les enseignants
  </li>
  <li>
    Sont guidés, permettant aux élèves de travailler à leur rythme et à leur niveau
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
    <strong>Testez les tutoriels sur les ordinateurs ou matériel des élèves.</strong> Assurez-vous que tout fonctionne correctement (avec son et vidéo).
  </li>
  <li>
    <strong>Prévisualisez la page de félicitation</strong> Pour voir ce que les élèves verront lorsqu'ils auront fini.
  </li>
  <li>
    <strong>Fournissez des écouteurs à votre classe</strong>, ou demandez à vos élèves de prendre les leurs, si le tutoriel que vous avez choisi marche mieux avec du son.
  </li>
</ul>

<h2>
  3) Plan ahead based on your technology available
</h2>

<ul>
  <li>
    <strong>Vous n'avez pas assez d'ordinateur?</strong> Faite de la <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">programmation en binôme</a>. Quand les élèves sont en équipe, ils s'entre-aident et sollicitent moins leur enseignant. Ils verront ainsi que l'informatique est social et collaborative.
  </li>
  <li>
    <strong>Vous avez un petit débit internet?</strong> Prévoyez de montrez les vidéo devant toute la classe, comme ça les élèves ne téléchargeront pas leur propre vidéo. Ou essayez les tutoriels hors ligne.
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
    La vidéo originale du lancement de Code.org, avec Bill Gates, Mark Zuckerberg et la joueur de basket ball NBA Chris Bosh (Il y a une version <a href="https://www.youtube.com/watch?v=qYZF6oIZtfc">d'1 minute</a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc">de 5 minutes</a>, et <a href="https://www.youtube.com/watch?v=dU1xS07N-FA">de 9 minutes</a> )
  </li>
  <li>
    La vidéo de lancement de <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">l'Heure de Code 2013</a>, ou la vidéo <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">de l' Heure de Code 2014</a> <% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">de l' Heure de Code 2014</a> <% end %>
  </li>
  <li>
    <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">L'appel à tous les étudiants du Président des Etats-Unis Barack Obama, pour apprendre l'informatique</a>
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
    Expliquez leur de façon simple avec des exemples d'utilisation des ordinateurs qui intéressent aussi bien les filles que les garçons (sauver des vies, aider les gens, connecter les personnes, etc.).
  </li>
  <li>
    Essayez le discours suivant : "Pensez à toutes ces choses que vous utilisez tous les jours dans votre vie et qui s'appuient sur l'informatique : un téléphone, un micro-onde, un ordinateur... toutes ces choses ont eu besoin d'un informaticien pour les construire."
  </li>
  <li>
    Ou encore : "L'informatique est l'art de concilier les outils numériques avec les idées humaines pour nous donner de super-pouvoirs." Les informaticiens travaillent dans de nombreux domaines: ils écrivent des programmes pour nos téléphones, pour guérir des maladies, pour créer des films d'animation, pour travailler sur les réseaux sociaux, pour construire des robots qui explorent d'autres planètes et beaucoup d'autres choses encore. »
  </li>
  <li>
    Voir <a href="http://<%= codeorg_url() %>/girls">ici</a> des trucs et astuces pour intéresser les filles à l'informatique.
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
    Notez l'adresse du tutoriel au tableau. Retrouvez la liste des liens dans <a href="http://<%= codeorg_url() %>/learn">les informations pour votre tutoriel choisi</a> sous le nombre de participants. <a href="http://hourofcode.com/co">hourofcode.com/co</a>
  </li>
  <li>
    Demandez aux élèves d'aller sur le lien et de commencer le tutoriel.
  </li>
</ul>

<p>
  <strong>When your students come across difficulties</strong>
</p>

<ul>
  <li>
    Dites à vos étudiants, "Demandez d'abord à 3 autres camarades.". S'ils n'ont toujours pas de réponse, alors ils peuvent demander à l'enseignant.
  </li>
  <li>
    Encouragez les élèves et donnez leur une vision positive: « Vous êtes sur la bonne voix, continuez. »
  </li>
  <li>
    C'est normal de répondre: "Je ne sais pas." Nous allons essayer d'élucider ça ensemble. » Si vous ne pouvez pas trouver la solution, utilisez l'expérience comme une nouvelle leçon: "la technologie ne fonctionne pas toujours de la façon dont nous voulons." Ensemble, nous sommes une communauté d'apprenants. » Et: "Apprendre à programmer est comme apprendre une nouvelle langue ; vous ne parlerez pas couramment tout de suite. »
  </li>
</ul>

<p>
  <strong>What to do if a student finishes early?</strong>
</p>

<ul>
  <li>
    Les étudiants peuvent voir tous les tutoriels et essayer une autre activité d'Heure de Code à <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
  </li>
  <li>
    Ou bien, demandez leur d'aider leurs camarades qui ont des difficultés à terminer l'activité.
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