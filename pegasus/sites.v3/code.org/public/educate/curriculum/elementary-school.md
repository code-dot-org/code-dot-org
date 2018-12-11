---
title: CS Fundamentals for grades K-5
video_player: true
theme: responsive
style_min: true
---

<link href="/shared/css/course-blocks.css", type="text/css", rel="stylesheet"></link>

[solid-block-header]

Elementary School

[/solid-block-header]

Our six Computer Science Fundamentals courses are designed to be flexible for your classroom. How you implement is up to you - teach CS Fundamentals for your next science unit, use it to support math concepts, add technology time to your schedule once a week, or go deeper with extension activities and projects!
</p>

<img src="/images/animated-examples/cutesprite.gif" style="float: left;">

New to teaching computer science? No worries! Most of our teachers have never taught computer science before. Try one of our CS Fundamentals courses yourself to learn ahead of your students, or sign up for a [professional development workshop](/professional-development-workshops) near you!

<br>

<div style="clear:both"></div>

<div class="col-50" style="padding-right: 20px; float: left; margin-top: 10px">

<% facebook = {:u=>'https://youtu.be/rNIM1fzJ8u0'} %>
<% twitter = {:url=>'https://youtu.be/rNIM1fzJ8u0', :related=>'codeorg', :text=>"Introduction to CS Fundamentals. (Thanks #{get_random_donor_twitter} for supporting @codeorg)"} %>
<%=view :display_video_thumbnail, id: "introK5", video_code: "rNIM1fzJ8u0", play_button: 'center', facebook: facebook, twitter: twitter, letterbox: 'false' %>
</div>

<div class="col-50" style="float: left; padding-right: 20px;">

<%= view :course_wide_block, cta_link: CDO.code_org_url('/professional-development-workshops'), cta_text: 'Find a workshop', img: CDO.code_org_url('/shared/images/banners/small-teal-icons.png'), title: 'Support for teachers', ages: 'Professional Learning Opportunities', description: "<p>We offer high-quality, one-day workshops at no cost to you or your school. Join other teachers in your area for a hands-on and fun intro to teaching computer science.
</p>
Tens of thousands of teachers have participated and rate our workshops 4.8 out of 5. The majority say, 'It's the best professional development I've ever attended.'"%>

</div>

<div style="clear:both"></div>

## It's relevant.

Our curriculum was created with the 2017 Computer Science Teachers Association (CSTA) standards</a> in mind, but also includes opportunities to support national Math, English Language Arts, and Science standards. In fact, <a href="https://medium.com/@codeorg/code-org-resourceful-teachers-higher-student-achievement-8be1efdec06e", target=_"blank">a recent research study</a> found that classrooms with resourceful teachers see higher scores on English, math, and science standardized tests after teaching these lessons. Click <a href="https://curriculum.code.org/csf-18/standards/", target=_"blank">here</a> to see how CS Fundamentals lessons support standards.

### Supported Standards

* <a href="https://www.csteachers.org/page/standards", target=_"blank">Computer Science Teachers Association (CSTA)</a>
* <a href="http://www.corestandards.org/ELA-Literacy/" target=_"blank">Common Core English Language Arts</a>
* <a href="http://www.corestandards.org/Math/",  target=_"blank">Common Core Math</a>
* <a href="http://www.nextgenscience.org/next-generation-science-standards" target=_"blank">Next Generation Science</a>

## It's easy to get started.

The courses include daily lesson plans, student activities, and answer keys for teachers. You don't even need a user account to try it out. Once you get a feel for the courses, <a href="https://studio.code.org/users/sign_up", target=_"blank">sign up as a teacher</a> to see the lesson plans, join the teacher forums, and get access to all the resources you need. Next, quickly set up a classroom section from your roster or sync with tools like Clever or Google Classroom to view your students' progress and manage their accounts. Then celebrate your students' learning by printing certificates they can bring home when they finish the course.


## And, did we mention that it's fun!?

Your students will create their own games, art, and digital stories that they can share - all while developing problem-solving, collaboration, persistence, and computational thinking skills. Do your students love to get up and move around? Half of the lessons are "unplugged" activities that teach computational thinking and digital citizenship skills without computers. See some awesome student creations below!

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

