---
title: About Us
nav: about_nav
video_player: true
---

<%
  stats = Properties.get_user_metrics
%>

# About Us

<div style="float: left; width: 280px;">

<% facebook = {:u=>'https://youtu.be/mTGSiB4kB18'} %>
<% twitter = {:url=>'https://youtu.be/mTGSiB4kB18', :related=>'codeorg', :text=>'Meet the team at @codeorg and see how much they’ve done in just a few years!'} %>

<%=view :display_video_thumbnail, id: "codeorg_recruiting", video_code: "mTGSiB4kB18", play_button: 'center', facebook: facebook, twitter: twitter, letterbox: "false", download_path: "http://videos.code.org/social/about-codeorg.mp4" %>

</div>

<div style="margin-left: 300px;">

Code.org&reg; is a non-profit dedicated to expanding access to computer science, and increasing participation by women and underrepresented minorities. Our vision is that every student in every school should have the opportunity to learn computer science, just like biology, chemistry or algebra. Code.org organizes the annual <a href="http://hourofcode.com"> Hour of Code</a> campaign which has engaged 10% of all students in the world, and provides the leading curriculum for K-12 computer science in the largest school districts in the United States. Code.org is supported by generous donors including Microsoft, Facebook, the Infosys Foundation, Google, Omidyar Network, and <a href="/about/donors">many more</a>.


</div>

<div style="clear: both;"></div>

## Diversity of students in our courses
![image](/images/infographics/fit-800/diversity-courses.png)

Code.org increases diversity in computer science by reaching students of all backgrounds where they are — at their skill-level, in their schools, and in ways that inspire them to keep learning. Read  about [our efforts to increase diversity in computer science](/diversity).

<br />

## Code.org in the News
See all past [news and announcements](/about/news).

<div style="float: left; width: 50%; padding-right: 10px;">

<%=view :display_video_thumbnail, id: "Nasdaq", video_code: "zxcBZg7jYlc", caption: "Nasdaq interviews Code.org founder Hadi Partovi", play_button: "center", letterbox: "false" %>

</div>

<div style="float: left; width: 50%; padding-left: 10px;">

<%=view :display_video_thumbnail, id: "codeorg_cbs", video_code: "sUXfjzzHO5g", caption: "Code.org's work covered by CBS This Morning", play_button: "center", letterbox: "false" %>

</div>

<div style="clear: both;"></div>

## Our goals and metrics

| Code.org Goal | Accomplishment |
|------|----------------|
| Improve diversity in CS | In our online courses, 45% of students are girls and 48% are underrepresented minorities. In our high school classrooms, 37% are girls, and 56% African American or Hispanic. |
| Inspire students | Tens of millions have tried the [Hour of Code](/learn). (<%= format_integer_with_commas(fetch_hoc_metrics['started']) %> served. 49% female) |
| Create fantastic  courses | 99% of surveyed teachers recommend the Code.org [intro CS curriculum](http://studio.code.org). |
| Reach classrooms | <%= format_integer_with_commas(stats['number_teachers']) %> teachers have signed up to teach our intro courses on [Code Studio](http://studio.code.org) and <%= format_integer_with_commas(stats['number_students']) %> students are enrolled. |
| Prep new CS teachers | We've prepared 51,100 new teachers to teach CS across grades K-12. Learn about our [professional learning programs](/educate). |
| Change school district curriculum | We've partnered with [120 of the largest school districts](/educate/partner-districts) to [add CS to the curriculum](/educate/curriculum). These districts teach almost 10% of all U.S. students and 15% of Hispanic and African American students. Learn about [becoming a regional partner](/educate/districts).|
| Set up policies to support CS | Policy changed in [20 states](/action) including CA, NY, FL, IL, OH.|
| Go global | Our courses are available in 45+ languages, used in all 180+ countries. |
<center><font size="1">Source: Code Studio Activity and <a href="https://docs.google.com/document/d/1gySkItxiJn_vwb8HIIKNXqen184mRtzDX12cux0ZgZk/pub">surveys of participating educators</a></font></center>
<br/>
<br/>

<!-- Teachers Trained: 2679 + K-5 -->

<%= view :testimonials %>

<br/>
<br/>

## More information, history, and philosophy
In 2013, Code.org was launched by twin brothers Hadi and Ali Partovi with a [video](https://www.youtube.com/watch?v=nKIu9yen5nc) promoting computer science. This video became #1 on YouTube for a day, and 15,000 schools reached out to us for help. Since then, we've expanded from a bootstrapped staff of volunteers to build a full organization supporting a worldwide movement. We believe that a quality computer science education should be available to every child, not just a lucky few.

To support our goal, we do work across the education spectrum: designing our own courses or partnering with others, training teachers, partnering with large school districts, helping change government policies, expanding internationally via partnerships, and marketing to break stereotypes.

Our work builds upon [decades of effort, by countless organizations and individuals](https://docs.google.com/document/d/1rdEUqAkYtKPMD4UeEmpZCAau4_AdIOGbZDqLkePAQrY/pub) who have helped establish, fund, and spread computer science education. We're thankful to benefit from the tireless help of the broader computer science education community.

- [Code.org 2015 Annual Report](/about/2015)
- [TEDx talk by our founder Hadi Partovi about why computer science is for all (VIDEO)](https://www.youtube.com/watch?v=m-U9wzC9xLk)
- [A letter from our founder addressing misconceptions about our motivations](http://codeorg.tumblr.com/post/73963049605/the-secret-agenda-of-code-org)

All curriculum resources and tutorials we author will forever be free to use and openly licensed under a [Creative Commons](http://creativecommons.org/licenses/by-nc-sa/4.0/) license, allowing others to make derivative education resources for noncommercial purposes. If you are interested in licensing our materials for commercial purposes, [contact us](/contact). Our courses are translated for worldwide use or by English language learners. Our technology is developed as an [open source project](https://github.com/code-dot-org/code-dot-org).

<hr/>

## Donors
Code.org&reg; is a registered public 501c3 nonprofit, with support from the general public. We are grateful for the generous support we’ve received from [individuals and organizations](/about/donors) who support our vision.

Code’s accomplishments (above) demonstrate our ability to leverage those dollars into strong outcomes.  But given our nonprofit ambition that every child in every school should have access to computer science — to become literate citizens in today’s digital world and to test their interests in exploring CS further as a career — we have a long way to go to meet a fundraising goal that will support that vision.

[<button>Make a donation</button>](/donate)&nbsp;&nbsp;or [see our list of donors](/about/donors)

Please [contact us](/contact) if you, your company, or your foundation is interested in talking with our leadership team further to better understand our program and to explore options for investing in our work.

[Code.org's 2014 IRS Form 990](/files/irs-form.pdf)
<br/>
[Code.org's 2015 IRS Form 990](/files/irs-form-2015.pdf)

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
<iframe  frameborder="0" border="0" scrolling="no" allowtransparency="true" height="25" width="116" src="https://platform.tumblr.com/v1/follow_button.html?button_type=2&tumblelog=codeorg&color_scheme=dark"></iframe>
<br/>
<script src="https://apis.google.com/js/platform.js" async defer></script>
<div class="g-follow" data-annotation="bubble" data-height="24" data-href="//plus.google.com/u/0/113408212816493509628" data-rel="publisher"></div>

<hr/>


<a href="http://www.guidestar.org/organizations/46-0858543/code-org.aspx" target="_blank">
    <img src="https://widgets.guidestar.org/gximage2?o=9218725&l=v3" />
</a> [![image](/images/fit-150/student_privacy_pledge.png)](http://studentprivacypledge.org/)

