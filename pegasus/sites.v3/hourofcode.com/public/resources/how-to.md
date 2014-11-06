---
title: Resources
layout: wide
---
<div class="row">
    <h1 class="col-sm-6">How to teach one Hour of Code</h1>
    <div class="col-sm-6 button-container centered">
        <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Sign up your event</button></a>
    </div>
</div>
## 1) Try the tutorials:
We’ll host a variety of fun, hour-long tutorials for students of all ages, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before December 8-14.

**All Hour of Code tutorials:**

- Require minimal prep-time for teachers
- Are self-guided - allowing students to work at their own pace and skill-level

<a href="http://<%=codeorg_url() %>/learn"><img src="http://<%= codeorg_url() %>/images/tutorials.png"></a>


## 2) Plan your hardware needs - computers are optional

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every child, and can even do the Hour of Code without a computer at all. 

- **Test tutorials on student computers or devices.** Make sure they work properly (with sound and video).
- **Preview the congrats page** to see what students will see when they finish. 
- **Provide headphones for your class**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Plan ahead based on your technology available

- **Don't have enough devices?** Use [pair programming](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When students partner up, they help each other and rely less on the teacher. They’ll also see that computer science is social and collaborative.
- **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

## 4) Inspire students - show them a video


Show students an inspirational video to kick off the Hour of Code. Examples:

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions)
- The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the <% if @country == 'uk' %> [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ) <% else %> [Hour of Code 2014 video](https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q) <% end %>
- [President Obama calling on all students to learn computer science](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Get your students excited - give them a short intro**

Most kids don’t know what computer science is. Here are some ideas:

- Explain it in a simple way that includes examples of applications that both boys and girls will care about (saving lives, helping people, connecting people, etc.).
- Try: "Think about things in your everyday life that use computer science: a cell phone, a microwave, a computer, a traffic light… all of these things needed a computer scientist to help build them.”
- Or: “Computer science is the art of blending human ideas and digital tools to increase our power. Computer scientists work in so many different areas: writing apps for phones, curing diseases, creating animated movies, working on social media, building robots that explore other planets and so much more."
- See tips for getting girls interested in computer science <a href="http://<%= codeorg_url() %>/girls">here</a>. 

## 5) Start your Hour of Code

**Direct students to the activity**

- Write the tutorial link on a whiteboard. Find the link listed on the <a href="http://<%= codeorg_url() %>/learn">information for your selected tutorial</a> under the number of participants. [hourofcode.com/co](http://hourofcode.com/co)
- Tell students to visit the URL and start the tutorial.

**When your students come across difficulties**

- Tell students, “Ask 3 then me.” Ask 3 classmates, and if they don’t have the answer, then ask the teacher.
- Encourage students and offer positive reinforcement: “You’re doing great, so keep trying.”
- It’s okay to respond: “I don’t know. Let’s figure this out together.” If you can’t figure out a problem, use it as a good learning lesson for the class: “Technology doesn’t always work out the way we want. Together, we’re a community of learners.” And: “Learning to program is like learning a new language; you won’t be fluent right away.“

**What to do if a student finishes early?**

- Students can see all tutorials and try another Hour of Code activity at <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>
- Or, ask students who finish early to help classmates who are having trouble with the activity.

**How do I print certificates for my students?**

Each student gets a chance to get a certificate via email when they finish the [Code.org tutorials](http://studio.code.org). You can click on the certificate to print it. However, if you want to make new certificates for your students, visit our <a href="http://<%= codeorg_url() %>/certificates">Certificates</a> page to print as many certificates as you like, in one fell swoop!

**What comes after the Hour of Code?**

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. <% if @country == 'uk' %> The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey, [encourage your children to learn online](http://uk.code.org/learn/beyond). <% else %> To continue this journey, find additional resources for educators <a href="http://<%= codeorg_url() %>/educate">here</a>. Or encourage your children to learn <a href="http://<%= codeorg_url() %>/learn/beyond">online</a>. <% end %>
<a style="display: block" href="<%= hoc_uri('/#join') %>"><button style="float: right;">Sign up your event</button></a>


