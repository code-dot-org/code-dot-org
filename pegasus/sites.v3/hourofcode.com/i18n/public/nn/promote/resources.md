---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Markedsfør Kodetimen

## Skal du holde en Kodetime? <a

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Heng opp desse plakatane på skulen din

<%= view :promote_posters %>

<a id="social"></a>

## Post desse i sosiale media

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Bruk Kodetimelogoen for å spre ordet

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Last ned høyoppløselige versjoner](http://images.code.org/share/hour-of-code-logo.zip)

**"Kodetimen" er ikke varemerkebeskyttet. Vi ønsker ikke å forhindre bruken, men vi vil passe på at den passer innenfor et par rammer:**

  1. En hver referanse til «Kodetimen» burde bli brukt på en slik måte at det ikke tyder på at det er ditt eget merkenavn, men heller refererer til Kodetimen som en grasrotbevegelse. Godt eksempel: "Delta i Kodetimen™ på ACMECorp.com". Dårlig eksempel: «Prøv Kodetimen fra ACME Corp».
  2. Bruk et hevet "TM" på de mest fremtredende stedene du nevner "Kodetimen", både på nettsiden og i beskrivelser av apper.
  3. Inkluder språk på siden (eller som bunntekst), inkluder lenker til CSEdWeek og Code.org sidene, som sier følgende:
    
    *"" Hour of Code™"er et landsdekkende initiativ av Computer Science Education Week[csedweek.org] og Code.org[code.org] for å bruke en time til å presentere informatikk og programmering til millioner av studenter."*

  4. Ingen bruk av «Kodetimen» i app navn.

<a id="stickers"></a>

## Skriv ut og gi disse klistremerkene til elever

(Klistremerkene er 1" diameter, 63 per ark)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Send desse e-postane for å promotere Kodetimen

<a id="email"></a>

## Be skulen, arbeidsgivaren eller vener om å registrere seg:

Datamaskiner er over alt og endrer alle bransjer på planeten. Men færre enn halvparten av alle skoler underviser informatikk. Den gode nyheita er at me arbeider for å endre dette. Hvis du har hørt om Kodetimen før, vet du kanskje at den ble historisk. Over hundre millioner elever har prøvd en Kodetime.

Med Kodetimen har informatikk vært på hjemmesidene til Google, MSN, Yahoo! og Disney. Mer enn 100 partnere har blitt med og støttet denne bevegelsen. Hver Apple Store i verden har hatt en Kodetime. President Obama skrev sin første kodelinje som en del av kampanjen.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Inviter media til å dekke arrangementet:

**Subject line:** Local school joins mission to introduce students to computer science

Computers are everywhere, changing every industry on the planet, but fewer than half of all schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Den gode nyheita er at me arbeider for å endre dette.

Med Kodetimen har informatikk vært på hjemmesidene til Google, MSN, Yahoo! og Disney. Mer enn 100 partnere har blitt med og støttet denne bevegelsen. Hver Apple Store i verden har hatt en Kodetime. President Obama skrev sin første kodelinje som en del av kampanjen.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly, and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Please join us.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555

**When:** [DATE and TIME of your event]

**Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch.

<a id="parents"></a>

## Fortel foreldre om skulen sitt arrangement:

Dear Parents,

We live in a world surrounded by technology. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Fewer than half of all schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Inviter ein lokalpolitikar til skulens arrangement:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]

<%= view :signup_button %>