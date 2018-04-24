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

<div class="col-40" style="padding-right: 20px; float: left;">

<% facebook = {:u=>'https://youtu.be/rNIM1fzJ8u0'} %>
<% twitter = {:url=>'https://youtu.be/rNIM1fzJ8u0', :related=>'codeorg', :text=>"Introduction to CS Fundamentals. (Thanks #{get_random_donor_twitter} for supporting @codeorg)"} %>
<%=view :display_video_thumbnail, id: "introK5", video_code: "rNIM1fzJ8u0", play_button: 'center', facebook: facebook, twitter: twitter, letterbox: 'false' %>

</div>

[col-60]

Our Computer Science Fundamentals courses have about 15 lessons that may be implemented as one unit or over the course of a semester. Students create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. They will study programming concepts, computational thinking, digital citizenship, and develop interactive games or stories they can share.

If you like teaching CS Fundamentals, invite other teachers by [sharing this handout](/files/csf-one-pager.pdf).

Our curriculum aligns to the [2017 Computer Science Teachers Association (CSTA) standards](https://www.csteachers.org/page/standards), as well as relevant national <a href="http://www.corestandards.org/Math/" target="_blank">Math</a>, <a href="http://www.corestandards.org/ELA-Literacy/" target="_blank">English Language Arts</a>, and <a href="http://www.nextgenscience.org/next-generation-science-standards" target="_blank">Science</a> standards. [View the full standards alignment document](https://curriculum.code.org/csf/standards/) for CS Fundamentals Courses A-F.

Our courses are available at [no cost](/commitment) for anyone, anywhere to teach. For more information about our goals and approach to our courses, please see our [curriculum values](/educate/curriculum/values) and our [professional learning values](/educate/professional-learning/values).

[/col-60]

<div style="clear:both"></div>

# New to teaching computer science?

<div class="col-40" style="float: left;">
<img src="/images/fit-370/CSFimages/PD_Review_Cyan.png"/>
</div>

<div class="col-60" style="float: left; margin-top: 15px; padding-right: 20px;">

No worries! Most of our teachers have never taught computer science before. 

Try one of our courses yourself to learn ahead of your students. Sign up as a teacher to see the lesson plans, join the teacher forums, and get access to all the resources you need.

We also offer high-quality, 1-day workshops at no cost to you or your school. Join other teachers in your area for a hands-on intro to computer science, pedagogy, teacher dashboard, and strategies for teaching “unplugged” classroom activities. 

<br>
<a href="/professional-development-workshops"><button>Find a workshop</button></a>

</div>

<div style="clear:both"></div>

<br>

[solid-block-header]

Courses

[/solid-block-header]

# Selecting the right course for your class

<img src="/images/fit-970/CSFimages/Course_Map.png" style="max-width: 100%"/>

For students new to computer science, each course begins with a grade-appropriate entry point and structured ramp-up of concepts. The progression of Courses A-F builds upon each other to ensure continuing students stay interested and learn new things. This allows you to use the same course at any grade level for all students, regardless of their experience. If you’re looking for a more comprehensive course, the Express Course combines the best of Courses A-F into a single condensed course (with a simpler option for pre-readers). You can download version 2 of the [curriculum guide for Courses A-F here](https://code.org/curriculum/docs/csf/CSF_TeacherGuide_CoursesA-F_v2a_small.pdf).

If you've been teaching Courses 1-4 and want to know how to transition to teaching Courses A-F, check out our [Transition Guide](https://docs.google.com/document/d/1dFgrHiW-ERpNGey7yrNcoxU0LEfH9kFbdeLJn2QyJTA/edit?usp=sharing).

# Courses A-F

[col-50]

<%= view :course_wide_block, cta_link: CDO.studio_url('/s/coursea'), cta_text: 'View course', lesson_plans: 'https://curriculum.code.org/csf/coursea', img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), title: 'Course A', ages: 'Recommended for Kindergarten (Supports pre-readers)', description: 'Teaches basic programming concepts such as loops and events. Lessons also teach students to collaborate with others meaningfully, investigate different problem-solving techniques, persist in the face of difficult tasks, and learn about internet safety. At the end of this course, students create their very own custom game or story they can share.
'%>

[/col-50]

[col-50]

<%= view :course_wide_block, cta_link: CDO.studio_url('/s/courseb'), cta_text: 'View course', lesson_plans: 'https://curriculum.code.org/csf/courseb', img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), title: 'Course B', ages: 'Recommended for 1st grade (Supports pre-readers)', description: 'Closely parallels Course A, but provides more complex unplugged activities and more variety in puzzles. Covers the basics of programming, collaboration techniques, investigation and critical thinking skills, persistence in the face of difficulty, and internet safety. At the end of this course, students create their very own custom game they can share.'%>

