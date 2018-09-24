---
title: <%= hoc_s(:title_how_to_events).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# How to organize an Hour of Code assembly or event

### Get your entire school or community involved in an Hour of Code!

---

## 1. Pripravte sa na akciu

- Zabezpečte priestory, vyberte dátum a čas.
- Send [a letter](https://hourofcode.com/promote/resources#sample-emails) to your local mayor, member of Congress, governor, or influential business person and invite them to speak. Pozrite si [návod](<%=localized_file('/files/elected-official.pdf')%>), ako zorganizovať návštevu verejného činiteľa počas Hodiny Kódu.
- Pozvite médiá/tlač, napr. lokálnu televíziu, rádio, regionálne noviny, blogera píšuceho o vzdelávaní či technológiách. Pozrite si náš [tlačový balíček](<%= resolve_url('/promote/press-kit') %>) ako pomocníka.

## 2. Počas Vašej akcie

- Začnite Hodinu s jedným z našich [motivačných videí](<%= resolve_url('/promote/resources#videos') %>).
- Ukážte na úvod význam informatiky, použite tieto [štatistiky a infografiky](<%= resolve_url('/promote/stats') %>).   
      
    
- **Other event ideas**: 
    - Pozvite významného miestneho podnikateľa, aby porozprával o svojich pracovných činnostiach a využívaní informatiky počas nich.
    - Pozvite miestneho politika, aby ho študenti naučili, ako sa programuje.
    - Skupina študentov nech predvedie aktivity, ktoré nevyžadujú počítače.
    - Študenti môžu naučit riaditeľa školy alebo skupinu učiteľov ako programovať.
    - Ak už na škole vyučujete informatiku, nechajte študentov predstaviť vzorové projekty.

## 3. Zdieľajte priebeh

Share pictures of your event on Facebook and Twitter and use the hashtag **#HourOfCode**.

---

## Zorganizujte rodinnú Noc Kódu s Hodinou Kódu a pozvite aj rodičov

Consider hosting a K-5 evening event and invite parents to join their students for an hour of computer science. This is a great way to engage the larger community and encourage parent support for computer science at your school. Our partners at Family Code Night have created an all-in-one event kit with planning checklist, presenter’s script, invitation emails, posters, powerpoints, and more to run your own event. [Click here to download the Event Kit](http://www.familycodenight.org/DownloadCodeDotOrg.html).

---

## Example plan for a school assembly or event

**Event:** School-wide Computer Science Education Week kick-off assembly

**Date:** <%= campaign_date('start-short') %> (start of Computer Science Education Week)

**Time:** During the school day. Mid-morning event preferred. Approximately 1 hour.

**Location:** School assembly hall (e.g. theater, gym, cafeteria)

## Priebeh akcie

| Čas           | Činnosť                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 10:00 - 10:05 | Open with one of our [inspirational videos](<%= resolve_url('/promote/resources#videos') %>).                                                                        |
| 10:05 - 10:15 | Riaditeľ na úvod odprezentuje dôležitosť informatiky. Použite tieto [štatistiky a infografiky](<%= resolve_url('/promote/stats') %>).                                |
| 10:15 - 10:30 | Špeciálny hosť porozpráva o svojom zázemí a o tom, akú dôležitú úlohu zohrávajú technológie a informatika v jeho každodennom živote.                               |
| 10:30 - 10:40 | Študenti predvedú vzorovú Hodinu Kódu na škole. Pre spestrenie môžete nechať študentov, aby naučili programovať riaditeľa, prítomných hostí alebo iných študentov! |
| 10:40 - 11:00 | Študenti predvedú aktivity bez počítačov a ukážu, ako sa dá informatika učiť bez použitia počítačov.                                                               |
| 11:00 - 11:05 | Učiteľ, ktorý organizuje toto podujatie, prednesie záverečné slová.                                                                                                |

<%= view :signup_button %>