---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## قم بتعليق هذه الملصقات في مدرستك

<%= view :promote_posters %>

<a id="social"></a>

## انشر هذه على مواقع التواصل الاجتماعي

[![الصورة](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![الصورة](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![الصورة](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![الصورة](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

  1. Any reference to "Hour of Code" should be used in a fashion that doesn't suggest that it's your own brand name, but rather referencing the Hour of Code as a grassroots movement. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
  2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
  3. Include language on the page (or in the the footer), including links to the CSEdWeek and Code.org web sites, that says the following:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

  4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![الصورة](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## أرسل هذه الرسائل للمساعدة على الترويج لحدث ساعة من البرمجة

<a id="email"></a>

## اطلب من مدرستك، مديرك أو أصدقائك أن يقوموا بالتسجيل:

أجهزة الكمبيوتر موجودة في كل مكان، ولكن هناك أقل مدارس تعلم علوم الحاسوب مقارنة مع 10 سنوات مضت. الخبر السار، أننا في طريقنا لنغير ذلك. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! وديزني. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

انشر هذه الكلمة. استضف الحدث. اطلب من مدرستك المحلية أن تشارك في الحدث. أو جرب ساعة من البرمجة بنفسك -- الجميع يمكنه الاستفاة من تعلم الأساسيات.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## قم بدعوة الإعلام لتغطية الحدث عندك:

**Subject line:** Local school joins mission to introduce students to computer science

الحواسيب في كل مكان. ولكن القليل من المدارس تعلم علوم الحاسب مقارنة بالعشر سنوات الماضية. الإناث والأقليات غير مثقفين فيه بالدرجة الكافية. الخبر السار، أننا في طريقنا لتغيير ذلك.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! وديزني. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

أنا أكتب لكم لأدعوكم لحضور افتتاحية هذا الحدث ولتشاهد الأطفال يبدؤون هذا النشاط في [DATE].

ساعة من البرمجة، حدث تم تنظيمه من قبل مؤسسة Code.org غيرالربحية ومايزيد على 100 مؤسسة أخرى، أثبتت فيه أن جيل اليوم من الطلاب مستعدون لتعلم المهارات اللازمة للنجاح في القرن الحادي والعشرين. نرجو أن تنضم إلينا.

**للاتصال:**، [YOUR NAME]، [TITLE]، جوال: (212) 555-5555

**When:** [DATE and TIME of your event]

**Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch.

<a id="parents"></a>

## Tell parents about your school's event:

Dear Parents,

We live in a world surrounded by technology. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly hinge on understanding how technology works. But only a tiny fraction of us are learning computer science, and less students are studying it than a decade ago.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (Dec. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## Invite a local politician to your school's event:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that in today’s economy, computing jobs outnumber students graduating into the field by 3-to-1? And, computer science is foundational for *every* industry today. Yet most of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (Dec. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future--not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]

