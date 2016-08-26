* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## यी पोस्टरहरूलाई तपाइँको विद्यालयमा झुण्डयाउनुहोस्

<%= view :promote_posters %>

<a id="social"></a>

## Post these on social media

[![छवि](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![छवि](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![छवि](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![छवि](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. "Hour of Code" को लागि कुनै पनि सन्दर्भलाई यसले तपाइँको आफ्नो ब्र्याण्ड नामलाई, तर Hour of Code लाई ग्रामीण स्तरका गतिको रूपमा सन्दर्भित गर्नु भन्दा सुझाव नगर्ने फेसनमा प्रयोग गरिएको हुन्छ। Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. भाषा पृष्ठमा समावेश गर्नुहोस् (वा फुटरमा), निम्न लिखित कुरा भन्ने CSEdWeek र Code.org वेब साइटहरूको लिङ्कहरूको समावेश गर्दैछ:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![छवि](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Hour of Code को प्रवर्द्धनमा मदत गर्न यी इमेलहरू पठाउनुहोस्

<a id="email"></a>

## तपाइँको विद्यालय, कर्मचारी वा साथीहरूलाई साइन अप गर्न सोध्नुहोस्:

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. राम्रो खबर हो, हामीले हाम्रो बाटोबाट यसलाई परिवर्तन गरि राखेका छौँ। If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! र डिजनीको गृहपृष्ठ थियो। Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## तपाइँको घटनामा सामेल हुन मिडियालाई बोलाउनुहोस्:

**Subject line:** Local school joins mission to introduce students to computer science

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. राम्रो खबर हो, हामीले हाम्रो बाटोबाट यसलाई परिवर्तन गरि राखेका छौँ।

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! र डिजनीको गृहपृष्ठ थियो। Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

मैले तपाइँलाई हाम्रो सुरु गर्ने विधानसभामा भाग लिन निमन्त्रणा लेख्दै छु, र [DATE]मा बच्चाहरूको गतिविधि सुरु गर्न हेर्नुहोस्।

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. कृपया हामीसँग आवद्ध हुनुहोस्।

**सम्पर्क:** [YOUR NAME], [TITLE], सेल नं: (212) 555-5555

**कहिले:** [तपाइँको घटनाको DATE र TIME]

**कहाँ:** [ADDRESS र DIRECTIONS]

म सम्पर्कमा रहन तत्पर छु।

<a id="parents"></a>

## तपाइँको विद्यालयको घटनाको बारेमा अभीभावकहरूलाई भन्नुहोस्:

आदरणीय अभीभावकहरू,

हामी प्रविधिद्वारा घेरिएको संसारमा बस्छौँ। And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## तपाइँको विद्यालयको घटनामा स्थानीय राजनीतिलाई बोलाउनुहोस्:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]