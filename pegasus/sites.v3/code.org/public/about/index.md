---
title: About Us
nav: about_nav
---

<%
  stats = PROPERTIES.get(:about_stats)
%>

# About Us

Launched in 2013, Code.org&reg; is a non-profit dedicated to expanding participation in computer science by making it available in more schools, and increasing participation by women and underrepresented students of color. Our vision is that every student in every school should have the opportunity to learn computer science. We believe computer science and computer programming should be part of the core curriculum in education, alongside other science, technology, engineering, and mathematics (STEM) courses, such as biology, physics, chemistry and algebra.

[col-50]

**Code.org's work covered by CBS This Morning:**

<embed src="http://www.cbsnews.com/common/video/cbsnews_player.swf" scale="noscale" salign="lt" type="application/x-shockwave-flash" background="#000000" width="375" height="246" allowFullScreen="true" allowScriptAccess="always" FlashVars="pType=embed&si=254&pid=cGUsG_QQ1U_t&url=http://www.cbsnews.com/videos/cracking-the-code-push-to-teach-computer-science-in-classrooms" />

[/col-50]

[col-50]

**President Obama does the Hour of Code:**

<iframe width="375" height="210" src="//www.youtube.com/embed/AI_dayIQWV4" frameborder="0" allowfullscreen></iframe>
Hour of Code has won the support of both [Republicans and Democrats](https://www.youtube.com/watch?v=Vgn_YbSmHnw), and [many celebrities](https://www.youtube.com/watch?v=h5_SsNSaJJI&list=PLzdnOPI1iJNciTeOk1ziB4pIpdPwevgv_)

<br/><br/>

[/col-50]

## Our goals and metrics

| Code.org Goal | Accomplishment |
|------|----------------|
| Inspire students | Tens of millions have tried the [Hour of Code](/learn). (<%= stats['number_served'] %> served. 48% female) |
| Create fantastic  courses | 99% of teachers recommend the Code.org [intro CS curriculum](http://studio.code.org) |
| Reach classrooms | Our [intro courses](http://studio.code.org) are taught by <%= stats['number_teachers'] %> teachers and reach <%= stats['number_students'] %> students |
| Improve diversity in CS | In our online courses, <%= stats['percent_female'] %>% of  students are girls and 37% are black or Hispanic. In our high school classrooms, [34% are girls, and 60% African American or Hispanic](http://codeorg.tumblr.com/post/98856300118/diversity) |
| Prep new CS teachers | We've prepared 5,000 new teachers across grades K-12. |
| Change school district curriculum | [60+ districts](/educate/partner-districts) are adding [CS classes](/educate/curriculum) with us, including all the largest 7 in the US|
| Set up policies to support CS | Policy changed in [16 states](/action) including CA, NY, FL, IL, OH.|
| Go global | Our courses are available in 30+ languages, used in all 180+ countries. |

<br/>
<br/>

<%= view :testimonials %>

<br/>
<br/>

## More information, history, and philosophy
Code.org launched in 2013 as a project of co-founders Ali and Hadi Partovi. Our initial work was a [video](https://www.youtube.com/watch?v=nKIu9yen5nc) that became #1 on YouTube for a day, and 15,000 schools reached out to us for help. Since then, we've expanded to build a full organization supporting a a worldwide movement. Our goal is for computer science to be a fixed part of school curriculum. 

To support our goal, we do work across the education spectrum: designing our own courses or partnering with others, training teachers, partnering with large school districts, helping change government policies, expanding internationally via partnerships, and marketing to break stereotypes. 

Our work builds upon [decades of effort, by countless organizations and individuals](https://docs.google.com/document/d/1rdEUqAkYtKPMD4UeEmpZCAau4_AdIOGbZDqLkePAQrY/pub) who have helped establish, fund, and spread computer science education. We're thankful to benefit from the tireless help of the broader computer science education community.

- [Code.org 2014 Annual Report](/about/2014)
- [Code.org overview brochure (PDF)](/files/Code.orgOverview.pdf)
- [TEDx talk by our founder Hadi Partovi about why computer science is for all (VIDEO)](https://www.youtube.com/watch?v=m-U9wzC9xLk)
- [A letter from our founder addressing misconceptions about our motivations](http://codeorg.tumblr.com/post/73963049605/the-secret-agenda-of-code-org)


We believe that a quality computer science education should be available to every child, not just a lucky few. All curriculum resources and tutorials we author are free to use under a [Creative Commons](http://creativecommons.org/licenses/by-nc-sa/4.0/) license, and our technology is developed as an [open source project](https://github.com/code-dot-org/code-dot-org).

<hr/>

## Donors
Code.org&reg; is a registered public 501c3 nonprofit, with support from the general public. We are grateful for the generous support we’ve received from [individuals and organizations](/about/donors) who support our vision.

Code’s accomplishments (above) demonstrate our ability to leverage those dollars into strong outcomes.  But given our nonprofit ambition that every child in every school should have access to computer science — to become literate citizens in today’s digital world and to test their interests in exploring CS further as a career — we have a long way to go to meet a fundraising goal that will support that vision.

[<button>Make a donation</button>](/donate)&nbsp;&nbsp;or [see our list of donors](/about/donors)

Please [contact us](/contact) if you, your company, or your foundation is interested in talking with our leadership team further to better understand our program and to explore options for investing in our work.

[Code.org's 2013 IRS Form 990](/files/irs-form.pdf)

<hr/>


## Follow us
Receive [quarterly updates from Code.org by email](http://eepurl.com/wL0XL), or follow Code.org on social media:

<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&appId=544354895612633&version=v2.0";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
<div class="fb-like" data-href="http://www.facebook.com/Code.org" data-layout="button_count" data-action="like" data-show-faces="true" data-share="false"></div>
<br/><br/>
<a href="https://twitter.com/codeorg" class="twitter-follow-button" data-show-count="false" data-size="large">Follow @codeorg</a>
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
<br/><br/>
<script src="//platform.linkedin.com/in.js" type="text/javascript">
  lang: en_US
</script>
<script type="IN/FollowCompany" data-id="3129360" data-counter="none"></script>
<br/>
<iframe  frameborder="0" border="0" scrolling="no" allowtransparency="true" height="25" width="116" src="http://platform.tumblr.com/v1/follow_button.html?button_type=2&tumblelog=codeorg&color_scheme=dark"></iframe>
<br/>
<script src="https://apis.google.com/js/platform.js" async defer></script>
<div class="g-follow" data-annotation="bubble" data-height="24" data-href="//plus.google.com/u/0/113408212816493509628" data-rel="publisher"></div>

<hr/>


## Advocacy

For federal and local advocacy, Code.org collaborates with our sister organization, [Computing in the Core](http://computinginthecore.org). 

Computing in the Core (CinC) is a non-partisan advocacy coalition of associations, corporations, scientific societies, and other non-profits that strive to elevate computer science education to a core academic subject in K-12 education. [Learn more about Computing in the Core](http://computinginthecore.org).


<hr/>


<a href="http://www.guidestar.org/organizations/46-0858543/code-org.aspx" target="_blank">
    <img src="http://widgets.guidestar.org/gximage2?o=9218725&l=v3" />
</a> [![image](/images/fit-100/privacy.jpg)](http://studentprivacypledge.org/)

