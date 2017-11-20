---
title: #HourOfCode Challenge
theme: responsive
style_min: true
---

# Win a celebrity chat for your class!

### Create an app, game, or design with Code.org and tag #HourOfCode and one of our special guests for a chance to win a video chat for your classroom!

<%= view :three_circles, circles: [ {img: '/images/fit-300/steph-curry.png', text: '<a href="#lookingfor">Stephen Curry</a><br>Twitter: [@StephenCurry30](https://twitter.com/intent/tweet?screen_name=stephencurry30&hashtags=HourOfCode)<br>Facebook: <a href="https://www.facebook.com/StephenCurryOfficial/" target="_blank">@StephenCurryOfficial</a><br>Instagram: @stephencurry30'}, {img: '/images/fit-300/sheryl-sandberg2.png', text: '<a href="#lookingfor">Sheryl Sandberg</a><br>Facebook: @Sheryl<br>Instagram: @sherylsandberg'}, {img: '/images/fit-300/russell-wilson.png', text: '<a href="#lookingfor">Russell Wilson</a><br>Twitter: [ @DangeRussWilson](https://twitter.com/intent/tweet?screen_name=dangerusswilson&hashtags=HourOfCode)<br>Facebook: @DangerRussWilson<br>Instagram: @dangerusswilson'}] %>

<%
  facebook = {:u=>"http://#{request.host}/us"}

  twitter = {:related=>'dangerusswilson', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

<br>

<%= view :three_circles, circles: [ {img: '/images/fit-300/susan-wojcicki.png', text: '<a href="#lookingfor">Susan Wojcicki</a><br>Twitter: [@SusanWojcicki](https://twitter.com/intent/tweet?screen_name=susanwojcicki&hashtags=HourOfCode)'}, {img: '/images/fit-300/stacy-plays.png', text: '<a href="#lookingfor">StacyPlays</a><br>Twitter: [@stacysays](https://twitter.com/intent/tweet?screen_name=stacysays&hashtags=HourOfCode)<br>Facebook: @stacyhinojosa'}, {img: '/images/fit-300/hadi-partovi.png', text: '<a href="#lookingfor">Hadi Partovi</a><br>Twitter: [@hadip](https://twitter.com/intent/tweet?screen_name=hadip&hashtags=HourOfCode)<br>Facebook: @hadi<br>Instagram: @hadipartovi'}] %>




## Share your Hour of Code!
<img src="/images/hoc-challenge-tweets.png" style="max-width: 100%">

## Use any of these activities:

<a name="lookingfor"></a>
## What are they looking for?
**Stephen Curry**: I'm lucky to have gone to the NBA playoffs with the Golden State Warriors, but we would never have been there without teamwork. Show me what your team can create when you work together.   
<a href="https://twitter.com/intent/tweet?screen_name=StephenCurry30&ref_src=twsrc%5Etfw" class="twitter-mention-button" data-text="#HourOfCode" data-show-count="false">Tweet to @StephenCurry30</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

**Sheryl Sandberg**: Girls are still underrepresented in tech and computer science from high school all the way to the workforce. We can change this! I challenge girls to Lean In to computer science and create an app using App Lab!

**Russell Wilson**: Since I was in high school, I wanted to play professional football AND professional baseball. I love both games, but can you make one I'll love even more? I challenge you to create a game with Flappy Bird, Sports, Star Wars, or App Lab.

<a href="https://twitter.com/intent/tweet?screen_name=DangeRussWilson&ref_src=twsrc%5Etfw" class="twitter-mention-button" data-text="#HourOfCode" data-show-count="false">Tweet to @DangeRussWilson</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

**Susan Wojcicki**: At YouTube, we love good storytellers. Use App Lab to choose your own adventure, make a story in play lab, or post a video story about anything you created. And who knows? Maybe your creation will go viral!

<a href="https://twitter.com/intent/tweet?screen_name=SusanWojcicki&ref_src=twsrc%5Etfw" class="twitter-mention-button" data-text="#HourOfCode" data-show-count="false">Tweet to @SusanWojcicki</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

**StacyPlays (Stacy Hinojosa)**: Have you played the newest Minecraft activity, Hero's Journey? Did you know I helped develop it? I've been vlogging since 2013, so I know a lot about Minecraft. But there's always more for me to learn and I want to see what you can create in Minecraft when you play it.    

<a href="https://twitter.com/intent/tweet?screen_name=StacySays&ref_src=twsrc%5Etfw" class="twitter-mention-button" data-text="#HourOfCode" data-show-count="false">Tweet to @StacySays</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

**Hadi Partovi**: The team of software engineers at Code.org love to build apps, and they created our newest program, App Lab. I challenge you to join them as a software engineer this week and build something fun using JavaScript in App Lab. 

<a href="https://twitter.com/intent/tweet?screen_name=hadip&ref_src=twsrc%5Etfw" class="twitter-mention-button" data-text="#HourOfCode" data-show-count="false">Tweet to @Hadip</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<a name="contestrules"></a>

## How do I participate?
It's easy to get involved and win a classroom video chat with one of our special guests! 

Step one: Tweet or publicly post and tag one of our celebrities on Twitter, Facebook, or Instagram (including their @profile) and include the hashtag #HourOfCode.

That's it! This challenge is open to classrooms, after-school clubs, and individual students throughout Computer Science Education Week (Dec. 4-10). Submit as many times as you like - one celebrity tag per post.  

## Is there any way to increase my chances of winning?
The celebrities will work with Code.org to pick a winner. <a href="#lookingfor">Read about what each celebrity is looking for</a>, then, increase your chances to win with photos or videos of yourself or your class. They'd also love to see the apps, games, or artwork your students created, so add a link to your students' work! 

## How do you get the project link to share? 
When you finish one of our Hour of Code activities, on the last level you'll receive a share link. You can also take a video of you or your students demo-ing their app and share that.

<img src="/images/share-button.png" style="max-width: 50%">

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
