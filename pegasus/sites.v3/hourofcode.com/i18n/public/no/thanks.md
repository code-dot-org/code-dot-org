---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
nav: how_to_nav

social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": "http://<%=request.host%>"

  "twitter:card": player
  "twitter:site": "@codeorg"
  "twitter:url": "http://<%=request.host%>"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
---
<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# Takk for at du meldte deg på som vert for Kodetimen!

Som en takk for at du hjelper elever å lære om informatikk, vil vi gjerne gi deg et gratis sett med profesjonelt trykkede plakater med diverse rollemodeller til å henge opp i klasserommet. Bruk tilbudskoden **FREEPOSTERS** i kassa. (Merk: Dette er bare tilgjengelig så lenge beholdningen varer, og du må selv dekke fraktkostnader. Siden plakatene sendes fra USA, kan kostnader bli ganske høye for frakt til Norge og andre land utenfor USA. Vi har forståelse for at dette kan bli litt dyrt. Som et alternativ kan vi anbefale å skrive ut [PDF-filene](https://code.org/inspire) til bruk i klasserommet.)  
<br /> [ <button>Send oss plakater</button>](https://store.code.org/products/code-org-posters-set-of-12) Bruk tilbudskode FREEPOSTERS

<% if @country == 'us' %> Takket være støtten fra Ozobot, Dexter Industries, littleBits og Wonder Workshop, vil over 100 klasser motta roboter eller annet utstyr! For å delta i trekningen må du fullføre undersøkelsen fra Code.org etter Kodetimen. Code.org vil kåre vinnerne. I mellomtiden kan du se på noen av aktivitetene våre som omhandler robotikk og kretser. NB: Kun amerikanske skoler kan være med i trekningen. <% end %>

<br /> **Kodetimen-kampanjen kjøres <%= campaign_date('full') %>, og vil vil ta kontakt når det foreligger nye introduksjonsoppgaver og andre spennende oppdateringer. Hva kan du gjøre mens du venter?**

## 1. Spre budskapet på din lokale skole og i nærmiljøet

Du har akkurat blitt med i Kodetimen-gjengen. Bruk emneknaggen **#Kodetimen** eller **#HourOfCode** for å fortelle dette til omgangskretsen din!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Få flere til å delta, f. eks. ved å sende ut [denne e-posten](<%= resolve_url('/promote/resources#sample-emails') %>). Ta kontakt med din lokale rektor, med en utfordring til å melde på alle klassene på skolen. Rekrutter lokale grupper — speidergrupper, menigheten, universiteter og høyskoler, eldresentre, fagforeninger, eller til og med venner og bekjente. Du trenger ikke gå på skolen for å lære noe nytt. Inviter en lokalpolitiker til å besøke skolen mens de kjører Kodetimen. Dette kan hjelpe informatikkfaget å få fotfeste i ditt nærområde litt lenger enn én time.

Benytt våre [plakater, bannere, klistremerker, videoer og annet](<%= resolve_url('/promote/resources') %>) for å fremme ditt eget arrangement.

## 2. Finn en lokal frivillig som kan hjelpe deg med arrangementet.

[Search our volunteer map](<%= codeorg_url('/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Planlegging av Kodetimen

Velg en [Kodetime-aktivitet](https://hourofcode.com/learn) som klassen kan prøve seg på, og les vår [veiledning](<%= resolve_url('/how-to') %>).

# Neste steg etter Kodetimen

<% if @country == 'us' %> En Kodetime er bare en start. Uansett om du er organisator, lærer eller talsperson, tilbyr vi [profesjonell utvikling, fag og pensum, samt ressurser som kan hjelpe deg å sette informatikk på timeplanen på din skole.](https://code.org/yourschool) Hvis du allerede underviser i informatikk, kan du benytte våre ressurser til å fremme faget på skolen, blant foreldrene, og i nærmiljøet.

Det finnes mange muligheter til å tilpasse opplegget til din klasse eller skole. De fleste organisasjonene som tilbyr veiledningsoppgaver til Kodetimen har også tilbud om annen faglig utvikling og oppfølging. Hvis du finner en oppgave du liker godt, ta kontakt for å utforske mulighetene for videre oppfølging og utvikling. For å komme i gang har vi samlet en liste av [profesjonelle tilbydere som kan være behjelpelig med å ta opplæringen et skritt videre.](https://hourofcode.com/beyond)

<% else %> Kodetimen er bare en start. De fleste organisasjonene som tilbyr Kodetime-leksjoner har også læreplaner for videre utvikling. For å komme i gang har vi samlet en liste av [profesjonelle tilbydere som kan være behjelpelig med å ta opplæringen et skritt videre.](https://hourofcode.com/beyond)

Code.org tilbyr også [begynnerkurs i informatikk](https://code.org/educate/curriculum/cs-fundamentals-international) som er oversatt til mer enn 25 ulike språk, kostnadsfritt for deg og skolen din. <% end %>

<%= view 'popup_window.js' %>