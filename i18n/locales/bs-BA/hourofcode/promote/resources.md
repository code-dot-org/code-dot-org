---
title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Promoviraj Čas Kodiranja

## Hosting an Hour of Code? [See the how-to guide](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Objesite ove postere u Vašoj školi

<%= view :promote_posters %>

<a id="social"></a>

## Objavite ove na društvenim mrežama

[![image](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![image](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Koristi logo Časa Kodiranja da proširiš riječ

[![image](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Download hi-res versions](http://images.code.org/share/hour-of-code-logo.zip)

**"Čas Kodiranja" je zaštićen. Mi ne želimo spriječiti njegovo korištenje, ali želimo biti sigurni da stane u neka ograničenja:**

1. Any reference to "Hour of Code" should be used in a fashion that doesn't suggest that it's your own brand name, but rather referencing the Hour of Code as a grassroots movement. **Good example: "Participate in the Hour of Code™ at ACMECorp.com". Loš primjer:"Pokušaj Čas Kodiranja sa ACME korporacijom".**
2. Use a "TM" superscript in the most prominent places you mention "Hour of Code", both on your web site and in app descriptions.
3. Include language on the page (or in the the footer), including links to the CSEdWeek and Code.org web sites, that says the following:
    
    *“The 'Hour of Code™' is a nationwide initiative by Computer Science Education Week[csedweek.org] and Code.org[code.org] to introduce millions of students to one hour of computer science and computer programming.”*

4. Bez korištenja "Čas Kodiranja" u imenima aplikacija.

<a id="stickers"></a>

## Isprintaj ove naljepnice i dadnite ih svojim učenicima

(Stickers are 1" diameter, 63 per sheet)  
[![image](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Pošaljite ove e-mailove da pomognete u promovisanju Časa Kodiranja

<a id="email"></a>

### Pitajte svoju školu, poslodavca, ili prijatelje da se prijave:

**Subject line:** Join me and over 100 million students for an Hour of Code

Računala su svugdje, mjenjajući svaku industriju na planeti. But fewer than half of all schools teach computer science. Good news is, we’re on our way to change this! If you've heard about the Hour of Code before, you might know it made history. More than 100 million students have tried an Hour of Code.

Sa Časom Kodiranja. računarstvo je bilo na početnim stranicama Google-a, MSN-a, Yahoo-a! i Diznija. Over 100 partners have joined together to support this movement. Svaki Apple Store u svijetu je bio domaćin Časa Koda, i lideri kao Presjednik Obama i Kanadski premijer Justin Trudeau su napisali svoje prve linije koda kao dio kampanje.

This year, let's make it even bigger. I’m asking you to join the Hour of Code <%= campaign_date('year') %>. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Proširite riječ. Budi domaćin događaja. Pitajte lokalnu školu da se prijavi. Ili sam pokušajte Čas Kodiranja-- svi mogu imati koristi od učenja osnova.

Počnite na http://hourofcode.com/<%= @country %>

<a id="help-schools"></a>

### Volonter u školi:

**Linija predmeta** Možemo li ti pomoći da budeš domaćin Časa Kodiranja?

Between <%= campaign_date('short') %>, ten percent of students around the world will celebrate Computer Science Education Week by doing an Hour of Code event at their school. It’s an opportunity for every child to learn how the technology around us works.

[Our organization/My name] would love to help [school name] run an Hour of Code event. We can help teachers host an Hour of Code in their classrooms (we don’t even need computers!) or if you would like to host a school assembly, we can arrange for a speaker to talk about how technology works and what it’s like to be a software engineer.

Studenti će kreirati svoje vlastite aplikacije koje mogu pokazati svojim roditeljima, i mi ćemo isprintati certifikate za Čas Kodiranja koje mogu donijeti kući. I zabavno je! With interactive, hands-on activities, students will learn computational thinking skills in an approachable way.

Računala su svugdje, mjenjajući svaku industriju na planeti. But fewer than half of all schools teach computer science. Dobre vijesti su da smo mi na putu da promijenimo ovo! Ako Ste prije čuli za Čas Kodiranja, možda znate da je ušao u historiju - više od 100 miliona učenika u cijelom svijetu je pokušalo Čas Kodiranja.

Thanks to the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Over 100 partners have joined together to support this movement. Every Apple Store in the world has hosted an Hour of Code, and even leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

O događaju možete pročitati više na http://hourofcode.com/. Ili javite nam ako želite zakazati neko vrijeme da razgovaramo o tome kako [ime škole] može učestvovati.

Thanks!

[Vaše ime], [Vaša organizacija]

<a id="media-pitch"></a>

### Pozovi medije da prisustvuju tvom događaju:

**Subject line:** Local school joins mission to introduce students to computer science

Kompjuteri su svugdje, mijenjajući svaku industriju na planeti, ali manje od pola škola uči informatiku. Djevojke i manjine se veoma nedovoljno zastupljene na časovima računarskih nauka, i u tehnološkoj industriji. Good news is, we’re on our way to change this.

Sa Časom Kodiranja. računarstvo je bilo na početnim stranicama Google-a, MSN-a, Yahoo-a! i Diznija. Over 100 partners have joined together to support this movement. Svaki Apple Store u svijetu je bio domaćin Časa Kodiranja. Čak i presjednik Obama je napisao svoju prvu liniju koda kao dio kampanje.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

Pišem Vam da Vas pozovem da prisustvujete početku skupa i da vidite dijecu kako počinju aktivnost [DATE].

Čas Kodiranja, organiziran od strane neprofitnog Code.org-a i preko 100 drugi, je globalni pokret koji vjeruje da su današnji učenici spremni da nauče kritične vještine za uspjeh u 21. stoljeću. Molimo pridružite nam se.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

Radujem se da ostanemo u kontaktu.

[Your Name]

<a id="parents"></a>

### Recite svojim roditeljima o događaju Vaše škole:

**Subject line:** Our students are changing the future with an Hour of Code

Dragi roditelji,

Mi živimo u svijetu okruženom tehnologijom. I mi znamo da u koju god oblast naši studenti izaberu da idu kao odrasli, njihova sposobnost da uspiju će sve više zavisiti od razumijevanja kako tehnologija radi.

But only a tiny fraction of us are learning **how** technology works. Fewer than half of all schools teach computer science.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. To continue bringing programming activities to your students, we want to make our Hour of Code event huge. Podstičem te da volontiraš, da dođeš do lokalni medija, da dijeliš vijesti na kanalima socijalnih medija i da razmisliš da budeš domaćin dodatnim događajima Hour of Code-a u zajednici.

Ovo je prilika da se promijeni budućnost obrazovanja u [okrug/grad ime].

See http://hourofcode.com/<%= @country %> for details, and help spread the word.

Sincerely,

Your principal

<a id="politicians"></a>

### Pozovi lokalnog političara na događaj u tvojoj školi:

**Subject line:** Join our school as we change the future with an Hour of Code

Dear [Mayor/Governor/Representative/Senator LAST NAME]:

Jeste li znali da je računarstvo #1 izvor plata u Americi? There are more than 500,000 computing jobs open nationwide, but last year only 42,969 computer science students graduated into the workforce.

Računarstvo je osnova za *svaku*industriju danas, ipak većina školi je ne podučava. U [Naziv škole], mi to pokušavamo promijeniti.

That’s why our entire school is joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>). More than 100 million students worldwide have already tried an Hour of Code.

Pišem Vam da Vas pozovem da se pridružite našem događaju Časa Kodiranja i da govorite na otvorenju skupa. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. Mi želimo osigurati da naši su naši učenici u prvom planu kreiranja tehnologije budućnosti - ne samo da je konzumiraju.

Molim Vas kontaktirajte me na [broj telefona ili email adresa]. Radujem se Vašem odgovoru.

Sincerely,

[Vaše ime], [Title]

<%= view :signup_button %>