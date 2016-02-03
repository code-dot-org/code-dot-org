* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Függessze ki ezeket a posztereket az iskolájában

<%= view :promote_posters %>

<a id="social"></a>

## Juttassa el az alábbiakat a közmédiához

[![kép](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![kép](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![kép](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![kép](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

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
[![kép](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Küldje el az alábbi e-maileket, a Hour of Code megismertetése érdekében

<a id="email"></a>

## Kérje meg iskoláját, munkáltatóját vagy a barátait, hogy csatlakozzanak:

Computers are everywhere, but fewer schools teach computer science than 10 years ago. A jó hír az, hogy mi már dolgozunk azon hogy ez megváltozzon. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Elég a szavakból. Szervezzen egy rendezvényt. Kérje meg a helyi iskolát hogy csatlakozzon, vagy próbálja ki saját maga a Hour of Code-ot - hiszen mindenkinek hasznos az alapok megismerése.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Kérje fel a médiát, hogy látogasson el az Önök rendezvényére:

**Subject line:** Local school joins mission to introduce students to computer science

Mindenütt számítógépekkel találkozunk, mégis kevesebb iskolában tanítanak informatikát, mint 10 évvel ezelőtt. A lányok és a kisebbségek súlyosan alulreprezentáltak. A jó hír az, hogy mi már dolgozunk azon hogy ez megváltozzon.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Levelemmel szeretném meghívni Önöket hogy vegyenek részt a kezdő összejövetelünkön, és lássák amint a gyerekek elkezdenek tevékenykedni [DATE]-án.

A Hour of Code - melynek szervezéséről a nonprofit Code.org, és több 100 más partner gondoskodik- egy olyan nyilatkozat, amely kimondja, hogy a mai fiatal generáció készen áll a 21. század sikeréhez feltétlenül fontos készségek elsajátítására. Kérjük, csatlakozzon hozzánk!

**Kapcsolat:** [Név], [TITLE], mobil: +36 (XX) 555-5555

**Időpont:** [a rendezvény napja és ideje]

**Hol:** [Cím és megközelíthetőség]

Bízunk benne, hogy hamarosan kapcsolatba lépnek velünk.

<a id="parents"></a>

## Tájékoztassa a szülőket az iskolai eseményről:

Kedves Szülők!

Mindannyian egy technológiával körbefont világban élünk. Azt is tudjuk, hogy diákjaink bármilyen területet választanak felnőtt korukra, sikerességük egyre inkább azon múlik, hogy megértik-e, hogyan működik a technológia. Ennek ellenére csak egy igen kis hányad tanul közülünk informatikát, és ezen diákok száma kevesebb, mint tíz évvel ezelőtt.

Iskolánk éppen ezért csatlakozik minden idők legnagyobb oktatási eseményéhez a Hour of Code-hoz, (Dec 8-14 között) a informatika oktatás hetén. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

A Hour of Code rendezvényünk nyilatkozat arról, hogy a(z) [iskola neve] készen áll a 21. század alapvető készségeinek tanítására. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Ez egy jó esély arra, hogy megváltoztassuk az oktatás jövőjét [város neve].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Üdvözlettel,

Igazgató

<a id="politicians"></a>

## Hívjon meg egy helyi politikust az iskolai eseményre:

Tisztelt [polgármester/képviselő] úr/úrhölgy!

Tudta, hogy a jelenlegi gazdasági helyzetben, az informatikus állások száma háromszorosan felülmúlja a végzős hallgatók számát? És habár a számítástechnika ma alapvetően fontos *minden* iparág számára, Yet most of schools don’t teach it. A(z) [iskola neve]-ban megpróbálunk változtatni ezen.

Iskolánk éppen ezért csatlakozik minden idők legnagyobb oktatási eseményéhez a Hour of Code-hoz, (Dec 8-14 között) a informatika oktatás hetén. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Levelemmel szeretném felkérni Önt, hogy vegyen részt a Hour of Code rendezvényünkön és tartson egy rövid beszédet a megnyitón. A rendezvény amely [dátum, idő] lesz [helyszín], egy határozott nyilatkozat arról, hogy [város neve] kész arra, hogy diákjait megtanítsa a 21. század alapvető készségeire. Biztosak szeretnénk lenni abban, hogy diákjaink ott lesznek az új technológiai fejlesztések élvonalában - és nem csak felhasználóként találkoznak vele.

Kérjük, lépjen kapcsolatba velünk a következő [telefonszámon vagy E-mail címen]. Várva válaszát.

Tisztelettel, \[Név\] \[Cím\]

<%= view :signup_button %>