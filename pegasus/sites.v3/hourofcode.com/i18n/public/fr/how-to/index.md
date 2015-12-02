---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

# Comment enseigner une Heure de Code

## 1) Inscrivez-vous

  * Inscrivez-vous pour organiser un évènement [Une Heure de Code](<%= resolve_url('/') %>) en tant qu'hôte <%= campaign_date('short') %>.
  * Promouvoir votre [Heure de Code](<%= resolve_url('/promote') %>) et encouragez les autres à en organiser.

## 2) Regardez cette vidéo de présentation <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) Choisissez un tutoriel :

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('https://code.org/learn') %>) for students of all ages, created by a variety of partners. *New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.*

**[Student-guided Hour of Code tutorials:](<%= resolve_url("https://code.org/learn") %>)**

  * Nécessitent un minimum de préparation par les enseignants
  * Sont guidés, pour permettre aux élèves de travailler à leur rythme et à leur niveau

**[Teacher-guided Hour of Code tutorials:](<%= resolve_url("https://code.org/educate/teacher-led") %>)**

  * Are lesson plans that require some advance teacher preparation
  * Are categorized by grade level *and* by subject area (eg Math, English, etc)

[![](/images/fit-700/tutorials.png)](<%= resolve_url('https://code.org/learn') %>)

## 4) Planifiez vos besoins technologiques - les ordinateurs sont facultatifs

Une expérience Une Heure de Code enrichissante nécessite des ordinateurs connectés à Internet. Vous **n'avez toutefois pas** besoin d'un ordinateur pour chaque enfant ; vous pouvez même organiser Une Heure de Code sans aucun ordinateur.

  * Testez les tutoriels sur les ordinateurs ou appareils mis à votre disposition. Assurez-vous qu'ils fonctionnent correctement sur les navigateurs, notamment le son et la vidéo.
  * Distribuez des écouteurs dans votre classe, ou demandez aux élèves d'apporter les leurs, si le tutoriel que vous choisissez fonctionne mieux avec le son.
  * **Vous n'avez pas suffisamment de materiel informatique ?** Mettez en place [des binômes pour la programmation](https://www.youtube.com/watch?v=vgkahOzFH2Q). Quand les élèves sont en équipe, ils s'entraident et sollicitent moins leur enseignant. Ils verront ainsi que l'informatique est une discipline sociale et collaborative.
  * **Vous avez une connexion internet lente ?** Prévoyez de montrer les vidéos devant toute la classe, ainsi, les élèves n'auront pas à les télécharger. Autrement, essayez les tutoriels qui ne requièrent pas de connexion.

![](/images/fit-350/group_ipad.jpg)

## 5) Inspirez les élèves pour démarrer votre Heure de Code

**Invite a [local volunteer](https://code.org/volunteer/local) to inspire your students by talking about the breadth of possibilities with computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code. [Use this map](https://code.org/volunteer/local) to find local volunteers who can visit your classroom or join a video chat with your students.

[![](/images/fit-300/volunteer-map.png)](<%= resolve_url('https://code.org/volunteer/local') %>)

**Montrez une vidéo inspirante :**

  * La vidéo originale du lancement de Code.org, avec Bill Gates, Mark Zuckerberg et la star de la NBA Chris Bosh (Il y a une version [d'1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [de 5 minutes](https://www.youtube.com/watch?v=nKIu9yen5nc), et [de 9 minutes](https://www.youtube.com/watch?v=dU1xS07N-FA) disponible )
  * La [vidéo de lancement de Une Heure de Code 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw), ou le <% if @country == 'uk' %> [la vidéo Une Heure de Code 2015](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [Une Heure de Code 2015](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [Le président Obama a lancé un appel, invitant tous les étudiants à apprendre l'informatique](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Trouvez plus de vidéos inspirantes [ici](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Ce n'est pas grave si vous ou vos élèves êtes novices en informatique. Voici quelques idées pour présenter votre Heure de Code :**

  * Expliquez la manière dont les nouvelles technologies impactent notre vie, avec des exemples qui parleront aux garçons et aux filles (parlez des technologies qui permettent de sauver des vies, d'aider les gens, ou de relier les personnes entre elles, etc..).
  * En classe, rédigez une liste des choses qui requièrent du code dans la vie quotidienne.
  * Découvrez [ici](<%= resolve_url('https://code.org/girls') %>) les conseils pour intéresser les jeunes filles à l'informatique.

**Besoin de plus de conseils ?** Téléchargez [cet exemple de leçon](/files/EducatorHourofCodeLessonPlanOutline.docx).

**Vous voulez des idées de cours supplémentaires ?** Découvrez les [meilleures pratiques](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) d'éducateurs expérimentés.

## 6) Codez !

**Aidez les élèves pendant l'activité**

  * Écrivez le lien du tutoriel sur un tableau blanc. Trouvez le lien [d'information pour le tutoriel sélectionné](<%= resolve_url('https://code.org/learn') %>) sous le nombre de participants.

**Quand vos élèves rencontrent des difficultés, il est normal de répondre :**

  * « Je ne sais pas. Réfléchissons à cela ensemble. »
  * « La technologie ne fonctionne pas toujours de la façon dont nous le voulons. »
  * « L'apprentissage de la programmation c'est comme apprendre une nouvelle langue ; vous ne serez pas bilingue tout de suite. »

**[Check out these teaching tips](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**Que faire si un élève termine plus tôt ?**

  * Les étudiants peuvent regarder tous les tutoriels et essayer une autre activité Une Heure de Code sur [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>)
  * Sinon, demandez aux élèves qui ont terminé plus tôt d'aider ceux qui ont des difficultés avec l'activité.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Fêtez cela !

  * [Imprimez des certificats](<%= resolve_url('https://code.org/certificates') %>) pour vos élèves.
  * [Imprimez des autocollants "J'ai fait une heure de Code!"](<%= resolve_url('/promote/resources#stickers') %>) pour vos élèves.
  * [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for your school.
  * Partagez les photos et vidéos de votre évènement Une Heure de Code sur les réseaux sociaux. Utilisez #HourOfCode et @codeorg, que nous puissions mettre en évidence votre succès, également !

[col-33]

![](/images/fit-250/celebrate2.jpeg)

[/col-33]

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Autres ressources d'une Heure de Code pour les éducateurs :

  * Utilisez cet [exemple de plan de cours](/files/EducatorHourofCodeLessonPlanOutline.docx) pour organiser au mieux votre Heure de Code.
  * Découvrez les [bonnes pratiques](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) des derniers organisateurs Une Heure de Code. 
  * Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
  * [Attend a live Q&A](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) with our founder, Hadi Partovi to prepare for the Hour of Code.
  * Visitez le [Forum enseignant d'Une Heure de Code](http://forum.code.org/c/plc/hour-of-code) pour obtenir des conseils, un aperçu et soutenir d'autres éducateurs. <% if @country == 'us' %>
  * Revoir [la Foire aux Question Une Heure du Code](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Et après l'Heure de Code ?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey:

  * Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [Attend](<%= resolve_url('https://code.org/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>