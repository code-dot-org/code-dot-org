* * *

title: <%= hoc_s(:title_resources) %> layout: wide nav: promote_nav

* * *

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promote the Hour of Code

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Obesite te plakate na vaši šoli

<%= view :promote_posters %>

<a id="social"></a>

## Objavite na družbenih medijih

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

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
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Pošljite spodnja sporočila in pomagajte promovirati Uro za kodo

<a id="email"></a>

## Spodbudite vašo šolo, delodajalca ali prijatelje, da se prijavijo:

Čeprav so računalniki povsod, računalništvo uči manj šol kot pred 10 leti. Dobra novica je, da smo na proti, da to spremenimo. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! in Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Razširite vest o tem. Gostite dogodek. Vprašajte na vaši šoli in se prijavite. Ali poskusite Uro za kodo sami--vsakomur lahko koristi učenje osnov.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Povabite medije, da se udeležijo vašega dogodka:

**Subject line:** Local school joins mission to introduce students to computer science

Računalniki so vsepovsod, vendar manj šol poučuje računalništvo kot pred 10 leti. Dekleta in manjšine so še vedno premalo zastopane. Dobra novica pa je, da smo na poti v spremembe.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! in Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Vabimo vas, da se nam pridružite [DATE] in vidite, kako se bodo naši otroci pridružili projektu.

Uro za kodo organizira neprofitna organizacija Code.org in več kot 100 drugih partnerjev. Je dokaz, da so učenci danes pripravljeni, da se naučijo znanja za uspeh v 21. stoletju. Pridružite se nam.

**Kontakt:** [VAŠE IME], [TITLE], telefon: 041 555-555

**Kdaj:** [DATUM in ČAS dogodka]

**Kje:** [NASLOV in POT]

Veseli bomo, če bomo v stiku.

<a id="parents"></a>

## Povejte staršem o dogodku v vaši šoli:

Dragi starši,

Živimo v svetu, ki je obdan s tehnologijo. Vemo, da ne glede na področje, ki ga bodo učenci izbrali za svojo kariero, so njihove možnosti za uspeh večje, če bodo poznali, kako tehnologija deluje. Vendar se nas le majhen delček uči računalništva in manj učencev se ga uči kot pred desetletjem.

Zato se bo naša šola pridružila največjemu izobraževalnemu dogodku v zgodovini: Ura za kodo. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Ura za kodo je dokaz, da je [SCHOOL NAME] pripravljena naučiti učence temeljna znanja za 21. stoletje. Želimo, da o projektu izve čimveč ljudi. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

To je priložnost, da spremenimo izobraževanje v [TOWN/CITY NAME].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Lep pozdrav,

Vaš ravnatelj

<a id="politicians"></a>

## Povabite lokalne politike na dogodek v vaši šoli:

Dragi [župan/svetnik/poslanec LAST NAME]:

Ali ste vedeli, da je danes v svetu na področju računalništva trikrat več delovnih mest kot diplomantov? Računalništvo je danes temelj *vsake* industrije. Yet most of schools don’t teach it. V [SCHOOL NAME] poskušamo to spremeniti.

Zato se bo naša šola pridružila največjemu izobraževalnemu dogodku v zgodovini: Ura za kodo. 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Vabimo vas, da se nam pridružite na našem dogodku Ura za kodo in v uvodu poveste nekaj spodbudnih besed učencem. Dogodek bo potekal [DATE, TIME, PLACE] in bo dal jasno sporočilo, da je [mesto] pripravljeno, da nauči učence temeljna znanja za 21. stoletje. Želimo zagotoviti, da bodo naši učenci na čelu ustvarjanja tehnologije prihodnosti--ne bodo je samo uporabljali.

Prosimo vas, kontaktirajte me na [TELEFONSKA ŠTEVILKA ali e-poštni naslov]. Veselim se vašega odgovora.

Najlepša hvala in lep pozdrav [NAME], [TITLE]

<%= view :signup_button %>