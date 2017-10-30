---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Код саатын илгерилетүү

## Код саатын кабыл алып жатасыңарбы?<a href="<%= resolve_url('/how-to') %>Кантип өткөзсө болорун карагыла</a>

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Бул постерди мектепте илип койгула

<%= view :promote_posters %>

<a id="social"></a>

## Муну социалдык желелерге чыгаргыла

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Маалымат таратууда Код саатынын логосун колдонгула

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Жогорку чечимдеги версиясын жүктөп алгыла](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. "Код сааты" - силердин жеке брэндиңер катары эмес, "Код сааты" - коомдук кыймыл катары колдонулушу керек.
    
    - Туура мисал: "ACMECorp.com'до өтүп жаткан Код саатына™ катышыңыз". 
    - Туура эмес мисал: "ACME Corp'тун Код саатына катышкыла".
2. "Код сааты" айтылган учурларда вебсайттын же колдонмолордун түшүндүрмөсүндө саптын үстүндө берилүүчү "TM" жазуусу менен коштогула.
3. Веб-барактын баяндамасында (же этегине) CSEdWeek жана Code.org вебсайттарына шилтеме бергиле жана бул маалыматтарды кошкула:
    
    *" 'Код сааты™' - бир сааттын ичинде миллиондогон студенттерди информатика менен компүтер програмдоо менен тааныштыруу максатында Информатика Аптасы[csedweek.org] менен Code.org[code.org] демилгелеген эл аралык иш-чара."*

4. "Код сааты" - колдонмонун атында болбошу керек.

<a id="stickers"></a>

## Бул чаптамаларды бастырып, окуучуларга тараткыла

(Чаптама 1" диаметр, бир баракта 63)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Код саатын илгерилетүү үчүн бул эмейлдерди жөнөткүлө

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

Компүтерлер планетадагы бардык тармактарды өзгөртүүдө. Бирок мектептердин жарымынан көбү компүтердик билим бербейт. Good news is, we’re on our way to change this! "Код сааты" тууралуу мурун уккан болсоңор, ал тарыхка киргенин дагы билсеңер керек. 100 миллиндон ашык киши Код саатын байкап көрүштү.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. 100 ашык өнөк бул кыймылды колдоо үчүн биригишти. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Башкаларга билдиргиле. Иш-чара өткөргүлө. Жергиликтүү мектептерден катталуусун сурангыла. Же Код саатын өзүңөр байкап көргүлө - негиздерди билүү баарына пайдалуу.

Http://hourofcode.com/ сайтына кирип баштагыла<%= @country %>

<a id="media-pitch"></a>

### Медиаларды иш-чараңарга катышууга чакыргыла:

**Темасы:** Жергиликтүү мектеп окуучуларга компүтердик програмдоону таанытуу кыймылына кошулду

Компүтерлер планетадагы бардык тармактарды өзгөртүүдө, бирок мектептердин жарымынан көбү компүтердик билим бербейт. Кыздар жана азчылыктар компүтердик билим берүү жана технологиялар класстарында аз окушат. Жакшы жаңылык - биз бул абалды өзгөртүүдөбүз.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. 100 ашык өнөк бул кыймылды колдоо үчүн биригишти. Ар бир Apple Store Код саатын өткөздү. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Бизге кошулгула.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### Ата-энеңерге мектептеги иш-чара тууралуу айтып бергиле:

**Subject line:** Our students are changing the future with an Hour of Code

Урматуу ата-эне,

Биз технологиялар курчаган дүйнөдө жашайбыз. Окуучулар келечекте кандай гана кесипти тандап албасын, алардын ийгилиги технологиялардын иштөө жолун түшүнүүсүнө байланыштуу болот.

Бирок технологиялар **кандай** иштээрин түшүнгөндөр бир ууч топ. Мектептердин жарымынан көбү компүтердик билим бербейт.

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

[NAME], [TITLE]

<%= view :signup_button %>