<p style="clear:both">&nbsp;</p>

[solid-block-header]

Courses

[/solid-block-header]

# Selecting the right course for your class

<img src="/images/fit-970/CSFimages/Course_Map.png" style="max-width: 100%"/>

For students new to computer science, each course begins with a grade-appropriate entry point and structured ramp-up of concepts. The progression of Courses A-F builds upon each other to ensure continuing students stay interested and learn new things. This allows you to use the same course at any grade level for all students, regardless of their experience. If you’re looking for a more comprehensive course, the Express Course combines the best of Courses A-F into a single condensed course (with a simpler option for pre-readers). Explore the lesson plans and download the 2018 version of the <a href="https://curriculum.code.org/csf/", target=_"blank">curriculum guide for Courses A-F here</a>.

If you've been teaching Courses 1-4 and want to know how to transition to teaching Courses A-F, check out our <a href="https://docs.google.com/document/d/1dFgrHiW-ERpNGey7yrNcoxU0LEfH9kFbdeLJn2QyJTA/edit?usp=sharing", target=_"blank">Transition Guide</a>.

# Courses A-F

[col-50]

<%= view :course_wide_block, cta_link: CDO.studio_url('/s/coursea-2018'), cta_text: 'View course', lesson_plans: curriculum_url('csf-18/coursea'), img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), title: 'Course A', ages: 'Recommended for Kindergarten (Supports pre-readers)', description: 'Teaches basic programming concepts such as loops and events. Lessons also teach students to collaborate with others meaningfully, investigate different problem-solving techniques, persist in the face of difficult tasks, and learn about internet safety. At the end of this course, students create their very own custom game or story they can share.
'%>

[/col-50]

[col-50]

<%= view :course_wide_block, cta_link: CDO.studio_url('/s/courseb-2018'), cta_text: 'View course', lesson_plans: curriculum_url('csf-18/courseb'), img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), title: 'Course B', ages: 'Recommended for 1st grade (Supports pre-readers)', description: 'Closely parallels Course A, but provides more complex unplugged activities and more variety in puzzles. Covers the basics of programming, collaboration techniques, investigation and critical thinking skills, persistence in the face of difficulty, and internet safety. At the end of this course, students create their very own custom game they can share.'%>

[/col-50]

<div style="clear:both"></div>

[col-50]

<%= view :course_wide_block, cta_link: CDO.studio_url('/s/coursec-2018'), cta_text: 'View course', lesson_plans: curriculum_url('csf-18/coursec'), img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), title: 'Course C', ages: 'Recommended for 2nd grade', description: 'Students will create programs with loops and events. They will translate their initials into binary, investigate different problem-solving techniques, and discuss how to respond to cyberbullying. By the end of the course, students will create interactive games that they can share.'%>

[/col-50]

[col-50]

<%= view :course_wide_block, cta_link: CDO.studio_url('/s/coursed-2018'), cta_text: 'View course', lesson_plans: curriculum_url('csf-18/coursed'), img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), title: 'Course D', ages: 'Recommended for 3rd grade', description: 'Students develop their understanding of algorithms, nested loops, while loops, conditionals, and events. Beyond coding, students learn about digital citizenship.' %>

[/col-50]

<div style="clear:both"></div>

[col-50]

<%= view :course_wide_block, cta_link: CDO.studio_url('/s/coursee-2018'), cta_text: 'View course', lesson_plans: curriculum_url('csf-18/coursee'), img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), title: 'Course E', ages: 'Recommended for 4th grade', description: 'Students will practice coding with algorithms, loops, conditionals, and events before they are introduced to functions. In the second part of the course, students design and create a capstone project they can share.' %>

[/col-50]

[col-50]

<%= view :course_wide_block, cta_link: CDO.studio_url('/s/coursef-2018'), cta_text: 'View course', lesson_plans: curriculum_url('csf-18/coursef'), img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), title: 'Course F', ages: 'Recommended for 5th grade', description: 'Students review the use of loops, events, functions, and conditionals before learning about variables and for loops. They will investigate helpful problem-solving techniques and discuss societal impacts of computing and the internet. In the second part of this course students design and create a capstone project they can share.' %>

