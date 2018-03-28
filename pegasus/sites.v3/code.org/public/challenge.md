---
<%
  share_image = (DCDO.get('hoc_mode', CDO.default_hoc_mode) == 'soon-hoc') ? 'hoc-student-challenge.jpg' : 'celeb-challenge.jpg'
%>
title: #HourOfCode Challenge
theme: responsive
style_min: true
social:
  "og:title": "Celebrity Challenge"
  "og:description": "Win a celebrity video chat for your class!"
  "og:image" : "<%= 'https://' + request.host + '/images/fit-1920/social-media/' + share_image %>"
  "og:image:width": '1920'
  "og:image:height": '1080'
  "twitter:card": "photo"
  "twitter:site": "@codeorg"
  "twitter:url": "https://code.org/challenge"
  "twitter:title": "Celebrity Challenge"
  "twitter:description": "Win a celebrity video chat for your class!"
  "twitter:image:src" : "<%= 'https://' + request.host + '/images/fit-1920/social-media/' + share_image %>"
---

# Win a celebrity chat for your class!

### Update: the challenge is now closed - thanks to all who participated!

### Create an app, game, or design with Code.org and tag #HourOfCode and one of our special guests for a chance to win a video chat for your classroom!

<a href="#stephen"><img src="/images/fit-195/steph-challenge.png"></a><a href="#stacy"><img src="/images/fit-195/stacy-challenge.png"></a><a href="#hadi"><img src="/images/fit-195/hadi-challenge.png"></a><a href="#sheryl"><img src="/images/fit-195/sheryl-challenge.png"></a><a href="#russell"><img src="/images/fit-195/russell-challenge.png"></a><a href="#susan"><img src="/images/fit-195/susan-challenge.png"></a>

## How to enter
<a href="#howtowin"><img src="/images/fit-970/hoc-challenge-tweets2.png" style="max-width: 100%"></a>

## Use one of these activities

<%= view :top_hoc_tutorials %>

<div id="hoc-tiles-container"></div>

<script>
  $("#hoc-tiles-container").load("/dashboardapi/hoc_courses_challenge");
</script>

<link rel="stylesheet" type="text/css" href="/shared/css/course-blocks.css"></link>
<link rel="stylesheet" type="text/css" href="/css/tools.css"></link>


## What are they looking for?
<a name="lookingfor"></a>
<a name="stephen"></a>
### Stephen Curry
I'm lucky to have gone to the NBA playoffs with the Golden State Warriors, but we would never have been there without teamwork. Show me what your team can create when you work together.

