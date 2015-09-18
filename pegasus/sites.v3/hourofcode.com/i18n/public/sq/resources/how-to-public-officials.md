---

title: <%= hoc_s(:title_how_to_officials) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

## Sill Orën e Kodimit në gjithë komunitetin tënd.

### Bëj çdo shkollë te marrë pjesë, çdo student të mësojë!

  1. **Rekruto shkollën dhe rrethin lokal.**Përdor[ këtë email](<%= resolve_url('/resources#sample-emails') %>) ose[ këtë njoftim](<%= resolve_url('/resources/stats') %>) si një pikë nisjeje, dhe hidhi një sy këtij [udhëzuesi](<%= resolve_url('/resources/how-to') %>) për shkollat dhe rrethet. Bëji të ditur **çdo** mësues pjesmarrës do të marri një [dhuratë falenderim](<%= resolve_url('/resources/how-to') %>) dhe në **secilin qytet**, një shkollë pjesëmarrëse do të fitoj **$ 10,000 në teknologji**!

  2. **Organizo eventin Ora e Kodimit.**Shiko[ udhëzuesin e eventit tonë](<%= hoc_uri('/resources/how-to-event') %>) për një numër shfaqjesh të thjeshta dhe burime të tjera planifikimi të eventit. Organizimi i një eventi është një mënyrë e mirë për të reklamuar Orën e Kodimit dhe rritur numrin e pjesmarrësve.

  3. **Ndiq një event gjatë Javës Edukative të Shkencave Kompjuterike (<%= campaign_date('short') %>).** [Gjej klasa dhe shkolla](<%= resolve_url('/events') %>) pjesmarrëse në rrethin e qytetit ose në vendin tuaj.

  4. **Nxirr një dekret apo rezolutë.**Shiko këtë [shembull rezolute](<%= hoc_uri('resources/proclamation') %>) mbështetëse për Javën Edukative të Shkencave Kompjuterike dhe qëllimet që mund të përdoren nga ligjvënësit lokal dhe shtetëror.

  5. **Draft an op-end**. Konsideroni publikimin e një shkrimi të llojit opinion, në gazetën tuaj lokale. Shiko këtë [thjeshtë op-ed](<%= hoc_uri('/resources/op-ed') %>)duke mbështetur suportin kompjuterik të Javës Edukative të Shkencave Kompjuterike dhe qëllimet e saj.

  6. **Përhap fjalën.**[Shpërnda videon e Orës së Kodimit në Facebook](https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fhourofcode.com%2Fus)dhe[fol për mbështetjen tënde në Twitter](https://twitter.com/intent/tweet?url=http%3A%2F%2Fhourofcode.com&text=I%27m%20participating%20in%20this%20year%27s%20%23HourOfCode%2C%20are%20you%3F%20%40codeorg&original_referer=https%3A%2F%2Fwww.google.com%2Furl%3Fq%3Dhttps%253A%252F%252Ftwitter.com%252Fshare%253Fhashtags%253D%2526amp%253Brelated%253Dcodeorg%2526amp%253Btext%253DI%252527m%252Bparticipating%252Bin%252Bthis%252Byear%252527s%252B%252523HourOfCode%25252C%252Bare%252Byou%25253F%252B%252540codeorg%2526amp%253Burl%253Dhttp%25253A%25252F%25252Fhourofcode.com%26sa%3DD%26sntz%3D1%26usg%3DAFQjCNE1GLTUbKZfMlEh9Aj5w0iswz6PYQ&related=codeorg&hashtags=). Shpërnda foto të eventit ose video të tuat dhe të të tjerve duke bërë Orën e Kodimit. Përdor hashtag-un**#OraEKodimit** kështu që Code.org(@code.org) mund ta shokoj atë dhe të promovojë mbështetje. Ose, përdor këto tweets të thjeshta:
    
      * Çdo student, djalë ose vajzë, duhet të ketë mundësinë të mësoj shkencën kompjuterike. Bashkohu me ne duke filluar me një #OrëKodimi <% if @country != 'us' %> [https://hourofcode.com/<%= @country %>](<%= resolve_url('/') %>) <% else %> [https://hourofcode.com](<%= resolve_url('/') %>) <% end %>
      * Sot, ne jemi krenar për t'u bashkuar me lëvizjen Ora e Kodimit. A je edhe ti? #OraEKodimit <% if @country != 'us' %> [https://hourofcode.com/<%= @country %>](<%= resolve_url('/') %>) <% else %> [https://hourofcode.com](<%= resolve_url('/') %>) <% end %>   
          
        

  7. **Lësho një deklaratë për shtyp.** [Përdor këtë shembull](<%= resolve_url('/resources/official-press-release') %>) si udhëzues.

  8. **Lidhu në nivel lokal.** Vizito [<%= resolve_url('code.org/promote') %>](<%= resolve_url('https://code.org/promote') %>) të mësosh më shumë rreth edukimit në shkencën kompjuterike në shtetin tuaj. Nënshkruaj peticionin këtu dhe do të marrësh përditësimet nga Code.org për përpjekjet e tyre lokale, shtetërore dhe federale.

<%= view :signup_button %>