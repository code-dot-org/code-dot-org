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

**"Godzina Kodowania" jest znakiem towarowym. Nie chcemy zabraniać używania tej nazwy, ale chcemy mieć pewność, że odbywa się to zgodnie z następującymi zasadami:**

1. Wszelkie odniesienia do "Godziny Kodowania" powinny być stosowane w sposób, który nie sugeruje, że jest to twoja własna marka, ale odnosi się do Godziny Kodowania jako inicjatywy społecznej. Dobry przykład użycia: "Weź udział w Godzinie Kodowania™ na ACMECorp.com". Zły przykład użycia: "Weź udział w Godzinie Kodowania ACME Corp".
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

## Zaproś swoją szkołę, pracodawcę lub znajomych, aby zarejestrowali się:

Komputery znajdują się wszędzie, zmieniając każdą branżę na świecie. Jednakże mniej niż połowa szkół uczy informatyki. Dobrą wiadomością jest, że zamierzamy to zmienić. Jeśli słyszeli o Godzinie Kodowania, to być może wiecie, że zapisała się już w historii. Ponad 100 milionów uczniów wzięło już udział w Godzinie Kodowania.

Dzięki Godzinie Kodowania, zajęcia z informatyki pojawiły się na stronach domowych Google, MSN, Yahoo! i Disney. Ponad 100 firm partnerskich wsparło tę inicjatywę. Każdy salon Apple na świecie organizował Godzinę Kodowania. Prezydent Obama napisał swoją pierwszą linię kodu w ramach tej kampanii.

W tym roku, zróbmy to jeszcze większe. Proszę, byś przyłączył się do Godziny Kodowania 2016. Proszę, weź udział w Godzinie Kodowania podczas Tygodnia Edukacji Informatycznej, < % = campaign_date('full') %>.

Opowiedz o nas. Zorganizuj wydarzenie. Poproś lokalną szkołę, by się zarejestrowała lub sam spróbuj Godziny Kodowania - każdy może odnieść korzyści z nauki podstaw.

Zacznij na http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Zaproś media do udziału w Twoim wydarzeniu:

**Temat:** Lokalna szkoła włącza się w misję wprowadzania uczniów do informatyki

Komputery znajdują się wszędzie, zmieniając każdą branżę na świecie, ale mniej niż połowa szkół uczy informatyki. Kobiety i mniejszości społeczne są zdecydowanie niedostatecznie reprezentowane w kształceniu informatycznym i w branży technologicznej. Dobrą wiadomością jest, że zamierzamy to zmienić.

Dzięki Godzinie Kodowania, zajęcia z informatyki pojawiły się na stronach domowych Google, MSN, Yahoo! i Disney. Ponad 100 firm partnerskich wsparło tę inicjatywę. Każdy salon Apple na świecie organizował Godzinę Kodowania. Prezydent Obama napisał swoją pierwszą linię kodu w ramach tej kampanii.

Dlatego każdy spośród [X] uczniów w [nazwa szkoły] przyłącza się do na największego wydarzenia w historii: Godziny Kodowania podczas Tygodnia Edukacji Informatycznej (< % = campaign_date('full') %>).

Pragnę zaprosić Państwa do udziału w spotkaniu inauguracyjnym, by zobaczyć jak zaczynają uczniowie w dniu [DATA].

Godzina Kodowania, organizowana przez instytucję non-profit Code.org i ponad 100 innych organizacji, to globalny ruch oparty na przekonaniu, że dzisiejsi uczniowie są gotowi zdobywać umiejętności niezbędne do odnoszenia sukcesów w XXI wieku. Proszę dołączyć do nas.

**Kontakt:** [TWOJE IMIĘ I NAZWISKO], [FUNKCJA], tel. [TELEFON]

**Kiedy:** [DATA i GODZINA twojego wydarzenia]

**Gdzie:** [ADRES i WSKAZÓWKI DOJAZDU]

Proszę o kontakt.

<a id="parents"></a>

## Powiedz rodzicom o wydarzeniu w szkole:

Drodzy Rodzice!

Żyjemy w świecie pełnym technologii. I wiemy, że niezależnie od tego, który zawód wybiorą nasi uczniowie, ich szansa na sukces będzie coraz bardziej zależeć od rozumienia, jak działają technologie.

Jednakże tylko niewielki odsetek z nas uczy się **jak** działają technologie. Mniej niż połowa wszystkich szkół uczy informatyki.

Dlatego cała nasza szkoła dołącza do największego wydarzenia edukacyjnego w historii: Godziny Kodowania, w czasie Tygodnia Edukacji Informatycznej (<%= campaign_date('full') %>). Ponad 100 milionów uczniów na całym świecie wzięło już udział w Godzinie Kodowania.

Nasza Godzina Kodowania potwierdza, że [NAZWA SZKOŁY] jest gotowa, by uczyć tych podstawowych umiejętności XXI wieku. By móc w przyszłości oferować Państwa dzieciom zajęcia z programowania, chcemy jak najbardziej rozszerzyć skalę naszej Godziny Kodowania. Zachęcam Państwa do pomocy przy organizacji, kontaktu z lokalnymi mediami, dzielenia się informacją o wydarzeniu w mediach społecznościowych oraz rozważenia możliwości zorganizowania dodatkowych Godzin Kodowania dla naszej społeczności.

To jest nasza szansa, by zmienić przyszłość edukacji w [NAZWA MIEJSCOWOŚCI].

Więcej szczegółów na http://hourofcode.com/<%= @country %>. Proszę o pomoc w promowaniu przedsięwzięcia.

Z poważaniem,

Dyrektor szkoły

<a id="politicians"></a>

## Zaproś przedstawiciela lokalnych władz do udziału w wydarzeniu w Twojej szkole:

Szanowny Panie / Szanowna Pani [Burmistrz/Wójt/Radny/Poseł/Senator IMIĘ i NAZWISKO]:

Czy wie Pan/i, że informatyka jest największym źródłem zarobków w Stanach Zjednoczonych? Jest ponad 500.000 miejsc pracy dla informatyków, ale w zeszłym roku tylko 42.969 absolwentów informatyki wkroczyło na rynek pracy.

Informatyka jest obecnie podstawą w *każdej* branży. Mimo to większość szkół jej nie uczy. Próbujemy to zmienić w szkole [NAZWA SZKOŁY].

Dlatego cała nasza szkoła dołącza do największego wydarzenia edukacyjnego w historii: Godziny Kodowania, w czasie Tygodnia Edukacji Informatycznej (<%= campaign_date('full') %>). Ponad 100 milionów uczniów na całym świecie wzięło już udział w Godzinie Kodowania.

Niniejszym pragnę zaprosić Pana/Panią do udziału w naszej Godzinie Kodowania i prosić o wystąpienie na naszym spotkaniu inauguracyjnym. Odbędzie się ono w dniu [DATA, GODZINA, MIEJSCE]. Pana/Pani wsparcie pomoże utwierdzić naszą społeczność w przekonaniu, że [NAZWA MIEJSCOWOŚCI lub JEDNOSTKI ADMINISTRACYJNEJ] jest gotowy/a pomagać młodemu pokoleniu zdobywać umiejętności niezbędne w XXI wieku. Chcemy mieć pewność, że nasi uczniowie są na czele tworzenia technologii przyszłości - nie tylko ich używania.

Proszę o kontakt pod [NUMER TELEFONU lub ADRES EMAIL]. Z niecierpliwością czekam na odpowiedź.

Z poważaniem, [IMIĘ I NAZWISKO], [FUNKCJA]

<%= view :signup_button %>