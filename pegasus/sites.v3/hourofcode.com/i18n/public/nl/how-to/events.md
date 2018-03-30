---
title: "<%= hoc_s(:title_how_to_events) %>"
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# Hoe kunt u een CodeUur evenement organiseren

## 1. Prepare for your event

- Determine a venue, date, and time.
- Send [a letter](https://hourofcode.com/promote/resources#sample-emails) to invite your local mayor, congressman, governor, or influential business person to speak. Check out our [how-to toolkit](<%=localized_file('/files/elected-official.pdf')%>) when hosting an elected official during an Hour of Code for more info.
- Nodig media en pers uit zoals de locale nieuwsstation, de krant of bloggers. Bekijk onze [pers kit](<%= resolve_url('/promote/press-kit') %>) voor hulp.

## 2. During your event

- Kick off your event with one of our [inspirational videos](<%= resolve_url('/promote/resources#videos') %>).
- Geef een inleiding over het belang van programmeren, met behulp van deze [statistieken en infographics](<%= resolve_url('/promote/stats') %>).   
      
    
- Andere evenement ideeën: 
    - Invite a local industry leader to discuss his or her work involving computer science.
    - Invite a local politician and have students teach him or her how to code.
    - Have a group of students demonstrate an unplugged activity.
    - Have a group of students teach the principal or a group of teachers how to code.
    - If your school already teaches computer science, have students demo projects.

## 3. Share how it went

- Deel foto's van je evenement op Facebook en Twitter. 
- Use the hashtag **#HourOfCode**

## Host a Family Code Night with the Hour of Code and invite parents to participate

Consider hosting a K-5 evening event and inviting parents to join their students for an hour of computer science. This is a great way to engage the larger community and encourage parent support for computer science at your school. Our partners at Family Code Night have created an all-in-one Event Kit with planning checklist, presenter’s script, invitation emails, posters, powerpoints and more to run your own event. [Click here to download the Event Kit](http://www.familycodenight.org/DownloadCodeDotOrg.html).

## Voorbeeld van een evenementenplan

**Evenement:** Door heel de school Computer Science Education Week kick-off bijeenkomst

**Date:** <%= campaign_date('start-short') %> (start of Computer Science Education Week)

**Time** Gedurende de schooldag. Het liefst in de morgen. Ongeveer 1 uur.

**Location:** Bijeenkomst in een hal of grote ruimte(bv. theater, sportzaal, cafetaria)   
  


## Programma

| Tijdstip    | Actie                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 10:00-10:05 | Start met één van onze [inspirerende video's](<%= resolve_url('/promote/resources#videos') %>)                                                     |
| 10:05-10:15 | Principal gives an intro overviewing the importance of computer science. Use these [stats and infographics](<%= resolve_url('/promote/stats') %>). |
| 10:15-10:30 | Speciale gasten praten over hun achtergrond en welke belangrijke rol programmeren in hun alledaagse leven heeft.                                 |
| 10:30-10:40 | Students do an Hour of Code demo for the school. Fun twist: have them teach the principal, politician, or other students!                        |
| 10:40-11:00 | Studenten laten een unplugged activiteit zien om te demonstreren hoe programmeren kan worden geleerd zonder computers.                           |
| 11:00-11:05 | De leraar die het evenement heeft georganiseerd sluit af.                                                                                        |

<%= view :signup_button %>
