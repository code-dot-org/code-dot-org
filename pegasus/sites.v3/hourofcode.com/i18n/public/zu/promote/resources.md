---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

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

**"iHora loKufingqwa" limakelwe uhwebo. Asifuni ukuvimba ukusetshenziswa, kodwa sifuna ukwenza isiqiniseko sokuba kufanelana ngaphakathi kwemigcele embalwa:**

  1. Nayiphi na inkomba ku "Hora loKufingqwa" kufanele isetshenziswe ngomkhuba ongakhombi ukuba umkhiqizo wakho, kodwa ekhombisa iHora loKufingqwa njengesisekelo somnyakazo. Isibonelo esihle: "Hlanganyela kuHora loKufingqwa ku ACMECorp.com". Isibonakaliso esibi: "Zama iHora loKufingqwa ngenkampani yeACME".
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

## Cela isikole sakho, umcashi okanye izihlobo ukuba zibhalise:

Amakhompyutha atholakala kuyo yonke indawo, ekushintsheni imboni zonke mhlaba wonke jikelele. But fewer than half of all schools teach computer science. Izindaba ezimnandi ukuthi, sisendleleni ukuzoshintsha lokhu. Uma uzwile ngeHora loKufingqwa ngaphambilini, kungenzeka uyazi ukuthi yenza umlando. Badlulele kukhulu lezigidi abafundi abasebezame iHora loKufingqwa.

NgeHora loKufingqwa, ikhompyutha sayensi ibivele kukhasikhaya akwa Google, MSN, Yahoo! Kanye neDisney. Badlulele kukhulu abahlanganyeli abese bazibandakanya ukuzosingatha lomnyakazo. Izitolo zonke zaka apula emhlabeni zibambe umcimbi weHora loKufingqwa. Umongameli u-Obama ubhale umugqa wakhe wokufingqwa kokuqala njengengxenye yomkhankaso.

Kulonyaka, asiyenzeni ibenkudlwana. Nginicela ukuba nizibandakanye neHora loKufingqwa 2016. Nginicela ukuba nibambe ichaza kumcimbi weHora loKufingqwa ngeViki leMfundiso yeKhompyutha Sayensi, <%= campaign_date('full') %>.

Yazisa abantu. Hlela umcimbi. Cela isikole esigodini ukuba sibhalise. Okanye zama iHora loKufingqwa ngokwakho-wonke umuntu angazuza ngokufunda izisekelo.

Qalisa ku http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Mema abezindaba/abokusasaza ukuba babekhona kumcimbi wakho:

**Umugqa kuncike:** Isokole sendawo sizibandakanya kumsebenzi wokwenziwa ukwazisa abafundi kukhompyutha sayensi

Computers are everywhere, changing every industry on the planet, but fewer than half of all schools teach computer science. Amantombazane kanye nabangamelwanga abamelwanga kumakilasi ekhompyutha sayensi ngendlela efanele, kanye nakumbhoni yethekhi. Izindaba ezimnandi ukuthi, sisendleleni ukuzoshintsha lokhu.

NgeHora loKufingqwa, ikhompyutha sayensi ibivele kukhasikhaya akwa Google, MSN, Yahoo! Kanye neDisney. Badlulele kukhulu abahlanganyeli abese bazibandakanya ukuzosingatha lomnyakazo. Izitolo zonke zaka apula emhlabeni zibambe umcimbi weHora loKufingqwa. Umongameli u-Obama ubhale umugqa wakhe wokufingqwa kokuqala njengengxenye yomkhankaso.

Yingakho wonke omunye we [X inombolo] abafundi base [IGAMA LESIKOLE] bazibandakanya kumcimbi wokufunda omkhulu kumlandu: IHora loKufingqwa, ngeViki leMfundiso yeKhompyutha Sayensi (<%= campaign_date('full') %>).

Ngibhalela ukukumema ukuba ubekhona kumhlangano wethu wokuqala, ubese ubona izingane ziqala umsebenzi ngo [USUKU].

IHora loKufingqwa, elihlelwe nguCode.org ongananzuzo kanye nabanye abadlulela ngale kukhulu, ingumnyakazo oyimbulunga okholwa ukuba abafundi banamhlanje bakulungele ukufunda amakhono abucayi ukuze baphumelele esikhathini samanje. Sicela uhlanganyele nathi.

