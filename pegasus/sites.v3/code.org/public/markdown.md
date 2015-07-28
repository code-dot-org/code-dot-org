---
chart: true
---

# Markdown (Title)

## Overview (Heading)

**Markdown** is what we use to edit the Code.org website. This page will explain some of the basics of Markdown so that anybody can edit web pages. (Body text) 


### Syntax (Subheading)

Markdown is very easy to use. Here are examples of basic syntax:

**Bold** text is created using either two asterisks (**) or two underscores (__) before and after the text you want to bold. You can also use the shortcut 'Ctrl+B'. 

Example: **The Hour of Code will be during the week of December 7-13, 2015.**

__Last year, 100 million students participated in the Hour of Code.__

*Italic* text is created using one asterisk (*) or one underscore (_) before and after the text you want to make italic. You can also use the shortcut 'Ctrl+I'. 

Example: *Code.org is now working with the College Board to introduce computer science courses at the high level.*

_Code.org and the College will identify and help schools adopt two specific computer science courses at the high school level._
<br />
<br />
### Links

Markdown makes it easy to link to other pages. Our developers make it especially easy to link to other Code.org pages. To link externally, just use square brackets [] to contain the text and round brackets () to contain the address. 

Example: [Here](https://www.youtube.com/watch?v=AI_dayIQWV4) is the video of President Obama doing the Hour of Code. 

To link internally to another Code.org webpage, you don't need to include the full link. Just put /webpage inside the round brackets.

Example: [Here](/promote) are statistics about computer science education today. [Here](/help) is how you can help us improve those stats. 

Linking to an email address is easy. Example: <support@code.org>.
<br/>
<br/>

### Buttons
In many Code.org pages, we like to include buttons to other pages. You can use these sample buttons here and just change the link to where you need to go. Just like with a normal link, if you are linking to other Code.org content, you don't need to include the entire URL, only what follows the forward slash after code.org. 

Example: 
<br /><br />
[<button>Link internally to another Code.org page</button>](/professional-development-workshops)
[<button>Link to an external page</button>](http://blogs.edweek.org/edweek/curriculum/2015/06/washington_passes_bill_to_boost_K12_computer_science_education.html)<br /><br/>

### Images

It's easy to include images from our **Images** folder in Dropbox. To change the size on the image, include "/fit-pixel width" after /images.

Example: <br/>
![Code.org Logo](/images//fit-600/infographics/diversity.png)

### Lists
You can create unordered lists in two ways, using either an asterisk (*) or a hyphen (-) followed by a space. Make sure to leave a row bewteen your headline and the list. 

Example: Code.org and the College Board will facilitate high schools offering the following courses:

* Exploring Computer Science
- AP Computer Science Principles

Ordered lists are created using "1." + space. 

Example: Top three numbers to know about computer science education.

1. In 25 of 50 states, computer science classes can't count toward math or science graduation requirements. 
2. In 2020, 1.4 million computer science jobs will be available. 
3. But only 400,000 computer science students will graduate that year. 

<br/>
### Tables

A table is created using vertical bars to separate columns. Use the vertical bar before the first column and after the last column. A simple table looks like this:

### 3rd Party Educator Resources: Elementary School

|Organization | Curriculum | Professional Development|
|------------ | ------------- | ------------|
|[Code Studio](/educate/k5) | 4 courses blend online tutorials with “unplugged” activities, FREE   | 1-day weekend workshops across the US, FREE|
|[Project Lead The Way](https://www.pltw.org/our-programs/pltw-launch) | 6 10-hour computer science modules, $750/school | Face-to-face and online, $700 for school-level lead teacher|
| [ScratchEd](http://scratched.gse.harvard.edu/guide) | A 6-unit intro to Scratch, FREE | In-person educator meet-ups and online MOOC, FREE |
| [Tynker](https://www.tynker.com/school/lesson-plan) | Free tools, tutorials, and a 6-hr introductory lesson plan. 200+ lessons with assessments: $399/class, $2,000/school | 2-day PD, $2000/day + travel |


<br/>

# Popup video player test

## video 1

In this technique, give us a thumbnail image and optional caption, and we'll make it clickable and add a play button.

(This example just has a video in the popup.)

### play_button: 'center'

<%= view :display_video_thumbnail, id: "video1", video_code: "h5_SsNSaJJI", caption: "Video 1", play_button: 'center' %>

### play_button: 'caption'

<%= view :display_video_thumbnail, id: "video1", video_code: "h5_SsNSaJJI", caption: "Video 1", play_button: 'caption' %>

### using a custom thumbnail image

<%= view :display_video_thumbnail, id: "video1", video_code: "h5_SsNSaJJI", image: '/images/test-video-sample.jpg' %>

## video 2

In this technique, set up something that's clickable, and then we'll take care of popping the video.

(This example has the video, a facebook share link, and a downloadable file link in the popup.)

<span onclick="return showVideo_video2()" style="cursor:pointer" class="video_caption_link">
  Video 2
</span>

<%= view :display_video_lightbox, id: "video2", video_code: "nKIu9yen5nc", facebook: {:u=>"http://#{request.site}/"}, download_filename: "download.mov" %>

# Chart embed test
# IMPORTANT: you need to add "chart: true" at the top of your markdown file for this to work

This is an embedded chart:

<%= view :display_chart, id: "chart1", type: "ColumnChart", query_url: "https://docs.google.com/spreadsheets/d/1PWmXjxuN2oC-baFAe4UjL_d0s1Fu-2Vb30k7ymCxRFM/gviz/tq?gid=0&range=A1:C4&headers=1", width: 800, height: 480 %>

Here is a second chart:

<%= view :display_chart, id: "chart2", type: "PieChart", query_url: "https://docs.google.com/spreadsheets/d/1PWmXjxuN2oC-baFAe4UjL_d0s1Fu-2Vb30k7ymCxRFM/gviz/tq?gid=0&range=A1:C4&headers=1", width: 800, height: 480 %>




## Need to do something more complex than what's featured on this page? 

As a general rule of thumb, find another Code.org page with an example of what you need to do. Then go find the Markdown file in Dropbox and see the code to do it. You can always ask another employee if you have any questions. Happy editing!





