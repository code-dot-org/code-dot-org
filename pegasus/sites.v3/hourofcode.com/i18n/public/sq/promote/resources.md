---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promovo Orën e Kodimit

## Po organizoni një Orë Kodimi? [ Shikoni udhëzimet](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Vendosni këta posterë në shkollën tuaj

<%= view :promote_posters %>

<a id="social"></a>

## Postojini në mediat sociale

[![Foto](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![Foto](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![Foto](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Përdorni logon e Orës së Kodimit për të përhapur fjalë

[![Foto](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Shkarkoni versionin hi-res](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. Çdo referencë për "Orën e Kodimit" duhet të përdoret në një mënyrë që nuk sugjeron që është emri i markës suaj, por më tepër referenca për Orën e Kodimit si një lëvizje bazë. Shembull i mire: "Merr pjese ne Oren e Kodimit™ ne ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Përfshini gjuhën në faqe (ose në fund), duke përfshirë edhe lidhjet me faqet e web-it të CSEdWeek dhe Code.org, që thonë si në vijim:
    
    *"Ora e Kodimit" është një nismë në shkallë vendi nga Java Edukative e Shkencave Kompjuterike[csedweek.org] dhe Code.org [code.org] për të futur miliona studentë për një orë në shkencën kompjuterike dhe programimin kompjuterik. "*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Printoni këto stiksat për t'ja dhënë studentëve të tu

(Stickers are 1" diameter, 63 per sheet)  
[![Foto](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Dërgoni këto emaile për të ndihmuar në promovimin e Orës së Kodimit

<a id="email"></a>

## Ftoni shkollat, punëdhënësit apo miqtë tuaj të regjistrohen:

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. Lajmi i mirë është se jemi në rrugë a sipër për ta ndryshuar këtë. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

Me Orën e Kodimit, shkenca kompjuterike ka qënë faqe kryesore e Google, MSN, Yahoo! dhe Disney-it. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Fillo te http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Ftoni mediat të bëhen pjesë e eventit tuaj:

**Subjekti:** Shkolla vendore i bashkohet synimit për të familjarizuar 100 milion studentë me shkencat kompjuterike

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Lajmi i mirë është se jemi në rrugë a sipër për ta ndryshuar këtë.

Me Orën e Kodimit, shkenca kompjuterike ka qënë faqe kryesore e Google, MSN, Yahoo! dhe Disney-it. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

Po ju shkruaj për t'iu ftuar të bëheni pjesë e takimit lançues si dhe të ndiqni fëmijët teksa marrin pjesë në aktivitetin tonë më [DATA].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Të lutem bashkohu edhe ti.

**Kontakti:** [YOUR NAME], [TITLE], tel: (212) 555-5555

**Kur:** [DATA dhe KOHA e eventit tuaj]

**Ku:** [ADRESA dhe UDHËZIMET]

Shpresojmë të jemi në kontakt.

<a id="parents"></a>

## Njoftoni prindërit për eventin në shkollën tuaj:

Të dashur prindër,

Jetojmë në një botë të rrethuar nga teknologjia. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Ftoni një politikan në eventin e shkollës suaj:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]