[/col-50]

<div style="clear:both"></div>

# Express Course

<div class="col-50" style="padding-right: 10px;">
  <a href="<%= CDO.studio_url('/s/pre-express-2018') %>"><img src="/images/curriculum/course-tile-pre-reader-express.png" style="max-width:100%"></a>
  <br>
  <br>
  <a href="<%= CDO.studio_url('/s/express-2018') %>"><img src="/images/curriculum/course-tile-express.png" style="max-width:100%"></a>
</div>

[col-50]

CS Fundamentals Express combines the best of Courses A-F into a single condensed course (with a simpler option for pre-readers). We recommend Courses A-F for most classrooms, but if your school only offers one computer science course or you want to have your students work through multiple courses in a single year, the Express course is a better choice. By removing the ramp up between years, the express course provides a smoother path and doesn’t repeat concepts for students unnecessarily. This is also our recommended option for students studying computer science on their own, outside of a classroom.

[/col-50]

<div style="clear:both"></div>

<br>
<br>

# International CS Fundamentals: Courses 1-4 and Accelerated

We are working on translating Courses A-F and the Express Course to languages beyond English. In the meantime, we recommend using Courses 1-4 and the Accelerated Course. These courses cover the same basic concepts and have already been translated into 25+ languages.

<a href="/educate/curriculum/cs-fundamentals-international"><button>View Courses 1-4</button></a>
&nbsp;&nbsp;
<a href="/educate/curriculum/cs-fundamentals-international"><button>View Accelerated Course</button></a>

# Looking for unplugged activities?

If you don't have computers in your classroom, these unplugged lessons can either be used alone or with other computer science lessons on related concepts.

<a href="https://code.org/curriculum/unplugged"><button>View unplugged lessons</button></a>

[solid-block-header]

Recommended courses from 3rd parties

[/solid-block-header]

<!--- If you update the resources here, don't forget to also update /educate/curriculum/3rdparty -->

| Organization | Curriculum | Professional Development |
|--------------|------------|---------------|---------------|
| [Code Monkey](https://www.playcodemonkey.com/) | Over 300 story modes & skill mode challenges. Can be taught full year, 1/2 year, or quarterly. $10/student | Free online course, $250/webinar, $3500/onsite PD |
| [Code Red Education](http://www.coderededucation.com) | 150 lessons over 7 modules, $3500/site | Online PD included with site fee |
| [Parallax Inc.](https://www.parallax.com/education/teach/program-options/elementary-school) | Pre-programmed and re-programmable educational robot that fits into a wide variety of program formats. Uses the visual BlocklyProp programming tool. Curriculum is FREE. Robot purchase required. | FREE in-person immersive single day trainings. Occasional live webinars. |
| [Project Lead The Way](https://www.pltw.org/our-programs/pltw-launch) | 6 10-hour computer science modules, $750/school  | Face-to-face and online, $700 for school-level lead teacher |
| [ScratchEd](http://scratched.gse.harvard.edu/guide) | A 6-unit intro to Scratch, FREE | In-person educator meet-ups and online MOOC, FREE |
| [Tynker](https://www.tynker.com/school/lesson-plan) | Free tools, tutorials, and a 6-hr introductory lesson plan. 200+ lessons with assessments: $399/class, $2,000/school | 2-day PD, $2000/day + travel |
| [Vidcode](https://www.vidcode.com/) | First course and teacher resources are free. Over 12 creative coding courses, 10 hours each, that teach JavaScript and computational thinking. Includes cross-disciplinary, interaction design, and game design courses. School site licenses $2500, a la carte $30/student. Group discounts available. | Free onboarding call, animated online PD course, $250/webinar, $3500/onsite PD |
<br />
<a target="_blank" href="https://docs.google.com/spreadsheets/d/1-lbIKCkcVWWTFhcmpZkw8AcGv0iPj-hEqvO0Eu0N1hU/pubhtml?gid=1552205876&single=true"><button>See full details and comparison</button></a>