[/col-50]

<div style="clear:both"></div>

[col-50]

<%= view :course_wide_block, cta_link: CDO.studio_url('/s/coursec'), cta_text: 'View course', lesson_plans: 'https://curriculum.code.org/csf/coursec', img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), title: 'Course C', ages: 'Recommended for 2nd grade', description: 'Students will create programs with loops and events. They will translate their initials into binary, investigate different problem-solving techniques, and discuss how to respond to cyberbullying. By the end of the course, students will create interactive games that they can share.'%>

[/col-50]

[col-50]

<%= view :course_wide_block, cta_link: CDO.studio_url('/s/coursed'), cta_text: 'View course', lesson_plans: 'https://curriculum.code.org/csf/coursed', img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), title: 'Course D', ages: 'Recommended for 3rd grade', description: 'Students develop their understanding of algorithms, nested loops, while loops, conditionals, and events. Beyond coding, students learn about digital citizenship.' %>

[/col-50]

<div style="clear:both"></div>

[col-50]

<%= view :course_wide_block, cta_link: CDO.studio_url('/s/coursee'), cta_text: 'View course', lesson_plans: 'https://curriculum.code.org/csf/coursee', img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), title: 'Course E', ages: 'Recommended for 4th grade', description: 'Students will practice coding with algorithms, loops, conditionals, and events before they are introduced to functions. In the second part of the course, students design and create a capstone project they can share.' %>

[/col-50]

[col-50]

<%= view :course_wide_block, cta_link: CDO.studio_url('/s/coursef'), cta_text: 'View course', lesson_plans: 'https://curriculum.code.org/csf/coursef', img: CDO.code_org_url('/shared/images/banners/small-purple-icons.png'), title: 'Course F', ages: 'Recommended for 5th grade', description: 'Students create programs with different kinds of loops, events, functions, and conditionals. They will also investigate different problem-solving techniques and discuss societal impacts of computing and the internet. In the second part of this course students design and create a capstone project they can share.' %>

[/col-50]

<div style="clear:both"></div>

# Express Course

<div class="col-50" style="padding-right: 10px;">
  <a href="<%= CDO.studio_url('/s/pre-express') %>"><img src="/images/curriculum/course-tile-pre-reader-express.png" style="max-width:100%"></a>
  <br>
  <br>
  <a href="<%= CDO.studio_url('/s/express') %>"><img src="/images/curriculum/course-tile-express.png" style="max-width:100%"></a>
</div>

[col-50]

CS Fundamentals Express combines the best of Courses A-F into a single condensed course (with a simpler option for pre-readers). We recommend Courses A-F for most classrooms, but if your school only offers one computer science course or you want to have your students work through multiple courses in a single year, the Express course is a better choice. By removing the ramp up between years, the express course provides a smoother path and doesn’t repeat concepts for students. This is also our recommended option for students studying computer science on their own, outside of a classroom.

[/col-50]

<div style="clear:both"></div>

<br>
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

# Examples of student creations

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

Recommended courses from 3rd parties

[/solid-block-header]

<!--- If you update the resources here, don't forget to also update /educate/curriculum/3rdparty -->

| Organization | Curriculum | Professional Development |
|--------------|------------|---------------|---------------|
| [Code Monkey](https://www.playcodemonkey.com/) | Over 300 story modes & skill mode challenges. Can be taught full year, 1/2 year, or quarterly. $10/student | Free online course, $250/webinar, $3500/onsite PD |
| [Code Red Education](http://www.coderededucation.com) | 150 lessons over 7 modules, $3500/site | Online PD included with site fee |
| [Project Lead The Way](https://www.pltw.org/our-programs/pltw-launch) | 6 10-hour computer science modules, $750/school  | Face-to-face and online, $700 for school-level lead teacher |
| [ScratchEd](http://scratched.gse.harvard.edu/guide) | A 6-unit intro to Scratch, FREE | In-person educator meet-ups and online MOOC, FREE |
| [Tynker](https://www.tynker.com/school/lesson-plan) | Free tools, tutorials, and a 6-hr introductory lesson plan. 200+ lessons with assessments: $399/class, $2,000/school | 2-day PD, $2000/day + travel |
<br />
<a target="_blank" href="https://docs.google.com/spreadsheets/d/1-lbIKCkcVWWTFhcmpZkw8AcGv0iPj-hEqvO0Eu0N1hU/pubhtml?gid=1552205876&single=true"><button>See full details and comparison</button></a>

