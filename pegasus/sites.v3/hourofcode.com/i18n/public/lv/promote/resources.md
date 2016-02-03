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

## Izvietojiet šos plakātus savā skolā

<%= view :promote_posters %>

<a id="social"></a>

## Publicē sociālajos tīklos

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use the Hour of Code logo to spread the word

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

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

## Nosūtiet šos e-pastus lai palīdzētu reklamēt "Programmēšanas stunda"

<a id="email"></a>

## Paprasiet savai skolai, darba devējam vai draugiem piereģistrēties:

Datori ir visur, bet daudz mazāk skolas māca datorzinātni nekā pirms desmit gadiem. Labās ziņas ir tādas, ka mēs esam gatavi to mainīt. If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! un Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join in for the Hour of Code 2015. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Izplatiet informāciju, rīkojiet pasākumu, pajautājiet vietējai skolai reģistrēties vai pamēģiniet "Programmēšanas stundu" pats - ikviens var gūt labumu iemācoties programmēšanas pamatus.

Get started at http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Ielūdziet mēdijus uz jūsu veidoto pasākumu:

**Subject line:** Local school joins mission to introduce students to computer science

Datori ir atrodami visur, taču skolu skaits, kur pasniedz datorzinātnes ilgāk par 10 gadiem, ir salīdzinoši mazs. Meitenes un minoritātes ir mazpārstāvētas. Labās ziņas ir tādas, ka mēs esam gatavi to mainīt.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo! un Disney. Over 100 partners joined together to support this movement. Last year, every Apple Store in the world hosted an Hour of Code and even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Dec. 7-13.

Es rakstu, lai [DATE] ielūgtu Jūs apmeklēt atklāšanas pasākumu.

"Programmēšanas stunda", kuru organizē bezpeļņas organizācija Code.org un 100 citu partneru, ir paziņojums, ka mūsdienu paaudzes skolēni ir gatavi mācīties 21. gadsimtam kritiski nepieciešamas zināšanas. Lūdzu pievienojaties mums.

**Kontakti:** [JŪSU VĀRDS], [TITULS], mob.tālr.: [TELEFONS]

**Kad:** [DATUMS un LAIKS jūsu pasākumam]

**Kur:** [ADRESE un NORĀDES]

Ceru uz turpmāku saziņu.

<a id="parents"></a>

## Pastāstiet vecākiem par jūsu skolas pasākumu:

Cienījamie vecāki,

Mēs dzīvojam pasaulē kuru ieskauj tehnoloģijas. Un mēs zinām, lai arī kādu karjeru mūsu skolēni izvēlētos, viņu iespējas izcelties būs atkarīgas no viņu spējas saprast mūsdienu tehnoloģijas. Bet tikai maza daļiņa no mums mācas datorzinātnes. Vēl mazāk skolēnu mācās datorzinātnes nekā pirms 10 gadiem.

Tādēļ mūsu skola pievienosies lielākajam mācību pasākumam vēsturē: "Programmēšanas stunda" kas norisināsies kā daļa no Datorzinātnes izglītības nedēļā 7-13). More than 100 million students worldwide have already tried an Hour of Code.

"Programmēšanas stunda" ir paziņojums ka [SKOLAS NOSAUKUMS] ir gatava iemācīt šīs 21. gadsimta zināšanas. Lai turpinātu pasniegt jūsu skolēniem programmēšanas nodarbības, mēs vēlamies padarīt "Programmēšanas stundu" par lielu pasākumu. I encourage you to volunteer, reach out to local media, share the news on social media channels and consider hosting additional Hour of Code events in the community.

Šī ir iespēja mainīt izglītības nākotni [Pilsētas nosaukums].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Ar cieņu,

Jūsu direktors

<a id="politicians"></a>

## Ielūdziet vietējo politiķi uz savu skolas pasākumu:

Cienījamais [Mērs/Gubernators/Pārstāvis/Senators UZVĀRDS]:

Vai Jūs zinājāt ka mūsdienu ekonomijā, skaitļošanas darbavietas pārsniedz studentus kuri absolvē šajā nozarē 3 pret 1? Datorzinātne mūsdienās ir pamats *jebkurai* industrijai. Yet most of schools don’t teach it. [SKOLAS NOSAUKUMS] mēs mēģinam to mainīt.

Tādēļ mūsu skola pievienosies lielākajam mācību pasākumam vēsturē: "Programmēšanas stunda" kas norisināsies kā daļa no Datorzinātnes izglītības nedēļā 7-13). More than 100 million students worldwide have already tried an Hour of Code.

Es rakstu, lai uzaicinātu Jūs piedalīties Programmēšanas stundas pasākumā un teikt dažus vārdus atklāšanas daļā. Pasākums norisināsies [DATUMS, LAIKS, VIETA], un šis pasākums liecinās par [PILSĒTAS VAI NOVADA] apņemšanos mācīt skolēniem šī 21 gadsimtam nozīmīgās prasmes. Mēs vēlamies lai mūsu studenti ir jauno tehnoloģiju veidotāji, nevis tikai patērētāji.

Lūdzu sazinieties ar mani izmantojot [E-PASTS VAI TELEFONS]. Ar nepacietību gaidu Jūsu ziņu.

Ar cieņu, [NAME], [TITLE]

