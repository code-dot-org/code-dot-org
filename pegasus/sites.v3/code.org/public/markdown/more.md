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


## Social Media
***
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
