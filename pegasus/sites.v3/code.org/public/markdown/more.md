---
title: More markdown
nav: markdown_nav
theme: responsive
---

# More markdown elements

## Horizontal rule
***
Use three asterisks to create a horizontal rule or horizontal line across the page.

## Solid purple headers
***
These purple headers can be used for especially long pages when you need even more noticeable headers. See them in use on [code.org/widgets](/widgets). There are two styles available, one with a title only and one with both a title and subtitle.

<%=view :solid_block_header, :title=>"Computer Science Fundamentals" %>

<%=view :solid_block_header, :title=>"Computer Science Fundamentals", :subtitle=>"An introduction to computer science for all ages" %>

<br>
## Testimonials
***

<%= view :three_circles, circles: [
{img: '/images/2015AR/fit-150/circles1.jpg', text: '"Our students asked to have an hour every week." &mdash; Corinthia Azaniah Carter, Brooklyn, NY'},
{img: '/images/2015AR/fit-150/circles3.jpg', text: '"I feel that I\'m a part of spreading something big. This is going to make the future." &mdash; Nicholas Gallimore'},
{img: '/images/2015AR/fit-150/circles2.jpg', text: '"The best 3 days of my 30 year teaching career." &mdash; Sandra Taylor'}] %>

## Breakout or blockquote
***

[breakoutquote]

[col-33]

<img src="/images/AR2016/best.jpg" style="max-width: 80%"/>

[/col-33]

[col-66]

“I've never seen a nonprofit have an impact as large as this, in a timeframe as short as this. Just incredible.”

*Charles Best, Founder & CEO, DonorsChoose.org*

[/col-66]

[clearboth]

[/clearboth]
   
[/breakoutquote]

## Side callout with colored block
***

<link href="/css/educate.css" rel="stylesheet">

<div class="col-60", style="padding-right:20px;">

Lorem ipsum dolor sit amet, at ius malis adversarium. In mel constituto expetendis elaboraret, tale disputationi pri no. Ne adhuc praesent nam. Mel at clita eloquentiam, sea sumo nemore facete ea, no aliquid aliquam est. Eos te virtute necessitatibus, te eos paulo audire. Pro in diam homero, rationibus cotidieque ne usu, esse dicta necessitatibus eum eu.

<br>
<br>
His probo dolor ei, diam abhorreant ne mei. Quo ad alia eruditi, illud corpora consectetuer ut ius. Ea simul detracto nominati eum. Ex sed offendit democritum, eu ornatus fabellas nam, dolore moderatius vis ut. Nam ea quot explicari, graece viderer ponderum nam ei.

</div>

[col-40]

<div class="educate-callout-box">
  Looking to implement CS Fundamentals? Read this case study on how Dallas ISD brought computer science fundamentals to all schools in their district
  <br>
  <br>
  <a href="/educate"><button class="educate-button" style="position: relative">Learn more</button></a>
</div>

[/col-40]

<div style="clear:both"></div>

<br>
Cum liber eirmod fastidii an. Ea duo stet convenire scripserit, augue decore in sed. Vel inani utroque elaboraret ut, sit ei eius simul scaevola. Idque elitr interpretaris ut eum, numquam scaevola eu has, enim dicit per ad.

Nec diceret legendos ex. An nostrud corpora perfecto vel, an sumo dictas luptatum mel. Delenit minimum ei duo, feugait qualisque deterruisset ei nam, cum ad nibh falli admodum. Brute petentium eos cu, cu mea viderer dignissim. Te fugit inimicus usu. An nec congue putant epicurei, his ad blandit detracto intellegat, natum platonem oportere te duo.

Cu vis minim imperdiet. Vel cu phaedrum adolescens, vim te assentior delicatissimi, te eloquentiam voluptatibus necessitatibus est. Per te putent animal audire, liber accusam at vix. Novum nemore urbanitas eam in. Ut vim nullam aliquid temporibus, pro id unum velit omnes. Ea inermis voluptaria vix, et nonumes detraxit eam, cetero inimicus nam et.


## Social Media
***

### How to point to Code.org's social media sites
Do not use any social media components that are hosted on third-party sites. Third-party content can use cookies to track users, violating our privacy policy. Instead, use an image file that we host. This image may still link to the third-party site when clicked.

<%= view :social_media, facebook: "Code.org", twitter: "codeorg", tumblr: "http://teacherblog.code.org", instagram: "codeorg" %>

### How to share your page on social media

You can use our buttons to share your page on Facebook or Twitter. Below is an example of the buttons to share the Access Report. Simply replace the URL with your page's URL and update the placeholder text for the tweet.

<% facebook = {:u=>'https://code.org/yourschool'} %>
<% twitter = {:url=>'https://code.org/yourschool', :related=>'codeorg', :text=>'Does your school teach computer science? Expand computer science at your school or district. @codeorg'} %>
<%= view :share_buttons, facebook:facebook, twitter:twitter %>

### What your page looks like when shared on social media
You can customize how your page appears on social media channels by adding social media tags to your page metadata (at the top of the page). Use og tags for Facebook’s Open Graph protocol and twitter tags for Twitter. Include twitter and og tags with an image, url, description, etc. so that when your page is shared on social media they appear with specific text you provide instead of the social media channel scanning and selecting it's own content.

<br>

1. Choose a short and direct title and description
1. Choose an appropriate, hi-res image and upload to Dropbox at code.org/images/social-media.
  * Recommended upload size of 1,200 x 630 pixels
  * Rectangular Photo: Minimum 470 x 246 pixels in feed
  * Rectangular Photo: Minimum 484 x 252 on page
  * Keep it around a 1.91 width:height ratio
1. Add the following metadata to the top of your page updating the url, image path, title, and description.

	```
	---
	title: Code.org Professional Learning Partner Program
	social:
	 "twitter:card": photo
	 "twitter:site": "@codeorg"
	 "twitter:url": "https://code.org/educate/professional-learning-partner"
	 "twitter:image:src" : "https://code.org/images/social-media/your-image.jpg"
	 "twitter:title": "Code.org Professional Learning Partner Program"
	 "twitter:description": "Nonprofits, school districts, and universities are invited to apply to the Code.org Professional Learning Partner Program."
	 "og:title": "Code.org Professional Learning Partner Program"
	 "og:description": "Nonprofits, school districts, and universities are invited to apply to the Code.org Professional Learning Partner Program to help teach computer science in a local, sustainable fashion."
	 "og:image" : "https://code.org/images/social-media/your-image.jpg"
	 "og:image:width": "1200"
	 "og:image:height": "630"
	---
	```
1. Once your change is on staging, check how it appears on Facebook. First, [go to this tool](https://developers.facebook.com/tools/debug).
1. Enter in your page's staging url and click Debug. Then click "Fetch new scrape information." This will tell Facebook to check again for your update metadata.
1. Test from your own Facebook page. Draft a new post and paste in the full url of the page like `https://code.org/educate/professional-learning-partner` to see a preview of what the new share dialog looks like. 

<br>
