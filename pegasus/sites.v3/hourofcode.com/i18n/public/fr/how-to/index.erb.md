---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# How to teach one Hour of Code with your class

### Rejoignez le mouvement et initiez un groupe d'élèves à leur première heure d'informatique grâce à ces étapes. L'Heure de Code est facile à exécuter - même pour les débutants! Si vous souhaitez que quelqu'un vous aide à animer l'Heure de Code dans votre classe, vous pouvez trouver un [bénévole local](<%= codeorg_url('/volunteer/local') %>).

### Take a look at our [participation guide if you still have questions](<%= localized_file('/files/participation-guide.pdf') %>).

---

## 1. Regarder cette vidéo de formation <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2) Choisissez un tutoriel pour votre session

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Faire la promotion de votre Heure de Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4) Déterminez quels sont vos besoins en matériel - vous n'avez pas forcément besoin d'ordinateur

Pour tirer le meilleur parti de l'Heure de Code, il est préférable de disposer d'ordinateurs reliés à internet. Mais vous **n'avez pas besoin** de disposer d'un ordinateur pour chaque étudiant, et vous pouvez même suivre l'Heure de Code sans aucun ordinateur.

Testez les tutoriels sur les ordinateurs ou appareils mis à votre disposition. Assurez-vous qu'ils fonctionnent correctement sur les navigateurs, notamment le son et la vidéo. **Vous avez une connexion internet lente ?** Prévoyez de montrer les vidéos devant toute la classe pour que les élèves n'aient pas à les télécharger. Vous pouvez aussi essayer les tutoriels qui ne requièrent pas de connexion.

Distribuez des écouteurs dans votre classe, ou demandez aux élèves d'apporter les leurs, si le tutoriel que vous choisissez fonctionne mieux avec le son.

**Vous n'avez pas suffisamment de matériel informatique ?** Mettez en place [des binômes pour la programmation](https://www.youtube.com/watch?v=vgkahOzFH2Q). Quand les élèves sont en équipe, ils s'entraident et sollicitent moins leur enseignant. Ils découvriront ainsi que l'informatique est une discipline qui favorise les interactions sociales et la collaboration.

<img src="/images/fit-350/group_ipad.jpg" />

## 5) Débutez votre Heure de Code avec un orateur ou une vidéo qui donne de l'enthousiasme

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Montrez une vidéo qui inspire :**

- La vidéo de lancement originale de Code.org avec Bill Gates, Mark Zuckerberg et la star de la NBA Chris Bosh. (des versions d'[1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), de [5 minutes](https://www.youtube.com/watch?v=nKIu9yen5nc) et de [9 minutes](https://www.youtube.com/watch?v=dU1xS07N-FA) sont disponibles)
- Retrouvez ici d'autres [ressources](<%= codeorg_url('/inspire') %>) et des [vidéos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Expliquez la manière dont les nouvelles technologies impactent notre vie, grâce à des exemples qui parleront aux garçons comme aux filles (parlez des technologies qui permettent de sauver des vies, d'aider les gens, ou de connecter les gens entre eux, etc.).
- En classe, rédigez une liste des choses qui nécessitent de faire de la programmation dans la vie quotidienne.
- Découvrez [ici](<%= codeorg_url('/girls')%>) des astuces pour amener les filles à s'intéresser à l'informatique.

## 6) Programmez !

**Direct students to the activity**

- Notez sur un tableau le lien vers le tutoriel. Vous pouvez trouver ce lien sur la [fiche d'information du tutoriel choisi](<%= resolve_url('/learn')%>), sous le nombre de participants.

**When your students come across difficulties it's okay to respond:**

- « Je ne sais pas. Regardons à cela ensemble. »
- « La technologie ne fonctionnent pas toujours de la façon dont nous le voulons. »
- «Apprendre à programmer, c'est un peu comme apprendre une nouvelle langue; on ne peut pas être tout de suite bilingue.»

**What if a student finishes early?**

- Les élèves peuvent consulter tous les tutoriels et [essayer une autre activité Heure de Code](<%= resolve_url('/learn')%>).
- Ou encore, demandez aux élèves qui ont terminé plus tôt d'aider les camarades qui rencontrent des difficultés avec l'activité.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Fêter

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Imprimez des certificats](<%= codeorg_url('/certificates')%>) pour vos élèves.
- [Imprimez des autocollants « J'ai fait Une Heure de Code ! »](<%= resolve_url('/promote/resources#stickers') %>) pour vos élèves.
- [Commandez des t-shirts personnalisés](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) pour votre école.
- Partagez les photos et les vidéos de votre événement l'Heure de Code sur les réseaux sociaux. Utilisez les mots-clefs #HourOfCode et @codeorg, pour que nous aussi, nous puissions mettre en avant votre réussite !

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Autres ressources de l'Heure de Code pour les éducateurs :

- Visitez le [forum des enseignants de l'Heure de Code](http://forum.code.org/c/plc/hour-of-code) pour obtenir des conseils, des approfondissements et du soutien de la part des autres éducateurs. <% if @country == 'us' %>
- Revoir [la Foire aux Question Une Heure du Code](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Et après l'Heure de Code ?

L'Heure de Code n'est que la première étape pour en apprendre plus sur le fonctionnement des nouvelles technologies et comment créer des applications. Pour continuer l'aventure :

- Encouragez vos élèves à continuer à [apprendre en ligne](<%= codeorg_url('/learn/beyond')%>).
- [Participez](<%= resolve_url('https://code. org/professional-development-workshops') %>) en personne à un atelier d'une journée, afin d'être formé par un animateur expérimenté dans le domaine de l'informatique. (seulement aux États-Unis)

<%= view :signup_button %>