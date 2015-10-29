---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

# ایک گھنٹے کے کوڈ کو تعلیم دینے کا طریقہ

## 1) Sign up

  * Sign up to host an [Hour of Code](<%= resolve_url('/') %>) during <%= campaign_date('short') %>.
  * Promote your [Hour of Code](<%= resolve_url('/promote') %>) and encourage others to host.

## 2) Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 3) Choose a tutorial:

We’ll host a variety of [fun, hour-long tutorials](<%= resolve_url('https://code.org/learn') %>) for students of all ages, created by a variety of partners. *New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.* [Try current tutorials.](<%= resolve_url("https://code.org/learn") %>)

**تمام اسباق گھنٹے کا کوڈ:**

  * Require minimal prep-time for teachers
  * Are self-guided - allowing students to work at their own pace and skill-level

[![](/images/fit-700/tutorials.png)](<%= resolve_url('https://code.org/learn') %>)

## 4) Plan your technology needs - computers are optional

The best Hour of Code experience will be with Internet-connected computers. You **don’t** need a computer for every child, and can even do the Hour of Code without a computer at all.

  * Test tutorials on student computers or devices. Make sure they work properly on browsers with sound and video.
  * Provide headphones for your class, or ask students to bring their own, if the tutorial you choose works best with sound.
  * **Don't have enough devices?** Use [pair programming](https://www.youtube.com/watch?v=vgkahOzFH2Q). When students partner up, they help each other and rely less on the teacher. They’ll also see that computer science is social and collaborative.
  * **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

![](/images/fit-350/group_ipad.jpg)

## 5) Inspire students to start your Hour of Code

**Kick off your Hour of Code by inspiring students and discussing how computer science impacts every part of our lives.**

**Show an inspirational video:**

  * The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions)
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the <% if @country == 'uk' %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [President Obama calling on all students to learn computer science](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Find more inspirational video [here](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

  * Explain ways technology impacts our lives, with examples both boys and girls will care about (Talk about saving lives, helping people, connecting people, etc.).
  * As a class, list things that use code in everyday life.
  * See tips for getting girls interested in computer science [here](<%= resolve_url('https://code.org/girls') %>).

**Need more guidance?** Download this [template lesson plan](/files/EducatorHourofCodeLessonPlanOutline.docx).

**Want more teaching ideas?** Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from experienced educators.

## 6) Code!

**Direct students to the activity**

  * Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('https://code.org/learn') %>) under the number of participants.

**When your students come across difficulties it's okay to respond:**

  * “I don’t know. Let’s figure this out together.”
  * “Technology doesn’t always work out the way we want.”
  * “Learning to program is like learning a new language; you won’t be fluent right away.”

**What to do if a student finishes early?**

  * Students can see all tutorials and try another Hour of Code activity at [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>)
  * Or, ask students who finish early to help classmates who are having trouble with the activity.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Celebrate

  * [Print certificates](<%= resolve_url('https://code.org/certificates') %>) for your students.
  * [Print "I did an Hour of Code!"](<%= resolve_url('/promote/resources#stickers') %>) stickers for your students.
  * Share photos and videos of your Hour of Code event on social media. Use #HourOfCode and @codeorg so we can highlight your success, too!

[col-33]

![](/images/fit-250/celebrate2.jpeg)

[/col-33]

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Other Hour of Code resources for educators:

  * Use this [template lesson plan](/files/EducatorHourofCodeLessonPlanOutline.docx) to organize your Hour of Code.
  * Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from past Hour of Code teachers. 
  * Attend our [Educator's Guide to the Hour of Code webinar](http://www.eventbrite.com/e/an-educators-guide-to-the-hour-of-code-tickets-17987415845).
  * Visit the [Hour of Code Teacher Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other educators. <% if @country == 'us' %>
  * Review the [Hour of Code FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## What comes after the Hour of Code?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey, [encourage your children to learn online](<%= resolve_url('https://code.org/learn/beyond') %>).

<%= view :signup_button %>