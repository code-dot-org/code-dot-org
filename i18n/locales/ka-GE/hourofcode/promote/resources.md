* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# გაუწიეთ პოპულარიზაცია კოდის ერთ საათს

## ატარებთ "კოდის ერთ საათს"? <a

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## გააკარით ეს პლაკატები თქვენს სკოლაში

<%= view :promote_posters %>

<a id="social"></a>

## გამოაქვეყნეთ სოციალურ მედიაში

[![გამოსახულება](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![გამოსახულება](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![გამოსახულება](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## გამოიყენეთ კოდის ერთი საათის ლოგო ხმის გასავრცელებლად

[![გამოსახულება](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[მაღალი გარჩევადობის ვერსიების გადმოწერა](http://images.code.org/share/hour-of-code-logo.zip)

**"კოდის ერთი საათი" არის სავაჭრო ნიშანი. ჩვენ არ გვსურს ამ გამოყენების შეზღუდვა, მაგრამ გვინდა დავრწმუნდეთ, რომ იგი გარკვეულ წესებს შეესაბამება:**

  1. ნებისმიერი მითითება "კოდის ერთ საათზე" უნდა გამოყენებულ იქნეს ისე, რომ გამოჩნდეს არა როგორც თქვენი ბრენდის სახელი, არამედ როგორც მითითება კოდის ერთ საათზე, როგორც საერთაშორისო მოძრაობაზე. კარგი მაგალითი: "მიიღეთ მონაწილეობა კოდის ერთი საათში™ ACMECorp.com-ზე". ცუდი მაგალითი: "სცადეთ კოდის ერთი საათი ACME Corp-ის მეშვეობით".
  2. გამოიყენეთ "TM" ზედა ინდექსი ყველაზე გამოსაჩენ ადგილებში სადაც ახსენებთ "კოდის ერთ საათს", თქვენს ვებგვერდზეც და აპლიკაციის აღწერილობაშიც.
  3. ჩასვით ტექსტი თქვენს გვერდზე, CSEdWeek-ის ბმულებისა და Code.org-ის ვებგვერდების ჩათვლით, რომელშიც შემდეგი რამ იქნება გადმოცემული:
    
    *"'კოდის ერთი საათი™' არის ქვეყნის მასშტაბის ინიციატივა, წარდგენილი კომპიუტერული მეცნიერების საგანმანათლებლო კვირეულის[csedweek.org] და Code.org-ის[code.org] მიერ, რომლის მიზანია წარვუდგნოთ მილიონობით მოსწავლეს კომპიუტერული მეცნიერების და კომპიუტერული პროგრამირების ერთი საათი."*

  4. არ შეიძლება "Hour of Code"-ის გამოყენება აპლიკაციების სახელებში.

<a id="stickers"></a>

## ამობეჭდეთ ეს სტიკერები და დაურიგეთ თქვენს მოსწავლეებს

(სტიკეტების დიამეტრია 1", თითო გვერდზე არის 63)  
[![გამოსახულება](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## გაგზავნეთ ეს ელ. წერილები კოდის ერთი საათის რეკლამისთვის

<a id="email"></a>

## სთხოვეთ თქვენს სკოლას, დამსაქმებელს ან მეგობარს დარეგისტრირდეს:

Computers are everywhere, changing every industry on the planet. But only one in four schools teach computer science. კარგი სიახლე ისაა, რომ ჩვენ ვმუშაობთ ამის შეცვლაზე. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

კოდის ერთი საათის მეშვეობით, კომპიუტერულმა მეცნიერებამ Google-ის, MSN-ისა და Yahoo-ს მთავარი გვერდები დაიკავა! და Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2016. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Get the word out. Host an event. Ask a local school to sign up. Or try the Hour of Code yourself—everyone can benefit from learning the basics.

დაიწყეთ ვებგვერდზე http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## მოიწვიეთ მედიის წარმომადგენლები თქვენს ღონისძიებაზე დასასწრებად:

**სათაური:** ადგილობრივი სკოლა შეურთდება მოსწავლეებისთვის კომპიტერული მეცნიერებების გაცნობის მისიას

Computers are everywhere, changing every industry on the planet, but only one in four schools teach computer science. Girls and minorities are severely underrepresented in computer science classes, and in the tech industry. კარგი სიახლე ისაა, რომ ჩვენ ვმუშაობთ ამის შეცვლაზე.

კოდის ერთი საათის მეშვეობით, კომპიუტერულმა მეცნიერებამ Google-ის, MSN-ისა და Yahoo-ს მთავარი გვერდები დაიკავა! და Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code. President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

გწერთ, რათა მოგიწვიოთ გახსნაზე, რომელზეც ბავშვები დაიწყებენ სწავლას და რომელიც ჩატარდება [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st century success. შემოგვიერთდით.

**კონტაქტი:** [თქვენი სახელი], [თანამდებობა], ტელეფონი: (212) 555-5555

**როდის:** [ღონისძიების თარიღი და დრო]

**სად:** [მისამართი]

საუკეთსო სურვილებით.

<a id="parents"></a>

## უამბეთ მშობლებს თქვენი სკოლის ღონისძიების შესახებ:

ძვირფასო მშობლებო,

ჩვენ ვცხოვრობთ ტექნოლოიებით აღსავსე სამყაროში. And we know that whatever field our students choose to go into as adults, their ability to succeed will increasingly depend on understanding how technology works.

But only a tiny fraction of us are learning **how** technology works. Only 1 in every four schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

This is a chance to change the future of education in [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

## მოიწვიეთ ადგილობრივი პოლიტიკოსები თქვენს სასკოლო ღონისძიებაზე:

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Did you know that computing is the #1 source of wages in the U.S.? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Computer science is foundational for *every* industry today. Yet 75% of schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

I'm writing to invite you to take part in our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st century skills. We want to ensure that our students are on the forefront of creating technology of the future—not just consuming it.

Please contact me at [PHONE NUMBER OR EMAIL ADDRESS]. I look forward to your response.

Sincerely, [NAME], [TITLE]