*To tag Stephen, use @StephenCurry30 on [Twitter](https://twitter.com/StephenCurry30), @StephenCurryOfficial on [Facebook](https://www.facebook.com/StephenCurryOfficial/), or @stephencurry30 on [Instagram](https://www.instagram.com/stephencurry30/).*

<a name="stacy"></a>
### Stacy Hinojosa (StacyPlays)
Have you played the newest Minecraft activity, Hero's Journey? Did you know I helped develop it? I've been vlogging since 2013, so I know a lot about Minecraft. But there's always more for me to learn and I want to see what you can create in [Minecraft](https://code.org/minecraft) when you play it.

*To tag Stacy, use @stacysays on [Twitter](https://twitter.com/stacysays) or @stacyhinojosa on [Facebook](https://www.facebook.com/stacyhinojosa/).*

<a name="hadi"></a>
### Hadi Partovi
The team of software engineers at Code.org love to build apps, and they created our newest program, App Lab. I challenge you to join them as a software engineer this week and build something fun using JavaScript in [App Lab](https://code.org/educate/applab).

*To tag Hadi, use @hadip on [Twitter](https://twitter.com/hadip), @HadiPartovi on [Facebook](https://www.facebook.com/hadi/), or @hadipartovi on [Instagram](https://www.instagram.com/hadipartovi/).*

<a name="sheryl"></a>
### Sheryl Sandberg
Girls are still underrepresented in tech and computer science from high school all the way through the workforce. We can change this! I encourage girls to start learning computer science and create an app using [App Lab](https://code.org/educate/applab)!

*To tag Sheryl, use @SherylSandberg on [Facebook](https://www.facebook.com/sheryl/).*

<a name="russell"></a>
### Russell Wilson
Since I was in high school, I wanted to play professional football AND professional baseball. I love both games, but can you make one I'll love even more? I challenge you to create a game with [Flappy Bird](https://studio.code.org/flappy/1), [Sports](https://code.org/athletes), [Star Wars](https://code.org/starwars), or [App Lab](https://code.org/educate/applab).

*To tag Russell, use @DangeRussWilson on [Twitter](https://twitter.com/DangeRussWilson), @DangerRussWilson on [Facebook](https://www.facebook.com/DangerRussWilson/), or @dangerusswilson on [Instagram](https://www.instagram.com/dangerusswilson/).*

<a name="susan"></a>
### Susan Wojcicki
At YouTube, we love good storytellers. Use [App Lab](https://code.org/educate/applab) to choose your own adventure, make a story in [Play Lab](https://code.org/playlab), or post a video story about anything you created. And who knows? Maybe your creation will go viral!

*To tag Susan, use @SusanWojcicki on [Twitter](https://twitter.com/SusanWojcicki).*

<a name="contestrules"></a>

## How do I participate?
If you haven't already, [sign up to participate in the Hour of Code](https://hourofcode.com/#join) this year.

After (or during) your Hour of Code, post and tag one of our celebrities on Twitter, Facebook, or Instagram, including their **@profile** and the hashtag **#HourOfCode**.

This challenge is open to classrooms, after-school clubs, and individual students, starting today until the end of the day Friday, December 15th.

You can submit and post as many times as you like - but tag only one celebrity per post.

<a name="howtowin"></a>
## How do I increase my chances of winning?
The celebrities will work with Code.org to pick a winner. <a href="#lookingfor">Read about what each celebrity is looking for</a>, then, increase your chances to win with photos or videos of yourself or your class. They'd also love to see the apps, games, or artwork your students created, so add a link to your students' work!

The posts that have the most cool stuff will have a great chance of being selected, so include a link to the coolest code creations you made on Code.org, an ANIGIF of the app you made, or a fun video explaining your Hour of Code activity. Get creative!

Posts with more likes, shares, and retweets will also have a higher likelihood of winning. Add an [Hour of Code frame](www.facebook.com/fbcameraeffects/tryit/1761789857455398/) to your Facebook profile picture to really get into the spirit.

And since you can post as many entries as you want, across Facebook, Twitter, and Instagram, feel free to make multiple posts to increase your chances. The idea isn't to spam the internet and annoy your friends, it's to celebrate computer science. So please try to make the content you post worthwhile for all of us.

## How do you get the project link to share?
When you're done with one of our Hour of Code activities, click "Finish" on the last level you'll receive a share link. You can also take a video of you or your students demo-ing their app and share that.

[col-50]

<img src="/images/fill-420x345/share-button.png">

[/col-50]

[col-50]

<%=view :display_video_thumbnail, id: "intro_csp", video_code: "mUl9Xn8efSE", play_button: 'center', letterbox: 'false' %>

[/col-50]

<div style="clear: both"></div>

## How will the chat work if we win?
We'll work with you to set up a time when the celebrity can call into your class for 10-15 minute video chat. Your students will be able to ask questions live.

## Examples of student creations
[col-33]

<center><img src="/images/animated-examples/artist-game-space.gif" width="90%"></center>

<div style="margin-top: 5px;">In this puzzle, the student created a honeycomb pattern.</div>

[/col-33]

[col-33]

<center><img src="/images/animated-examples/play-lab-game-space.gif" width="90%"></center>

<div style="margin-left: 15px; margin-top: 5px;">This student created a game with multiple levels in which you play against different characters. Game on!</div>

[/col-33]

[col-33]

<center><img src="/images/animated-examples/flappy-game-space.gif" width="90%"></center>

<div style="margin-left: 15px; margin-top: 5px;">This student created a Flappy Bird game.</div>

[/col-33]

<p style="clear:both"> </p>


<div style="clear: both;"></div>
