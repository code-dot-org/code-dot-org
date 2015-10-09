---

title: <%= hoc_s(:title_how_to_officials) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

## How to bring the Hour of Code to your entire community.

### Bëj çdo shkollë te marrë pjesë, çdo student të mësojë!

  1. **Recruit local schools and districts.** Use [this email](<%= resolve_url('/promote/resources#sample-emails') %>) or [this blurb](<%= resolve_url('/promote/stats') %>) as a starting point, and take a look at this [how-to](<%= resolve_url('/how-to') %>) for schools and districts. Let them know **every** participating educator will receive a [thank you gift](<%= resolve_url('/how-to') %>) and in **each state**, one participating school will win **$10,000 in technology**!

  2. **Host an Hour of Code event.** See our [event how-to guide](<%= resolve_url('/how-to/how-to-event') %>) for a sample run of show, media outreach kit and other event-planning resources. Organizimi i një eventi është një mënyrë e mirë për të reklamuar Orën e Kodimit dhe rritur numrin e pjesmarrësve.

  3. **Ndiq një event gjatë Javës Edukative të Shkencave Kompjuterike (<%= campaign_date('short') %>).** [Gjej klasa dhe shkolla](<%= resolve_url('/events') %>) pjesmarrëse në rrethin e qytetit ose në vendin tuaj.

  4. **Nxirr një dekret apo rezolutë.**Shiko këtë [shembull rezolute](<%= hoc_uri('resources/proclamation') %>) mbështetëse për Javën Edukative të Shkencave Kompjuterike dhe qëllimet që mund të përdoren nga ligjvënësit lokal dhe shtetëror.

  5. **Draft an op-end**. Konsideroni publikimin e një shkrimi të llojit opinion, në gazetën tuaj lokale. See this [sample op-ed](<%= resolve_url('/promote/op-ed') %>) supporting comupter supportive of Computer Science Education Week and its goals.

  6. **Përhap fjalën.**[Shpërnda videon e Orës së Kodimit në Facebook](https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fhourofcode.com%2Fus)dhe[fol për mbështetjen tënde në Twitter](https://twitter.com/intent/tweet?url=http%3A%2F%2Fhourofcode.com&text=I%27m%20participating%20in%20this%20year%27s%20%23HourOfCode%2C%20are%20you%3F%20%40codeorg&original_referer=https%3A%2F%2Fwww.google.com%2Furl%3Fq%3Dhttps%253A%252F%252Ftwitter.com%252Fshare%253Fhashtags%253D%2526amp%253Brelated%253Dcodeorg%2526amp%253Btext%253DI%252527m%252Bparticipating%252Bin%252Bthis%252Byear%252527s%252B%252523HourOfCode%25252C%252Bare%252Byou%25253F%252B%252540codeorg%2526amp%253Burl%253Dhttp%25253A%25252F%25252Fhourofcode.com%26sa%3DD%26sntz%3D1%26usg%3DAFQjCNE1GLTUbKZfMlEh9Aj5w0iswz6PYQ&related=codeorg&hashtags=). Shpërnda foto të eventit ose video të tuat dhe të të tjerve duke bërë Orën e Kodimit. Përdor hashtag-un**#OraEKodimit** kështu që Code.org(@code.org) mund ta shokoj atë dhe të promovojë mbështetje. Ose, përdor këto tweets të thjeshta:
    
      * Çdo student, djalë ose vajzë, duhet të ketë mundësinë të mësoj shkencën kompjuterike. Bashkohu me ne duke filluar me një #OrëKodimi <% if @country != 'us' %> [https://hourofcode.com/<%= @country %>](<%= resolve_url('/') %>) <% else %> [https://hourofcode.com](<%= resolve_url('/') %>) <% end %>
      * Sot, ne jemi krenar për t'u bashkuar me lëvizjen Ora e Kodimit. A je edhe ti? #OraEKodimit <% if @country != 'us' %> [https://hourofcode.com/<%= @country %>](<%= resolve_url('/') %>) <% else %> [https://hourofcode.com](<%= resolve_url('/') %>) <% end %>   
          
        

  7. **Issue a press release.** [Use this sample](<%= resolve_url('/promote/official-press-release') %>) as a guide.

  8. **Lidhu në nivel lokal.** Vizito [<%= resolve_url('code.org/promote') %>](<%= resolve_url('https://code.org/promote') %>) të mësosh më shumë rreth edukimit në shkencën kompjuterike në shtetin tuaj. Nënshkruaj peticionin këtu dhe do të marrësh përditësimet nga Code.org për përpjekjet e tyre lokale, shtetërore dhe federale.

<%= view :signup_button %>