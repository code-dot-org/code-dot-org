---

title: <%= hoc_s(:title_how_to_officials) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

## Fortæl om Hour of Code til hele dit netværk.

### Få alle skoler til at deltage, alle elever skal lære!

  1. **Recruit local schools and districts.** Use [this email](<%= resolve_url('/resources#sample-emails') %>) or [this blurb](<%= resolve_url('/resources/stats') %>) as a starting point, and take a look at this [how-to](<%= resolve_url('/resources/how-to') %>) for schools and districts. Let them know **every** participating educator will receive a [thank you gift](<%= resolve_url('/resources/how-to') %>) and in **each state**, one participating school will win **$10,000 in technology**!

  2. **Host an Hour of Code event.** See our [event how-to guide](<%= resolve_url('/resources/how-to-event') %>) for a sample run of show, media outreach kit and other event-planning resources. At være vært for et event er en fantastisk måde at promovere Hour of Code og derved øge deltagelsen.

  3. **Attend an event during Computer Science Education Week (<%= campaign_date('short') %>).** [Find classrooms and schools](<%= resolve_url('/events') %>) participating in your district, city or state.

  4. **Issue a proclamation or resolution.** See this [sample resolution](<%= resolve_url('resources/proclamation') %>) supportive of Computer Science Education Week and its goals that could be used by state and local legislators.

  5. **Udkast til et læserbrev**. Overvej at komme med en udtalelse i din lokale avis. See this [sample op-ed](<%= resolve_url('/resources/op-ed') %>) supporting comupter supportive of Computer Science Education Week and its goals.

  6. **Del på de sociale medier.** Post på [Facebook](https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fhourofcode.com%2Fus) eller [Twitter](https://twitter.com/intent/tweet?url=http%3A%2F%2Fhourofcode.com&text=I%27m%20participating%20in%20this%20year%27s%20%23HourOfCode%2C%20are%20you%3F%20%40codeorg&original_referer=https%3A%2F%2Fwww.google.com%2Furl%3Fq%3Dhttps%253A%252F%252Ftwitter.com%252Fshare%253Fhashtags%253D%2526amp%253Brelated%253Dcodeorg%2526amp%253Btext%253DI%252527m%252Bparticipating%252Bin%252Bthis%252Byear%252527s%252B%252523HourOfCode%25252C%252Bare%252Byou%25253F%252B%252540codeorg%2526amp%253Burl%253Dhttp%25253A%25252F%25252Fhourofcode.com%26sa%3DD%26sntz%3D1%26usg%3DAFQjCNE1GLTUbKZfMlEh9Aj5w0iswz6PYQ&related=codeorg&hashtags=). Dele billeder af begivenheder eller en video af dig og andre voksne som arbejder med Hour of Code. Bruge hashtag **#HourOfCode**, så Code.org (@code.org) kan se det og fremme støtte. Eller bruge disse prøve tweets:
    
      * Every student, boy or girl, should have the chance to learn computer science. Join us in starting with one #HourOfCode <% if @country != 'us' %> [https://hourofcode.com/<%= @country %>](<%= resolve_url('/') %>) <% else %> [https://hourofcode.com](<%= resolve_url('/') %>) <% end %>
      * Today, we're proud to join the Hour of Code movement. Are you in? #HourOfCode <% if @country != 'us' %> [https://hourofcode.com/<%= @country %>](<%= resolve_url('/') %>) <% else %> [https://hourofcode.com](<%= resolve_url('/') %>) <% end %>   
          
        

  7. **Issue a press release.** [Use this sample](<%= resolve_url('/resources/official-press-release') %>) as a guide.

  8. **Connect locally.** Visit [<%= resolve_url('code.org/promote') %>](<%= resolve_url('https://code.org/promote') %>) to learn more about computer science education in your state. Tilmeld dig der og du får opdateringer fra Code.org på deres lokale og statslige indsats.

<%= view :signup_button %>