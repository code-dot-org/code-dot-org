---
title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Marknadsför Hour of Code

## Ska du hålla en Hour of Code? [Titta på guiden](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Sätt upp dessa affischer på din skola

<%= view :promote_posters %>

<a id="social"></a>

## Posta dessa på sociala medier

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Använd Hour of Code logotypen för att sprida ordet

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Ladda ner högupplösta versioner](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Alla hänvisningar till "Hour of Code" bör användas på ett sätt som inte tyder på att det är ditt eget varumärke, hänvisa hellre till Hour of Code som en gräsrotsrörelse. **Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".**
2. Använd en "TM" upphöjd i de mest framträdande platser du nämner "Hour of Code", både på webbplatsen och i appbeskrivningar.
3. Inkludera språk på sidan (eller i sidfoten), inklusive länkar till webbplatserna CSEdWeek och Code.org, som säger följande:
    
    *"Hour of Code™' är ett rikstäckande initiativ av Computer Science Week[csedweek.org] och Code.org[code.org] för att miljoner elever ska introduceras till en timme av datavetenskap och programmering."*

4. Ingen användning av "Hour of Code" i appnamn.

<a id="stickers"></a>

## Skriv ut dessa klistermärken till dina elever

(Klistermärken är 1" diameter, 63 per ark)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Skicka dessa e-postmeddelanden för att främja Hour of Code

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

Computers are everywhere, changing every industry on the planet. But fewer than half of all schools teach computer science. Good news is, we’re on our way to change this! If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code <%= campaign_date('year') %>. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Get started at http://hourofcode.com/<%= @country %>

<a id="help-schools"></a>

### Volunteer at a school:

**Subject line:** Can we help you host and Hour of Code?

Between <%= campaign_date('short') %>, ten percent of students around the world will celebrate Computer Science Education Week by doing an Hour of Code event at their school. It’s an opportunity for every child to learn how the technology around us works.

[Our organization/My name] would love to help [school name] run an Hour of Code event. We can help teachers host an Hour of Code in their classrooms (we don’t even need computers!) or if you would like to host a school assembly, we can arrange for a speaker to talk about how technology works and what it’s like to be a software engineer.

The students will create their own apps or games they can show their parents, and we’ll also print Hour of Code certificates they can bring home. And, it’s fun! With interactive, hands-on activities, students will learn computational thinking skills in an approachable way.

Computers are everywhere, changing every industry on the planet. But fewer than half of all schools teach computer science. The good news is, we’re on our way to change this! If you've heard about the Hour of Code before, you might know it made history - more than 100 million students around the world have tried an Hour of Code.

Thanks to the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code, and even leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

You can read more about the event at http://hourofcode.com/. Or, let us know if you’d like to schedule some time to talk about how [school name] can participate.

Thanks!

[Your name], [Your organization]

<a id="media-pitch"></a>

### Invite media to attend your event:

**Subject line:** Local school joins mission to introduce students to computer science

Computers are everywhere, changing every industry on the planet, but fewer than half of all schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Goda nyheter är, vi är på väg att ändra detta.

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

Dear Parents,

We live in a world surrounded by technology. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

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