---
title: Professional Learning
theme: responsive
video_player: true
---
<link href="/shared/css/course-blocks.css", type="text/css", rel="stylesheet"></link>

<style>
  details summary {
    cursor: pointer;
  }
</style>

# Professional Learning#

<%= view :course_wide_block, cta_link: CDO.studio_url('/professional-development-workshops'), img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), cta_text: 'Find a local K-5 workshop', title: 'Elementary School', description: '<ul><li>No previous experience needed - just bring your curiosity! </li><li> One-day, no cost workshops designed for elementary classroom teachers, librarians, and tech-ed specialists.</li><li>Experience our pedagogical approach to teaching CS, design your own implementation plan, and collaborate with local educators. Plus, you get classroom supplies and some pretty sweet swag!</li></ul>'%>

<%= view :course_wide_block, cta_link: CDO.studio_url('/educate/professional-learning/middle-high'), img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), cta_text: 'Professional Learning for Middle and High School', title: 'Middle and High School', description: "<ul><li>All teachers are welcome! No previous experience teaching computer science is needed.</li><li>Ramp up with a 5-day summer workshop where you'll work hands-on with the curriculum and meet other teachers from your area.</li><li>Continue developing year round through follow-up workshops and community events.</li></ul>"%>


<br />
<div class="col-50" style="padding-right: 20px;">

<%=view :display_video_thumbnail, id: "professional_learning", video_code: "9VvuRiFQv10", play_button: 'center', letterbox: 'false' %>

</div>

[col-50]

## New to computer science? No worries.

Code.org offers hands-on workshops and online support. Over 80,000 teachers have been through our professional development workshops and thousands more attend every month. Whether you’re brand new to computer science or an experienced tech teacher looking for the best way to use the Code.org curriculum, our Professional Learning Program is a great way to get started. And teachers love it! Over 90% rank it the best professional development ever.

[/col-50]

<div style="clear: both;"></div>

<br>

<summary style="font-size: 20px; color: #7665a0;">**International Professional Learning**</summary>
<br/>
Teachers anywhere in the world can use our free, self-paced [online workshop](https://studio.code.org/s/K5-onlinePD) to get started. The intended audience for this online workshop is primary school teachers.

At this point, our in-person  workshops are only available in the United States, but the [curriculum, lesson plans, tools, and support](https://studio.code.org/courses) are available at no cost worldwide. And, [join our forums](https://forum.code.org/) to connect with other teachers for support, teaching tips, and best practices. Our forums are for teachers of all grade levels.

You can also contact our [international partners](https://hourofcode.com/international-partners) for more information on local professional learning opportunities.

## Attendees love our professional learning!
80,000 teachers have participated.
98% of attendees would recommend our program to another teacher.
The majority of our workshop attendees rank it the **best professional development ever.**

<%= view :three_circles, circles: [
{img: '/images/testimonials/fit-150/twoteachers.jpg', text: '"I do not have a computer science background. I would change nothing about the training. It was an incredible experience, and I felt valued and respected."'},
{img: '/images/testimonials/fit-150/teacher-renee.jpg', text: '"I would absolutely recommend anything Code.org has to offer to any teacher. Period. The lesson plans are incredible."'},
{img: '/images/testimonials/fit-150/teacher-juan.jpg', text: '"It was absolutely rich and the most meaningful training I have ever attended in 16 years of teaching."'}] %>

<br>

<img src="/images/k5pdcropped.jpg" width="100%"/>

## Become a Code.org facilitator

Code.org's Facilitator Development Program is a highly-selective professional learning program designed to prepare and support facilitators to deliver quality workshops on Code.org's courses.

Interested in helping to bring professional learning opportunities to your community? [Learn more about becoming a Code.org facilitator.](/educate/professional-learning/facilitator)

<%= view :answerdash %>
