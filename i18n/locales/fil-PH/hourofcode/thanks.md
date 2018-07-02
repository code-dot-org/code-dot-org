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

twitter = {:url na =>"http://hourofcode.com", :kaugnay =>'codeorg', :hashtags=>'', :teksto =>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' malibang hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Maraming salamat sa pagsama bilang host ng Hour of Code!

Bilang pasasalamat sa pagtulong na maging posible ito para sa mga estudyante na makapagsimulang matuto sa computer science, gusto naming bigyan kayo ng libreng propesyonal na naka-print na mga poster na nagtatampok ng iba't-ibang ihemplo para sa inyong silid-aralan. Gamitin ang offer code na **FREEPOSTERS** sa pag-checkout. (Tandaan: ito ay magagamit lamang habang ang mga suplay ay mauubos at ika'y nangangailangan ng magsasagot sa gastusin sa shipping. Dahil ang mga poster na ito ay mula sa Estados Unidos, ang gastusin sa shipping ay medyo mahal kung ipapadala sa Canada at sa ibang bansa. Aming nauunawaan na ito ay maaring hindi sapat sa iyong badyet, and aming iminumungkahi na mag-print ng mga [PDF file](https://code.org/inspire) para sa inyong silid-aralan.)  
<br /> [<button>Kumuha ng mga poster</button>](https://store.code.org/products/code-org-posters-set-of-12) Gamitin ang alok na code na FREEPOSTERS

<% if @country == 'us' %> Salamat sa kabutihang-look ng Ozobot, Dexter Industries, littleBits, at Wonder Workshop, mahigit sa 100 na mga silid-aralan ang mapipili na makatanggap ng mga robot o mga circuit sa kanilang klase! Para maging karapat-dapat na makatanggap ng isang hanay, tiyakin na makumpleto ang survey na ipanadala mula sa Code.org matapos ang Hour of Code. Ang Code.org ay ang pipili ng mananalong mga silid-aralan. Sa pagkakataong ito, i-check agng ilan sa mga aktibidad ng robotics at circuit. Mangyaring tandaan na ito ay bukas lamang para sa mga paaralan sa Estados Unidos. <% end %>

<br /> **Ang Hour of Code ay tumatakbo sa panahon ng <%= campaign_date('full') %> at kami'y mananatiling makipag-ugnayan sa mga bagong pagtuturo at ibang kapana-panabik na pagbabago kapag nakalabas na. Sa pagkakataong ito, ano ang pwede mong gawin?**

## 1. Ipamahagi sa inyong paaralan at komunidad

Kakasali mo lang sa kilusan ng Hour of Code. Sabihin sa iyong mga kaibigan sa **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Hikayatin ang iba na makisali [sa aming mga sample email.](%= resolve_url('/promote/resources#sample-emails') %) Makipag-ugnayan sa inyong prinsipal at hamunin ang bawat silid-aralan sa inyong paaralan na sumali. I-recruit ang lokal na grupo — boy/girl scouts club, simbahan, unibersidad, grupo ng mga beterano, unyon ng mga manggagawa, o kahit ilang mga kaibigan. Hindi mo kailangang nasa paaralan para matuto ng mga bagong kasanayan. Mag-imbita ng lokal na pulitiko o taga-gawa ng patakaran na bisitahin ang inyong paaralan para sa Hour of Code. Ito ay makakatulong na bumuo ng suporta para sa computer science sa inyong lugar ng higit pa sa isang oras.

Gamitin itong [posters, bandera, stickers, videos at higit pa](%= resolve_url('/promote/resources') %) para sa iyong sariling kaganapan.

## 2. Hanapin ang lokal na boluntaryo na tutulong sa inyong kaganapan.

[Search our volunteer map](%= codeorg_url('/volunteer/local') %) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. Planuhin ang iyong Hour of Code

Piliin ang [Hour of Code activity](https://hourofcode.com/learn) para sa inyong paaralan at [i-review itong how-to-guide](%= resolve_url('/how-to') %)>.

# Lagpasan ang Hour of Code

<% if @country == 'us' %> Ang Hour of Code is lamang simula. Kung ikaw ay isang administrator, guro, o tagataguyod, kami ay may [propesyonal na development, kurikulum, at mga mapagkukunan upang matulungan kang magdala ng mga klase sa computer science sa inyong paaralan o palawakin ang iyong mga handog.](https://code.org/yourschool) Kung ikaw nagtuturo na nag computer science, gamitin ang mga mapagkukunan sa panahon ng CS Education Week para kumuha ng suporta galing sa administrasyon, mga magulang, at komunidad.

Mayroong kang maraming pagpipilian na bagay sa iyong paaralan. Karamihan sa mga organisasyon nag-aalok ng Hour of Code na pagtuturo ay mayroon ding kurikulum at propesyonal na development na magagamit. Kung gusto mong maghanap ng aralin na gusto mo, magtanong ukol sa paghihigit pa. Para matulungang makapagsimula, kami ay nag-highlight ng bilang ng [tagapaglaan ng kurikulum na tutulong sa iyo o sa iyong mga estudyante na lumampas sa isang oras.](https://hourofcode.com/beyond)

<% else %> Ang Hour of Code is lamang simula. Karamihan sa mga organisasyon na nag-aalok ng Hour of Code na mga aralin ay mayroon ding kurikulum na magagamit para humigit pa. Para matulungang makapagsimula, kami ay nag-highlight ng bilang ng [tagapaglaan ng kurikulum na tutulong sa iyo o sa iyong mga estudyante na lumampas sa isang oras.](https://hourofcode.com/beyond)

Ang code.org ay nag-aalok din ng buong[introductory computer science courses](https://code.org/educate/curriculum/cs-fundamentals-international) na isinalin sa higit pang 25 na wika na walang gastos sa iyo o sa iyong paaralan. <% end %>

<%= view 'popup_window.js' %>