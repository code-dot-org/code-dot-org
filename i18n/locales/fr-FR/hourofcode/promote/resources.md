* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promouvoir Une Heure de Code

## Vous voulez organiser Une Heure de Code ? [Lisez le guide pratique](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Accrochez ces affiches dans votre école

<%= view :promote_posters %>

<a id="social"></a>

## Publiez-les sur les médias sociaux

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Utilisez le logo Une Heure de Code pour diffuser l'information

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Téléchargez les versions haute résolution](http://images.code.org/share/hour-of-code-logo.zip)

**Le nom anglais « Hour of Code » est une marque déposée. Nous ne voulons pas empêcher son utilisation, mais nous souhaitons nous assurer qu'elle respecte certaines limites :**

  1. Toute référence à « Une Heure de Code » ou Hour of Code doit être utilisée de manière à ne pas suggère qu'il s'agit de votre nom de marque, mais plutôt faire référence à Une Heure de Code comme un mouvement populaire. Bon exemple: « Participer à Une Heure de Code ™ sur ACMECorp.com ». Mauvais exemple : « Essayez Hour of Code par ACME Corp ».
  2. Placez un exposant « TM » aux emplacements principaux dans lesquels vous mentionnez « Hour of Code », aussi bien sur votre site web que dans les descriptions d'application.
  3. Inclure la langue dans la page (ou en pied de page), y compris des liens vers les sites web CSEdWeek et Code.org, en indiquant ce qui suit :
    
    *« Une Heure de Code ™ est une initiative nationale organisée durant la semaine d'éducation aux Sciences Informatiques [csedweek.org] et Code.org[code.org] pour initier des millions d'étudiants à une heure d'informatique et à la programmation informatique. »*

  4. « Hour of Code » de doit pas être utilisé dans des noms d'application.

<a id="stickers"></a>

## Imprimez ces autocollants pour les donner à vos élèves

(Il y a 63 autocollants d'un pouce de diamètre par feuille)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Envoyez ces courriels pour aider à promouvoir Une Heure de Code

<a id="email"></a>

## Proposez à votre école, votre employeur ou vos amis de s'inscrire :

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. La bonne nouvelle, c'est nous sommes sur le point de changer cela. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

Avec l'événement Une Heure de Code, l'informatique fait la une de Google, MSN, Yahoo! et Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Commencez sur http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Invitez les médias à assister à votre événement :

**Titre :** Une école locale se joint à la campagne de sensibilisation des élèves à l'informatique

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. La bonne nouvelle, c'est nous sommes sur le point de changer cela.

Avec Une Heure de Code, l'informatique fait la une de Google, MSN, Yahoo ! et Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

Je vous écris pour vous inviter à assister au coup d'envoi de notre campagne et à voir les enfants commencer leur Heure de Code le [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Rejoignez-nous.

**Contact :** [VOTRE NOM], [TITLE], portable : [NUMÉRO]

**Quand :** [DATE et HEURE de votre événement]

**Où :** [ADRESSE et DIRECTIONS]

J'ai hâte d'échanger avec vous.

<a id="parents"></a>

## Informez les parents d'élèves au sujet de l'événement dans votre école :

Chers parents d'élèves,

Nous vivons dans un monde où la technologie est omniprésente. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Invitez un politicien local à l'événement de votre école :

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]