---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Kod Saatını təbliğ edin

## Kod Saatı keçirirsiniz? [Təlimatla tanış olun](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Bu plakatları məktəbinizdə asın

<%= view :promote_posters %>

<a id="social"></a>

## Bunları sosial mediada bölüşün

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Təbliğat üçün Kod Saatının loqosunu istifadə edin

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Yüksək ölçülü versiyasını endir](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent this usage, but we want to make sure it fits within a few limits:**

1. Any reference to "Hour of Code" should be used in a fashion that doesn't suggest that it's your own brand name, but rather referencing the Hour of Code as a grassroots movement. Good example: "Participate in the Hour of Code™ at ACMECorp.com". Bad example: "Try Hour of Code by ACME Corp".
2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
3. Include language on the page (or in the the footer), including links to the CSEdWeek and Code.org web sites, that says the following:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

4. No use of "Hour of Code" in app names.

<a id="stickers"></a>

## Print these stickers to give to your students

(Stickers are 1" diameter, 63 per sheet)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Kod Saatının təbliğ olunmasına kömək etmək üçün bu e-məktubları göndərin

<a id="email"></a>

## Məktəbiniz, iş yeriniz və ya dostlarınızdan qeydiyyatdan keçməyi xahiş edin:

Computers are everywhere, changing every industry on the planet. But fewer than half of all schools teach computer science. Yaxşı xəbər odur ki, bunu dəyişmək üzrəyik. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! və "Disney" səhifələrində idi. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Tədbirinizə media nümayəndələrini dəvət edin:

**Subject line:** Local school joins mission to introduce students to computer science

Computers are everywhere, changing every industry on the planet, but fewer than half of all schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. Yaxşı xəbər odur ki, bunu dəyişmək üzrəyik.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! və "Disney" səhifələrində idi. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly, and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. Bizə qoşulun.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555

**When:** [DATE and TIME of your event]

**Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch.

<a id="parents"></a>

## Valideynlərə məktəbdəki tədbir barədə xəbər verin:

Hörmətli Valideynlər,

We live in a world surrounded by technology. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Fewer than half of all schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). Dünyada 100 milyondan artıq tələbə artıq Kod Saatını sınıyıblar.

Kod Saatı ilə bəyan edirik ki, [MƏKTƏBİN ADI] 21-ci əsrin bu təməl bacarıqlarını öyrətməyə hazırdır. Proqramlaşdırma fəallıqlarını şagirdlərinizə təqdim etməyi davam etdirmək üçün biz Kod Saatı tədbirimizi daha böyük etmək istəyirik. Mən sizi könüllü kimi iştirak etməyə, yerli mətbuata xəbər verməyə, öz sosial media kanallarınızda xəbərləri bölüşməyə və icmalarda əlavə Kod Saatı tədbirləri keçirmək imkanları barədə düşünməyə dəvət edirəm.

Bu, [QƏSƏBƏ/ŞƏHƏR ADI] üçün təhsilin gələcəyini dəyişmək fürsətidir.

Daha ətraflı http://hourofcode.com/<%= @country %> ünvanında oxuyun və bu xəbəri yaymağa kömək edin.

Ən xoş arzularla,

Məktəb direktorunuz

<a id="politicians"></a>

## Yerli siyasət adamını məktəbinizin tədbirinə dəvət edin:

Hörmətli [şəhər meri/icra hakimiyyəti başçısı/millət vəkili SOYADI]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). Dünyada 100 milyondan artıq tələbə artıq Kod Saatını sınıyıblar.

Yazıb, Sizi bizim Kod Saatı tədbirimizdə iştirak edərək, açılış toplantısında çıxış etməyə dəvət edirəm. Tədbir [TARİX, SAAT, MƏKAN] baş tutacaq və güclü bir bəyanat olacaq ki, [ÖLKƏ VƏ YA ŞƏHƏRİN ADI] şagirdlərimizə 21-ci əsrin mühüm əhəmiyyətli bilik və bacarıqlarını öyrətməyə hazırdır. Biz əmin olmaq istəyirik ki, şagirdlərimiz gələcəyin texnologiyalarını yaradanların ön cəbhəsində olsunlar - sadəcə onun istifadəçisi olmasınlar.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Ən xoş arzularla, [NAME], [TITLE]

<%= view :signup_button %>