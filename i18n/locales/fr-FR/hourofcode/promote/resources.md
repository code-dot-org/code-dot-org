---
title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

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

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Toute référence à « Une Heure de Code » ou Hour of Code doit être utilisée de manière à ne pas suggère qu'il s'agit de votre nom de marque, mais plutôt faire référence à Une Heure de Code comme un mouvement populaire. **Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".**
2. Placez un exposant « TM » aux emplacements principaux dans lesquels vous mentionnez « Hour of Code », aussi bien sur votre site web que dans les descriptions d'application.
3. Inclure la langue dans la page (ou en pied de page), y compris des liens vers les sites web CSEdWeek et Code.org, en indiquant ce qui suit :
    
    *« Une Heure de Code ™ est une initiative nationale organisée durant la semaine d'éducation aux Sciences Informatiques [csedweek.org] et Code.org[code.org] pour initier des millions d'étudiants à une heure d'informatique et à la programmation informatique. »*

4. « Hour of Code » de doit pas être utilisé dans des noms d'application.

<a id="stickers"></a>

## Imprimez ces autocollants pour les donner à vos élèves

(Stickers are 1" diameter, 63 per sheet)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Envoyez ces courriels pour aider à promouvoir Une Heure de Code

<a id="email"></a>

### Demandez à votre école, employeur, ou amis pour vous inscrire:

**Subject line:** Join me and over 100 million students for an Hour of Code

Les ordinateurs sont partout, changeant toute l'industrie sur la planète. But fewer than half of all schools teach computer science. Good news is, we’re on our way to change this! If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Get started at http://hourofcode.com/<%= @country %>

<a id="help-schools"></a>

### Volontaire dans une école:

**Subject line:** Can we help you host and Hour of Code?

Between Dec. 4-10, ten percent of students around the world will celebrate Computer Science Education Week by doing an Hour of Code event at their school. It’s an opportunity for every child to learn how the technology around us works.

[Our organization/My name] would love to help [school name] run an Hour of Code event. We can help teachers host an Hour of Code in their classrooms (we don’t even need computers!) or if you would like to host a school assembly, we can arrange for a speaker to talk about how technology works and what it’s like to be a software engineer.

The students will create their own apps or games they can show their parents, and we’ll also print Hour of Code certificates they can bring home. And, it’s fun! With interactive, hands-on activities, students will learn computational thinking skills in an approachable way.

Les ordinateurs sont partout, changeant toute l'industrie sur la planète. But fewer than half of all schools teach computer science. The good news is, we’re on our way to change this! If you've heard about the Hour of Code before, you might know it made history - more than 100 million students around the world have tried an Hour of Code.

Thanks to the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code, and even leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

You can read more about the event at http://hourofcode.com/. Or, let us know if you’d like to schedule some time to talk about how [school name] can participate.

Merci!

[Your name], [Your organization]

<a id="media-pitch"></a>

### Invite media to attend your event:

**Subject line:** Local school joins mission to introduce students to computer science

Computers are everywhere, changing every industry on the planet, but fewer than half of all schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. La bonne nouvelle, c'est que nous sommes en train de changer cela.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Please join us.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch.

[Your Name]

<a id="parents"></a>

### Tell parents about your school's event:

**Subject line:** Our students are changing the future with an Hour of Code

Chers parents,

Nous vivons dans un monde entouré par la technologie. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Fewer than half of all schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

### Invite a local politician to your school's event:

**Subject line:** Join our school as we change the future with an Hour of Code

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely,

[Your Name], [Title]

<%= view :signup_button %>