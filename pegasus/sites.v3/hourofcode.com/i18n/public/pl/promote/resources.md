---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

# Promuj Godzinę Kodowania

## Czy organizujesz Godzinę Kodowania? [Zobacz nasz poradnik](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Rozwieś te plakaty w swojej szkole

<%= view :promote_posters %>

<a id="social"></a>

## Udostępnij to w mediach społecznościowych

[![obraz](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![obraz](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![obraz](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Użyj logo Godziny Kodowania do rozpowszechniania informacji

[![obraz](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Pobierz logo w wysokiej rozdzielczości](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Wszelkie odniesienia do "Godziny Kodowania" powinny być stosowane w sposób, który nie sugeruje, że jest to twoja własna marka, ale odnosi się do Godziny Kodowania jako inicjatywy społecznej.
    
    - Dobry przykład użycia: "Weź udział w Godzinie Kodowania™ na ACMECorp.com". 
    - Zły przykład użycia: "Weź udział w Godzinie Kodowania ACME Corp".
2. Stosuj górny indeks "TM" w najbardziej widocznych miejscach, gdzie używasz frazy "Godzina Kodowania", zarówno na swojej stronie jak i w opisach aplikacji.
3. Zamieść na stronie (lub w jej stopce) następujący tekst, zawierając również linki do stron Tygodnia Edukacji Informatycznej i Code.org:
    
    *"Godzina Kodowania™ jest ogólnokrajową inicjatywą Tygodnia Edukacji Informatycznej[csedweek.org] i Code.org[code.org], której celem jest przybliżenie milionom uczniów jednej godziny informatyki i programowania"*

4. Zakaz używania frazy "Godzina Kodowania" w nazwach aplikacji.

<a id="stickers"></a>

## Wydrukuj te naklejki i rozdaj je swoim uczniom

(Naklejki mają średnicę 1 cala, 63 w arkuszu)  
[![obraz](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Wyślij te e-maile, aby wspomóc promowanie Godziny Kodowania

<a id="email"></a>

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

Komputery znajdują się wszędzie, zmieniając każdą branżę na świecie. Jednakże mniej niż połowa szkół uczy informatyki. Good news is, we’re on our way to change this! Jeśli słyszeli o Godzinie Kodowania, to być może wiecie, że zapisała się już w historii. Ponad 100 milionów uczniów wzięło już udział w Godzinie Kodowania.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Ponad 100 firm partnerskich wsparło tę inicjatywę. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Opowiedz o nas. Zorganizuj wydarzenie. Poproś lokalną szkołę, by się zarejestrowała lub sam spróbuj Godziny Kodowania - każdy może odnieść korzyści z nauki podstaw.

Zacznij na http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

### Zaproś media do udziału w Twoim wydarzeniu:

**Temat:** Lokalna szkoła włącza się w misję wprowadzania uczniów do informatyki

Komputery znajdują się wszędzie, zmieniając każdą branżę na świecie, ale mniej niż połowa szkół uczy informatyki. Kobiety i mniejszości społeczne są zdecydowanie niedostatecznie reprezentowane w kształceniu informatycznym i w branży technologicznej. Dobrą wiadomością jest, że zamierzamy to zmienić.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Ponad 100 firm partnerskich wsparło tę inicjatywę. Każdy salon Apple na świecie organizował Godzinę Kodowania. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Proszę dołączyć do nas.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### Powiedz rodzicom o wydarzeniu w szkole:

**Subject line:** Our students are changing the future with an Hour of Code

Drodzy Rodzice!

Żyjemy w świecie pełnym technologii. I wiemy, że niezależnie od tego, który zawód wybiorą nasi uczniowie, ich szansa na sukces będzie coraz bardziej zależeć od rozumienia, jak działają technologie.

Jednakże tylko niewielki odsetek z nas uczy się **jak** działają technologie. Mniej niż połowa wszystkich szkół uczy informatyki.

Dlatego cała nasza szkoła dołącza do największego wydarzenia edukacyjnego w historii: Godziny Kodowania, w czasie Tygodnia Edukacji Informatycznej (<%= campaign_date('full') %>). Ponad 100 milionów uczniów na całym świecie wzięło już udział w Godzinie Kodowania.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. By móc w przyszłości oferować Państwa dzieciom zajęcia z programowania, chcemy jak najbardziej rozszerzyć skalę naszej Godziny Kodowania. Zachęcam Państwa do pomocy przy organizacji, kontaktu z lokalnymi mediami, dzielenia się informacją o wydarzeniu w mediach społecznościowych oraz rozważenia możliwości zorganizowania dodatkowych Godzin Kodowania dla naszej społeczności.

To jest nasza szansa, by zmienić przyszłość edukacji w [NAZWA MIEJSCOWOŚCI].

Więcej szczegółów na http://hourofcode.com/<%= @country %>. Proszę o pomoc w promowaniu przedsięwzięcia.

Z poważaniem,

Dyrektor szkoły

<a id="politicians"></a>

### Zaproś przedstawiciela lokalnych władz do udziału w wydarzeniu w Twojej szkole:

**Subject line:** Join our school as we change the future with an Hour of Code

Szanowny Panie / Szanowna Pani [Burmistrz/Wójt/Radny/Poseł/Senator IMIĘ i NAZWISKO]:

Czy wie Pan/i, że informatyka jest największym źródłem zarobków w Stanach Zjednoczonych? Jest ponad 500.000 miejsc pracy dla informatyków, ale w zeszłym roku tylko 42.969 absolwentów informatyki wkroczyło na rynek pracy.

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

Dlatego cała nasza szkoła dołącza do największego wydarzenia edukacyjnego w historii: Godziny Kodowania, w czasie Tygodnia Edukacji Informatycznej (<%= campaign_date('full') %>). Ponad 100 milionów uczniów na całym świecie wzięło już udział w Godzinie Kodowania.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. Chcemy mieć pewność, że nasi uczniowie są na czele tworzenia technologii przyszłości - nie tylko ich używania.

Proszę o kontakt pod [NUMER TELEFONU lub ADRES EMAIL]. Z niecierpliwością czekam na odpowiedź.

Z poważaniem,

[NAME], [TITLE]

<%= view :signup_button %>