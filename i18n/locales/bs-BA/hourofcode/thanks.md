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
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Hvala za prijavu za domaćina Sata programiranja!

As a thank you for helping make it possible for students to start learning computer science, we'd like to give you a free set of professionally printed posters featuring diverse role models for your classroom. Use offer code **FREEPOSTERS** at checkout. (Note: this is only available while supplies last and you'll need to cover shipping costs. Budući da su ove plakate poslane iz Sjedinjeni Američki država, troškovi transporta mogu biti prilično visoki ako se šalje u Kanadu ili internacionalno. We understand that this may not be in your budget, and we encourage you to print the [PDF files](https://code.org/inspire) for your classroom.)  
<br /> [<button>Get posters</button>](https://store.code.org/products/code-org-posters-set-of-12) Use offer code FREEPOSTERS

<% if @country == 'us' %> Zahvaljujući darežljivosti Ozobot-a, Dexter industrija, littleBits-a, i Radionica Čuda, preko 100 učionica će biti izabrano da dobije robote ili sklopove za njihov čas! To be eligible to receive a set, make sure to complete the survey sent from Code.org after the Hour of Code. Code.org će izabrati učionice koje su pobijedile. U međuvremenu, provjeri neke aktivnosti robotike i krugova. Imajte na umu da je ovo samo za Američke škole. <% end %>

<br /> **The Hour of Code runs during <%= campaign_date('full') %> and we'll be in touch about new tutorials and other exciting updates as they come out. In the meantime, what can you do now?**

## 1. Spread the word in your school and community

Upravo si se pridružio pokretu Čas Kodiranja. Reci svojim prijateljima sa **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Encourage others to participate [with our sample emails.](%= resolve_url('/promote/resources#sample-emails') %) Contact your principal and challenge every classroom at your school to sign up. Recruit a local group — boy/girl scouts club, church, university, veterans group, labor union, or even some friends. Ne morate biti u školi da naučite nove vještine. Invite a local politician or policy maker to visit your school for the Hour of Code. To može pomoći u izgradnji podrške za računarstvo preko jednog sata u tvom području.

Use these [posters, banners, stickers, videos and more](%= resolve_url('/promote/resources') %) for your own event.

## 2. Pronađi lokalnog volontera da ti pomogne sa događajem.

[Search our volunteer map](%= codeorg_url('/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Plan your Hour of Code

Izaberite [aktivnost Časa Kodiranja](https://hourofcode.com/learn)za svoju učionicu i [pregledaj ovaj kako uraditi vodič](%= resolve_url('/how-to') %).

# Go beyond an Hour of Code

<% if @country == 'us' %> Čas Kodiranja tek počinje. Whether you are an administrator, teacher, or advocate, we have [professional development, curriculum, and resources to help you bring computer science classes to your school or expand your offerings.](https://code.org/yourschool) If you already teach computer science, use these resources during CS Education Week to rally support from your administration, parents, and community.

You have many choices to fit your school. Mnoge organizacije koje nude tutorijale Časa Kodiranja također imaju nastavni plan i dostupan profesionalni razvoj. Ako pronađete lekciju koja Vam se sviđa, tražite da idete dalje. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

<% else %> Čas Kodiranja tek počinje. Većina organizacija koje nude lekcije Časa Kodiranja također imaju dostupan nastavni plan da nastave dalje. To help you get started, we've highlighted a number of [curriculum providers that will help you or your students go beyond an hour.](https://hourofcode.com/beyond)

Code.org also offers full [introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) translated into over 25 languages at no cost to you or your school. <% end %>

<%= view 'popup_window.js' %>