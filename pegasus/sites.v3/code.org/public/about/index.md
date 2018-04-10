---
title: About Us
nav: about_nav
video_player: true
theme: responsive
style_min: true
---

<%
  stats = Properties.get_user_metrics
%>

# About Us

<div style="float: left; width: 280px; margin-right: 5%;">

<% facebook = {:u=>'https://youtu.be/mTGSiB4kB18'} %>
<% twitter = {:url=>'https://youtu.be/mTGSiB4kB18', :related=>'codeorg', :text=>"Meet the team at @codeorg and see how much they’ve done! (Thanks #{get_random_donor_twitter} for supporting @codeorg)"} %>

<%=view :display_video_thumbnail, id: "codeorg_recruiting", video_code: "mTGSiB4kB18", play_button: 'center', facebook: facebook, twitter: twitter, letterbox: "false", download_path: "http://videos.code.org/social/about-codeorg.mp4" %>

</div>

<div class="col-50">

Code.org&reg; is a nonprofit dedicated to expanding access to computer science in schools and increasing participation by women and underrepresented minorities. Our vision is that every student in every school has the opportunity to learn computer science, just like biology, chemistry or algebra. Code.org provides the leading curriculum for K-12 computer science in the largest school districts in the United States and Code.org also organizes the annual <a href="http://hourofcode.com"> Hour of Code</a> campaign which has engaged 10% of all students in the world. Code.org is supported by generous donors including Amazon, Facebook, Google, the Infosys Foundation, Microsoft, and <a href="/about/donors">many more</a>.


</div>

<div style="clear: both;"></div>

## The majority of our students are girls or underrepresented minorities</h2>

<img src="/images/infographics/fit-800/diversity-courses-updated-05-23.png" class ="col-95">

Code.org increases diversity in computer science by reaching students of all backgrounds where they are — at their skill-level, in their schools, and in ways that inspire them to keep learning. 

For the second year in a row, underrepresented minorities make up 48% of students in our courses. Increasing diversity in computer science is foundational to our work, and <a href="/diversity">we encourage you to read more about our efforts</a>. 

<br />


## Code.org in the News
See all past [news and announcements](/about/news).

<div class=col-45 style="float: left; margin: 1%">

<%=view :display_video_thumbnail, id: "Nasdaq", video_code: "zxcBZg7jYlc", caption: "Nasdaq interviews Code.org founder Hadi Partovi", play_button: "center", letterbox: "false" %>

</div>

<div class=col-45 style="float: left; margin: 1%">

<%=view :display_video_thumbnail, id: "codeorg_cbs", video_code: "sUXfjzzHO5g", caption: "Code.org's work covered by CBS This Morning", play_button: "center", letterbox: "false" %>

</div>

<div style="clear: both;"></div>

## Our goals and metrics

