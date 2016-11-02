* * *

title: <%= hoc_s(:title_how_to_officials) %> layout: wide nav: how_to_nav

* * *

<%= view :signup_button %>

# Indlela ongaletha ngayo Ihora loKufingqwa kumphakathi wonke.

[col-33]

![](/images/fit-275/highlight-obama.png)&nbsp;&nbsp;&nbsp;![](/images/fit-246/dan.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Thola sonke isikole sibambe iqhaza, wonke umfundi efunda!

  1. **Funda ikhasi-elilodwa lethu** ngokuba kungani imfundiso yekhompyutha sayensi ibalulekile, kanye nokuthi ungasiza kanjani ngokweseka iHora loKufingqwa. [Thola lephepha elilodwa lapha.](/files/hoc-one-pager-public-officials-2016.pdf)

  2. **Faka izikole zendawo kanye nesifunda.** Sebenzisa [ lemeyili](%= resolve_url('/promote/resources#sample-emails') %) okanye [leblurb](%= resolve_url('/promote/stats') %) njengephuzu lokuqaga, kanye ithathe ukubuka lokhu [ukuze-kanjani](%= resolve_url('/how-to') %) zezikole kanye nezifunda.

  3. **Phatha umcimbi weHora loKufingqwa.** Bheka ku[indlela yokuqondisa umcimbi](%= resolve_url('/how-to/events') %) ngesibonelo sokuhola umcimbi, ezokusiza ngokoku sakaza kanye nezinye izinsiza zokulungiselela umcimbi. Ukuphatha umcimbi kuyindlela enkulu yokukhuthaza iHora loKifingqwa kanye nokuheha abangathatha iqhaza.

  4. **Ibakhona kumcimbi weViki lemfundiso yeKhompyutha Sayensi (%= umkhankaso_usuku('kafushane') %>).** [Thola akilasi kanye nezikole](%= resolve_url('/events') %) athatha iqhaza kusifinda, kudolobha okanye kulizwe lakho.

  5. ** Khipha isimemezelo okanye isixazululo.** Bheka lokhu [ isibonelo sesixazululo](%= resolve_url('resources/proclamation') %) Esisekela iViki leMfundiso yeKhompyutha Sayensi kanye nomgomo ongasetshenziswa ngumbuso nezibeka mthetho.

  6. **Lungisa i Op-ed**. Cabanga ukushicilela isiqeshana sombono kuphephandaba lrdolobha lakho. Buka leli [isampula op-ed](%= resolve_url('/promote/op-ed') %) asekela ikhompyutha exhasa iViki leMfundiso yeKhompyutha Sayensi kanye nenjogo zayo.

  7. **Yandisa izwi.** [Yabelana ngevidiyo yeHora loKufingqwa kuFacebook](https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fhourofcode.com%2Fus) kanye [khuluma ngokweseka kwakho kuTwitter](https://twitter.com/intent/tweet?url=http%3A%2F%2Fhourofcode.com&text=I%27m%20participating%20in%20this%20year%27s%20%23HourOfCode%2C%20are%20you%3F%20%40codeorg&original_referer=https%3A%2F%2Fwww.google.com%2Furl%3Fq%3Dhttps%253A%252F%252Ftwitter.com%252Fshare%253Fhashtags%253D%2526amp%253Brelated%253Dcodeorg%2526amp%253Btext%253DI%252527m%252Bparticipating%252Bin%252Bthis%252Byear%252527s%252B%252523HourOfCode%25252C%252Bare%252Byou%25253F%252B%252540codeorg%2526amp%253Burl%253Dhttp%25253A%25252F%25252Fhourofcode.com%26sa%3DD%26sntz%3D1%26usg%3DAFQjCNE1GLTUbKZfMlEh9Aj5w0iswz6PYQ&related=codeorg&hashtags=). Yabelana ngemifanekiso yomcimbi okanye ividiyo yakho kanye nabanye abadala abenza iHora loKufingqwa. Sebenzisa ihashtag lena **#HoraloKufingqwa** ngakho Code.org (@code.org) ungayibona kanye futhu ukhuthaze ukweseka. Okanye, sebenzisa sampula etweets:
    
      * Every student, boy or girl, should have the chance to learn computer science. Join us in starting with one #HourOfCode <% if @country != 'us' %> [https://hourofcode.com/<%= @country %>](%= resolve_url('/') %) <% else %> [https://hourofcode.com](%= resolve_url('/') %) <% end %>
      * Today, we're proud to join the Hour of Code movement. Are you in? #HourOfCode <% if @country != 'us' %> [https://hourofcode.com/<%= @country %>](%= resolve_url('/') %) <% else %> [https://hourofcode.com](%= resolve_url('/') %) <% end %>   
          
        

  8. **Issue a press release.** [Use this sample](%= resolve_url('/promote/official-press-release') %) as a guide.

  9. **Connect locally.** Visit [<%= resolve_url('code.org/promote') %>](%= resolve_url('https://code.org/promote') %) to learn more about computer science education in your state. Sign the petition there and you’ll get updates from Code.org on their local, state and federal advocacy efforts.

<%= view :signup_button %>