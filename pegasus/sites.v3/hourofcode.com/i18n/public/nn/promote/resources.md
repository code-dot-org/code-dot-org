---
title: <%= hoc_s(:title_resources).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Markedsfør Kodetimen

### Find all the resources you need to bring attention to your Hour of Code. Not sure where to begin? Start with our [how-to guide for hosting an Hour of Code](<%= resolve_url('/how-to') %>)!

---

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Hang these posters in your school

<%= view :promote_new_posters %>

Looking for our posters from previous years? [Find them here](<%= resolve_url('/promote/previous-posters') %>)!

<a id="social"></a>

## Post these on social media

[![image](/images/social-media/fit-250/social-1.png)](/images/social-media/social-1.png)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/social-media/fit-250/social-2.png)](/images/social-media/social-2.png)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/social-media/fit-250/social-3.png)](/images/social-media/social-3.png)&nbsp;&nbsp;&nbsp;&nbsp;

[![image](/images/social-media/fit-250/bill_gates.png)](/images/social-media/bill_gates.png)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/social-media/fit-250/malala_yousafzai.png)](/images/social-media/malala_yousafzai.png)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/social-media/fit-250/chris_bosh.png)](/images/social-media/chris_bosh.png)&nbsp;&nbsp;&nbsp;&nbsp;

[![image](/images/social-media/fit-250/karlie_kloss.png)](/images/social-media/karlie_kloss.png)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/social-media/fit-250/satya_nadella.png)](/images/social-media/satya_nadella.png)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/social-media/fit-250/jeff_bezos.png)](/images/social-media/jeff_bezos.png)&nbsp;&nbsp;&nbsp;&nbsp;

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. En hver referanse til «Kodetimen» burde bli brukt på en slik måte at det ikke tyder på at det er ditt eget merkenavn, men heller reffererer til Kodetimen som en grasrotbevegelse. **Good example**: "Participate in the Hour of Code™ at ACMECorp.com." **Bad example**: "Try Hour of Code by ACME Corp."
2. Use a "TM" superscript in the most prominent places you mention "Hour of Code," both on your web site and in app descriptions.
3. Include language on your page (or in the footer), including links to the CSEdWeek and [Code.org](<%= resolve_url('https://code.org') %>) websites, that says the following:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week [csedweek.org] and Code.org [code.org] to introduce millions of students to one hour of computer science and computer programming.”*

4. Ingen bruk av «Kodetimen» i app navn.

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet) <br />

[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Invite people in your community to your Hour of Code and promote your event through email

### Find [more information and language you can use](<%= resolve_url('/promote/stats') %>) when talking about the Hour of Code.

---

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code <br />

Computers are everywhere, changing every industry on the planet. But only 35% of all high schools teach computer science. Good news is, we’re on our way to change this! If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code <%= campaign_date('year') %>. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Get started at http://hourofcode.com/<%= @country %> <br />

---

<a id="help-schools"></a>

### Volunteer at a school:

#### [Find more resources and information about volunteering in schools here](<%= resolve_url('/how-to/volunteers') %>).

**Subject line:** Can we help you host an Hour of Code?

Between <%= campaign_date('short') %>, ten percent of students around the world will celebrate Computer Science Education Week by doing an Hour of Code at their school. It’s an opportunity for every child to learn how the technology around us works.

[Our organization/My name] would love to help [school name] run an Hour of Code event. We can help teachers host an Hour of Code in their classrooms (we don’t even need computers!) or if you would like to host a school assembly, we can arrange for a speaker to talk about how technology works and what it’s like to be a software engineer.

The students will create their own apps or games they can show their parents, and we’ll also print Hour of Code certificates they can bring home. And, it’s fun! With interactive, hands-on activities, students will learn computational thinking skills in an approachable way.

Computers are everywhere, changing every industry on the planet. But only 35% of all high schools teach computer science. The good news is, we’re on our way to change this! If you've heard about the Hour of Code before, you might know it made history - more than 100 million students around the world have tried an Hour of Code. Even leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

You can read more about the event at http://hourofcode.com. Or, let us know if you’d like to schedule some time to talk about how [school name] can participate. <br />

---

<a id="parents"></a>

### Tell parents about your school's event:

**Subject line:** Our students are changing the future with an Hour of Code

Dear Parents,

We live in a world surrounded by technology. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 35% of all high schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code. Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word. <br />

---

<a id="media-pitch"></a>

### Invite media to attend your event:

#### [Check out our press kit for more information on inviting media to your event.](<%= resolve_url('/promote/press-kit') %>)

**Subject line**: Local school joins mission to introduce students to computer science

Computers are everywhere, changing every industry on the planet, but only 35% of all high schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Den gode nyheita er at vi arbeider for å endre dette.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (December 3-9).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Please join us.

Contact: [YOUR NAME], [TITLE], cell: (212) 555-5555 When: [DATE and TIME of your event] Where: [ADDRESS and DIRECTIONS]

I look forward to being in touch. <br />

---

<a id="politicians"></a>

### Invite a local politician to your school's event:

#### [Need more info? Take a look at our resources for inviting politicians to attend your event](<%= resolve_url('/how-to/public-officials') %>).

**Subject line**: Join our school as we change the future with an Hour of Code

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for every industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

<%= view :signup_button %>