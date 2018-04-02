---
title: <%= hoc_s(:title_how_to_events) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# Hogyan kell megszervezni egy Kódolás Órája eseményt?

## 1. Prepare for your event

- Determine a venue, date, and time.
- Send [a letter](https://hourofcode.com/promote/resources#sample-emails) to invite your local mayor, congressman, governor, or influential business person to speak. Check out our [how-to toolkit](<%=localized_file('/files/elected-official.pdf')%>) when hosting an elected official during an Hour of Code for more info.
- Hívd meg a médiát, bloggereket! Itt van az [újságírói segédeszközünk ](<%= resolve_url('/promote/press-kit') %>)is.

## 2. During your event

- Kick off your event with one of our [inspirational videos](<%= resolve_url('/promote/resources#videos') %>).
- Mutass be egy átfogó képet az informatika jelentőségéről, használva [ezeket a statisztikákat, infógrafikákat](<%= resolve_url('/promote/stats') %>).   
      
    
- Egyéb esemény ötletek: 
    - Invite a local industry leader to discuss his or her work involving computer science.
    - Invite a local politician and have students teach him or her how to code.
    - Have a group of students demonstrate an unplugged activity.
    - Have a group of students teach the principal or a group of teachers how to code.
    - If your school already teaches computer science, have students demo projects.

## 3. Share how it went

- Ossz meg képeket az eseményről a Facebookon vagy Twitteren! 
- Use the hashtag **#HourOfCode**

## Host a Family Code Night with the Hour of Code and invite parents to participate

Consider hosting a K-5 evening event and inviting parents to join their students for an hour of computer science. This is a great way to engage the larger community and encourage parent support for computer science at your school. Our partners at Family Code Night have created an all-in-one Event Kit with planning checklist, presenter’s script, invitation emails, posters, powerpoints and more to run your own event. [Click here to download the Event Kit](http://www.familycodenight.org/DownloadCodeDotOrg.html).

## Példa egy esemény tervére

**Esemény:** Iskolai informatikai hét

**Date:** <%= campaign_date('start-short') %> (start of Computer Science Education Week)

**Ideje:** Iskolaidőben, délelőtti programok, melyek körülbelül 1 órásak.

**Helyszín:** Iskola közösségi tere (színház, tornaterem, étkező)   
  


## Az előadás időrendje

| Időpont       | Program                                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10:00 - 10:05 | Kezdés az egyik [motivációs videónkkal](<%= resolve_url('/promote/resources#videos') %>)                                                                     |
| 10:05 - 10:15 | Principal gives an intro overviewing the importance of computer science. Use these [stats and infographics](<%= resolve_url('/promote/stats') %>).           |
| 10:15 - 10:30 | Különleges vendég beszél a hátterükről, valamint arról, hogy milyen fontos szerepet játszik mindennapjainkban a technológia és számítástechnikai tudomány. |
| 10:30 - 10:40 | Students do an Hour of Code demo for the school. Fun twist: have them teach the principal, politician, or other students!                                  |
| 10:40 - 11:00 | A diákok bemutatnak egy számítógép-nélküli foglalkozást és azt, hogy hogyan lehet tartani informatika órát számítógépek nélkül.                            |
| 11:00 - 11:05 | A tanár, aki segített az esemény létrejöttében beszédével zárja azt.                                                                                       |

<%= view :signup_button %>