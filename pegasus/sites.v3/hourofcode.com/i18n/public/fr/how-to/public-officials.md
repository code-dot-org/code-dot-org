---

title: <%= hoc_s(:title_how_to_officials) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# Comment organiser l'Heure de Code dans votre communauté ?

[col-33]

![](/images/fit-275/highlight-obama.png)&nbsp;&nbsp;&nbsp;![](/images/fit-246/dan.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Faites participer chaque école, permettez à tout étudiant d'apprendre !

  1. **Lisez notre page** qui explique pourquoi l’enseignement de l’informatique scientifique est si important, et comment vous pouvez vous impliquer en soutenant l’Heure de Code. [Obtenir la page ici.](/files/hoc-one-pager-public-officials-2016.pdf)

  2. **Faites participer des écoles près de chez vous et les académies.** Utilisez [ce courriel](<%= resolve_url('/promote/resources#sample-emails') %>) ou [ce texte de présentation](<%= resolve_url('/promote/stats') %>) comme point de départ, et jetez un œil à ce [guide](<%= resolve_url('/how-to') %>) destinés aux écoles et académies.

  3. **Organisez une session de l'Heure de Code.** Consultez notre guide [Comment organiser un événement](<%= resolve_url('/how-to/events') %>) pour obtenir des exemples d'outils de sensibilisation, des démonstrations et d'autres ressources de planification. Organiser un événement est un excellent moyen de promouvoir l'Heure de Code et d'en augmenter la participation.

  4. **Participez à un événement pendant la Semaine de l'enseignement de l'informatique (<%= campaign_date('short') %>).** [Trouvez des classes et des écoles](<%= resolve_url('/events') %>) dans votre quartier, votre ville ou votre région.

  5. **Issue a proclamation or resolution.** See this [sample resolution](<%= resolve_url('resources/proclamation') %>) supportive of Computer Science Education Week and its goals that could be used by state and local legislators.

  6. **Draft an op-ed**. Consider publishing an opinion piece in your local paper. See this [sample op-ed](<%= resolve_url('/promote/op-ed') %>) supporting comupter supportive of Computer Science Education Week and its goals.

  7. **Spread the word.** [Share the Hour of Code video on Facebook](https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fhourofcode.com%2Fus) and [talk about your support on Twitter](https://twitter.com/intent/tweet?url=http%3A%2F%2Fhourofcode.com&text=I%27m%20participating%20in%20this%20year%27s%20%23HourOfCode%2C%20are%20you%3F%20%40codeorg&original_referer=https%3A%2F%2Fwww.google.com%2Furl%3Fq%3Dhttps%253A%252F%252Ftwitter.com%252Fshare%253Fhashtags%253D%2526amp%253Brelated%253Dcodeorg%2526amp%253Btext%253DI%252527m%252Bparticipating%252Bin%252Bthis%252Byear%252527s%252B%252523HourOfCode%25252C%252Bare%252Byou%25253F%252B%252540codeorg%2526amp%253Burl%253Dhttp%25253A%25252F%25252Fhourofcode.com%26sa%3DD%26sntz%3D1%26usg%3DAFQjCNE1GLTUbKZfMlEh9Aj5w0iswz6PYQ&related=codeorg&hashtags=). Share pictures of events or a video of you and other adults doing the Hour of Code. Use the hashtag **#HourOfCode** so Code.org (@code.org) can see it and promote the support. Or, use these sample tweets:
    
      * Every student, boy or girl, should have the chance to learn computer science. Join us in starting with one #HourOfCode <% if @country != 'us' %> [https://hourofcode.com/<%= @country %>](<%= resolve_url('/') %>) <% else %> [https://hourofcode.com](<%= resolve_url('/') %>) <% end %>
      * Today, we're proud to join the Hour of Code movement. Are you in? #HourOfCode <% if @country != 'us' %> [https://hourofcode.com/<%= @country %>](<%= resolve_url('/') %>) <% else %> [https://hourofcode.com](<%= resolve_url('/') %>) <% end %>   
          
        

  8. **Issue a press release.** [Use this sample](<%= resolve_url('/promote/official-press-release') %>) as a guide.

  9. **Connect locally.** Visit [<%= resolve_url('code.org/promote') %>](<%= resolve_url('https://code.org/promote') %>) to learn more about computer science education in your state. Sign the petition there and you’ll get updates from Code.org on their local, state and federal advocacy efforts.

<%= view :signup_button %>