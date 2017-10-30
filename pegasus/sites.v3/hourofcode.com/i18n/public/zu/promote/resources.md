---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Khuthaza iHora loKufingqwa

## Usingatha iHora loKufingqwa? [Bona indlela yokuqondisa](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Phanyeka amaphosta esikoleni sakho

<%= view :promote_posters %>

<a id="social"></a>

## Faka lokhu kwezokusakaza

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Sebenzisa iphawu leHora loKufingqwa usakaza izwi

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Thwebula ukuhumushelwa kwehi-res](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Nayiphi na inkomba ku "Hora loKufingqwa" kufanele isetshenziswe ngomkhuba ongakhombi ukuba umkhiqizo wakho, kodwa ekhombisa iHora loKufingqwa njengesisekelo somnyakazo.
    
    - Isibonelo esihle: "Hlanganyela kuHora loKufingqwa ku ACMECorp.com". 
    - Isibonakaliso esibi: "Zama iHora loKufingqwa ngenkampani yeACME".
2. Sebenzisa umbhalo ongezansi we"TM" kuzindawo eziqavileyo lapho ukhuluma ngeHora loKufingqwa, kuwebhisayithi yakho kanye nakuncazelo yehlelo lakho.
3. Hlanganisa ulwimi kukhasi (noma kunyaweni wekhasi), okubala izixhumaniso kumawebhusayithi eCSEdWeek kanye neCode.org, akhuluma lokhu okulandelayo:
    
    *"IHora loKufingqwa ngelokuhweba liyisinyathelo somhlaba wonke evela kuMfundiso yeViki ngeKhompyutha Sayensi [csedweek.org] kanye neCode.org[code.org] ukwazisa izinkulungwane nezinkulungwane zabafundi kuhora elilodwa lekhompyutha sayensi kanye nakuzinhlelo zekhompyutha."*

4. Akusetshenziswa "iHora loKufingqwa" emagameni amahlelo okwenza.

<a id="stickers"></a>

## Phrinta lokhu okokunameka ukuze uphe abafundi bakho

(Izitembu zibubanzi ububodwa, kushidi elingamashumi ayisithupha nantathu  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Thumela lama imeyili ukusiza ukukhuthaza iHora loKufingqwa

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

Amakhompyutha atholakala kuyo yonke indawo, ekushintsheni imboni zonke mhlaba wonke jikelele. Kodwa zingaphansi kwengxenye izikole ezifundisa ikhompyutha sayensi. Good news is, we’re on our way to change this! Uma uzwile ngeHora loKufingqwa ngaphambilini, kungenzeka uyazi ukuthi yenza umlando. Badlulele kukhulu lezigidi abafundi abasebezame iHora loKufingqwa.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Badlulele kukhulu abahlanganyeli abese bazibandakanya ukuzosingatha lomnyakazo. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Yazisa abantu. Hlela umcimbi. Cela isikole esigodini ukuba sibhalise. Okanye zama iHora loKufingqwa ngokwakho-wonke umuntu angazuza ngokufunda izisekelo.

Qalisa ku http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

### Mema abezindaba/abokusasaza ukuba babekhona kumcimbi wakho:

**Umugqa kuncike:** Isokole sendawo sizibandakanya kumsebenzi wokwenziwa ukwazisa abafundi kukhompyutha sayensi

Amakhompyutha akhona kuyonke indawo, ashinstha kumabhizinisi umhlaba wonke, kodwa ayicosana kusigamu sezikole ezifundisa ikhompwutha sayensi. Amantombazane kanye nabangamelwanga abamelwanga kumakilasi ekhompyutha sayensi ngendlela efanele, kanye nakumbhoni yethekhi. Izindaba ezimnandi ukuthi, sisendleleni ukuzoshintsha lokhu.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Badlulele kukhulu abahlanganyeli abese bazibandakanya ukuzosingatha lomnyakazo. Izitolo zonke zaka apula emhlabeni zibambe umcimbi weHora loKufingqwa. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Sicela uhlanganyele nathi.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### Xoxela abazali ngomcimbi wesikole sakho:

**Subject line:** Our students are changing the future with an Hour of Code

Bazali abathandekayo,

Sihlala kumhlaba ozungezwe yithekhinoloji. Kanti siyazi ukuba noma kuyiphi inkambu abafundi bethu abazokhetha ukuya kuyo ebudaleni babo, ikhono lwabo lokuphumelela lizonqika kakhulu ekuqondeni kwabo ukuba ithekhinoloji isebenza kanjani.

Kodwa kungabambalwa kithi abafundayo **indlela** ithekhinoloji iyasebenza. Kungesodwa isikole kwezine esifundisa ikhompyutha thekhinoloji. Zingaphansi kwengxenye izikole ezifundisa ikhompyutha sayensi.

Yingakho isikole sethu sonke bazibandakanya kumcimbi wokufunda omkhulu kumlandu: IHora loKufingqwa, ngeViki leMfundiso yeKhompyutha Sayensi (%=usuku_umkhankaso('olugcwele') %>). Badlulele kusigidi samakhulu abafundi umhlaba wonke abase bezame iHora loKufingqwa.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. Ukuqhubeka ukuletha imisebenzi yokuphrogrema kubafundi bakho, sifuna ukwenza umcimbi wethu weHora loKufingqwa ubemkhulu. Ngiyakukhuthaza ukuba uvolontiye, finyelela kwezokusasa zendawo, yabelana lezindaba kwezokusasaza zokuxhumana uphinde ucabangisise ukuhlela eminye imicimbi yeHora loKufingqwa kumpthakathi.

Leli ithuba lokushintsha ikusasa lemfundo ku [IGAMA LEDOLOBHA].

Bona http://hourofcode.com/<%= @ilizwe %> ukuze uthole imininingwane, nokusiza ukuthuthukisa izwi.

Ngokuzithoba,

Ithisha Nhloko Wakho

<a id="politicians"></a>

### Mema owezepolotiki wendawo kumcimbi wesikole sakho:

**Subject line:** Join our school as we change the future with an Hour of Code

Othandekayo [Mphathi Dolobha/Umkhulumeli/Umbusi ISIBONGO]:

Uthi bewazi ukuba ezekhompyutha #1 umthombo wezenkokhelo eU.S.? Idlulele ku 500,000 imisebenzi yezekhompyutha evulekile izwe lonke, kodwa unyaka odlule abafundi abatheswe iziqu zokuba basebenze bangu 42,969 kuphela.

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

Yingakho isikole sethu sonke bazibandakanya kumcimbi wokufunda omkhulu kumlandu: IHora loKufingqwa, ngeViki leMfundiso yeKhompyutha Sayensi (%=usuku_umkhankaso('olugcwele') %>). Badlulele kusigidi samakhulu abafundi umhlaba wonke abase bezame iHora loKufingqwa.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. Sifuna ukuqinisekisa ukuba abafundi bethu baphambili ekudaleni ithekhinoloji yakusasa-hhayi ukuyithenga.

Ngicela uxhumane nami ku [INOMBOLO ZOCINGO OKAYE IKHELI LE IMEYILI]. Ngiyothokozela ukuzwa impendulo yakho.

Ngokuzithoba,

[NAME], [TITLE]

<%= view :signup_button %>