| Code.org Goal | Accomplishment                                                                                                                                                                                                                                                                                                    |
|------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Improve diversity in CS | 45% of Code.org students are girls, 48% are underrepresented minorities, and 49% of US students are on free and reduced meals. Read more about [our approach to diversity](/diversity).                                                                                                                           |
| Inspire students | Tens of millions have tried the [Hour of Code](/learn). (<%= format_integer_with_commas(fetch_hoc_metrics['started']) %> served. 49% female)                                                                                                                                                                      |
| Create fantastic  courses | 99% of surveyed teachers recommend the Code.org [intro CS curriculum](http://studio.code.org).                                                                                                                                                                                                                    |
| Reach classrooms | <%= format_integer_with_commas(stats['number_teachers']) %> teachers have signed up to teach our intro courses on [Code Studio](http://studio.code.org) and <%= format_integer_with_commas(stats['number_students']) %> students are enrolled.                                                                    |
| Prep new CS teachers | We've prepared 72,000 new teachers to teach CS across grades K-12. Learn about our [professional learning programs](/educate).                                                                                                                                                                                    |
| Change school district curriculum | We've partnered with [180 of the largest school districts](/educate/partner-districts) to [add CS to the curriculum](/educate/curriculum). These districts teach almost 10% of all U.S. students and 15% of Hispanic and African American students. Learn about [becoming a regional partner](/educate/districts).|
| Set up policies to support CS | Policies changed in over 40 U.S. states to establish CS education standards, make CS courses count towards high school graduation, etc (see [details](https://docs.google.com/document/d/1J3TbEQt3SmIWuha7ooBPvlWpiK-pNVIV5uuQEzNzdkE/edit))                                                                      |
| Go global | Our courses are available in over 50 languages, used in 180+ countries.                                                                                                                                                                                                                                           |
<center><font size="1">Source: Code Studio Activity and <a href="https://docs.google.com/document/d/1gySkItxiJn_vwb8HIIKNXqen184mRtzDX12cux0ZgZk/pub">surveys of participating educators</a></font></center>

<!-- Teachers Trained: 2679 + K-5 -->

<%= view :testimonials %>

## More information, history, and philosophy
In 2013, Code.org was launched by twin brothers [Hadi](/about/leadership/hadi_partovi) and [Ali Partovi](https://www.crunchbase.com/person/ali-partovi#/entity) with a [video](https://www.youtube.com/watch?v=nKIu9yen5nc) promoting computer science. This video became #1 on YouTube for a day, and 15,000 schools reached out to us for help. Since then, we've expanded from a bootstrapped staff of volunteers to build a full organization supporting a worldwide movement. We believe that a quality computer science education should be available to every child, not just a lucky few.

To support our goal, we do work across the education spectrum: designing our own courses or partnering with others, training teachers, partnering with large school districts, helping change government policies, expanding internationally via partnerships, and marketing to break stereotypes.

Our work builds upon [decades of effort, by countless organizations and individuals](https://docs.google.com/document/d/1rdEUqAkYtKPMD4UeEmpZCAau4_AdIOGbZDqLkePAQrY/pub) who have helped establish, fund, and spread computer science education. We're thankful to benefit from the tireless help of the broader computer science education community, and [we thank all the partners and individuals who have supported our impact over the years](https://medium.com/@codeorg/dedicating-our-5-year-anniversary-to-our-partners-b57368a92924).

- [Code.org 2017 Annual Report](/about/2017) (Past reports: [2016](/about/2016), [2015](/about/2015), [2014](/about/2014))
- [Our core values and messaging guidelines](/about/values)
- [Our curriculum and pedagogy philosophy](/educate/curriculum/values)
- [TEDx talk by our founder Hadi Partovi about why computer science is for all (VIDEO)](https://www.youtube.com/watch?v=m-U9wzC9xLk)

## Our commitment to free curriculum and open source technology
All curriculum resources and tutorials we author will forever be free to use and openly licensed under a [Creative Commons](http://creativecommons.org/licenses/by-nc-sa/4.0/) license, allowing others to make derivative education resources for non-commercial purposes. If you are interested in licensing our materials for commercial purposes, [contact us](/contact). Our courses are translated for worldwide use or by speakers of different languages. Our technology is developed as an [open source project](https://github.com/code-dot-org/code-dot-org).

<hr/>

## Code.org Advocacy Coalition
The [Code.org Advocacy Coalition](/advocacy) is a bipartisan coalition of corporations and nonprofits that work together to help establish federal and state policies to expand and sustain access to K-12 computer science and to broaden participation and diversity in the field.

<hr/>


## K-12 Computer Science Framework
Code.org is a member of the steering committee that helped establish the [K-12 Computer Science Framework](http://k12cs.org) - a high-level guide for states, districts, and organizations implementing computer science education. The Framework has won the support of hundreds of academics, K-12 educators, software companies, nonprofits, and states.

<hr/>

## Code.org Donors
Code.org&reg; is a registered public 501c3 nonprofit, with support from the general public. We are grateful for the generous support we’ve received from [individuals and organizations](/about/donors) who support our vision.

Code’s accomplishments (above) demonstrate our ability to leverage those dollars into strong outcomes.  But given our nonprofit ambition that every child in every school should have access to computer science — to become literate citizens in today’s digital world and to test their interests in exploring CS further as a career — we have a long way to go to meet a fundraising goal that will support that vision.

[<button>Make a donation</button>](/donate)&nbsp;&nbsp;or [see our list of donors](/about/donors)

Please [contact us](/contact) if you, your company, or your foundation is interested in talking with our leadership team further to better understand our program and to explore options for investing in our work.

Code.org IRS form 990 for [2014](/files/irs-form.pdf), [2015](/files/irs-form-2015.pdf), and [2016](/files/irs-form-2016.pdf).

<hr/>


## Follow us
[Sign up to receive status updates](http://go.pardot.com/l/153401/2018-01-12/k555vp) about progress in the K-12 computer science movement and about the work of Code.org. Or follow Code.org on social media:

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
<!--  FOLLOW BUTTONS FOR GOOGLE PLUS OR TUMBLR ETC
<script type="IN/FollowCompany" data-id="3129360" data-counter="none"></script>
<br/>
<iframe  frameborder="0" border="0" scrolling="no" allowtransparency="true" height="25" width="116" src="https://platform.tumblr.com/v1/follow_button.html?button_type=2&tumblelog=codeorg&color_scheme=dark"></iframe>
<br/>
<script src="https://apis.google.com/js/platform.js" async defer></script>
<div class="g-follow" data-annotation="bubble" data-height="24" data-href="//plus.google.com/u/0/113408212816493509628" data-rel="publisher"></div>
-->

<hr/>


<a href="http://www.guidestar.org/organizations/46-0858543/code-org.aspx" target="_blank">
    <img src="https://widgets.guidestar.org/gximage2?o=9218725&l=v3" />
</a> [![image](/images/fit-150/student_privacy_pledge.png)](http://studentprivacypledge.org/)