**Xhumana:** [IGAMA LAKHO], [ISIHLOKO], umakhalekhukhwini: (212) 555-5555

**Nini:** [USUKU kanye NESIKHATHI somcimbi wakho]

**Kuphi:** [IKHELI kanye INDLELA]

Ngithokozela ukuxhumana njalo.

<a id="parents"></a>

## Xoxela abazali ngomcimbi wesikole sakho:

Bazali abathandekayo,

Sihlala kumhlaba ozungezwe yithekhinoloji. Kanti siyazi ukuba noma kuyiphi inkambu abafundi yethu abazokhetha ukuya kuyo ebudaleni babo, ikhono lwabo lokuphumelela lizonqika kakhulu ekuqondeni kwabo ukuba ithekhinoloji isebenza kanjani.

But only a tiny fraction of us are learning **how** technology works. Fewer than half of all schools teach computer science.

Yingakho isikole sethu sonke bazibandakanya kumcimbi wokufunda omkhulu kumlandu: IHora loKufingqwa, ngeViki leMfundiso yeKhompyutha Sayensi (%=usuku_umkhankaso('olugcwele') %>). Badlulele kusigidi samakhulu abafundi umhlaba wonke abase bezame iHora loKufingqwa.

IHora loKufingqwa lwethu lwenza isitatimende ukuba [IGAMA LESIKOLE] sikulungele ukufundisa lamakhona ayisisekelo esikhathini samanje. Ukuqhubeka ukuletha imisebenzi yokuphrogrema kubafundi bakho, sifuna ukwenza umcimbi wethu weHora loKufingqwa ubemkhulu. Ngiyakukhuthaza ukuba uvolontiye, finyelela kwezokusasa zendawo, yabelana lezindaba kwezokusasaza zokuxhumana uphinde ucabangisise ukuhlela eminye imicimbi yeHora loKufingqwa kumpthakathi.

Leli ithuba lokushintsha ikusasa lemfundo ku [IGAMA LEDOLOBHA].

Bona http://hourofcode.com/<%= @ilizwe %> ukuze uthole imininingwane, nokusiza ukuthuthukisa izwi.

Ngokuzithoba,

Ithisha Nhloko Wakho

<a id="politicians"></a>

## Mema owezepolotiki wendawo kumcimbi wesikole sakho:

Othandekayo [Mphathi Dolobha/Umkhulumeli/Umbusi ISIBONGO]:

Uthi bewazi ukuba ezekhompyutha #1 umthombo wezenkokhelo eU.S.? Idlulele ku 500,000 imisebenzi yezekhompyutha evulekile izwe lonke, kodwa unyaka odlule abafundi abatheswe iziqu zokuba basebenze bangu 42,969 kuphela.

Computer science is foundational for *every* industry today. Yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

Yingakho isikole sethu sonke bazibandakanya kumcimbi wokufunda omkhulu kumlandu: IHora loKufingqwa, ngeViki leMfundiso yeKhompyutha Sayensi (%=usuku_umkhankaso('olugcwele') %>). Badlulele kusigidi samakhulu abafundi umhlaba wonke abase bezame iHora loKufingqwa.

Ngibhalela ukukumema ukuba ubambe ichaza kumcimbi wethu weHora loKufingqwa nokuba ukhulume kumhlangano wethu wokuqala. Uzothatha indawo ngo [USUKU, ISIKHATHI, INDAWO], sizophinda senze isitatimende esiqinile ukuthi [igama leNdawo, Dolobha] ikulungele ukufundisa abafundi bethu amakhono abucayi esikhathini samanje. Sifuna ukuqinisekisa ukuba abafundi bethu baphambili ekudaleni ithekhinoloji yakusasa-hhayi ukuyithenga.

Ngicela uxhumane nami ku [INOMBOLO ZOCINGO OKAYE IKHELI LE IMEYILI]. Ngiyothokozela ukuzwa impendulo yakho.

Ngokuzithoba, [IGAMA], [ISIHLOKO]

<%= view :signup_button %>