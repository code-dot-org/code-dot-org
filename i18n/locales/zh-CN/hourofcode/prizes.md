* * *

title: Prizes layout: wide <% if @country == 'us' || @country == 'ca' %>nav: prizes_nav<% end %>

* * *

<div class="row">
  <h1 class="col-sm-9">
    每个组织者都可以获得的奖励
  </h1>
</div>

<% if @country == 'us' %>

## One classroom will win a trip to Washington, D.C. for a historic, top-secret Hour of Code! {#dc}

Code.org will select one lucky classroom to attend a very special Hour of Code event in the nation’s capital — so special that all the details are under wraps! Winning students (with chaperones) will enjoy an all-expenses-covered trip to Washington, D.C. Students will participate in a full day of top-secret activities on Monday, December 8.

<% end %>

<% if @country == 'us' %>

<h2 id="hardware_prize" style="font-size: 18px">
  51 schools win a class-set of laptops (or $10,000 for other technology)
</h2>

One lucky school in ***every*** U.S. state (+ Washington D.C.) won $10,000 worth of technology. [**See all 51 winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners)

<% end %>

<% if @country == 'uk' %>

## Lucky classrooms win a video chat with a guest speaker! {#video_chat}

20 lucky classrooms will be invited to join a video chat to celebrate the Hour of Code during December 8-14. Your students will be able to ask questions and chat with technology-industry leaders. **The submission period has ended. Winners will be announced soon.**

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## 100 classrooms win a video chat with a guest speaker! {#video_chat}

100 lucky classrooms are invited to participate in live video Q&As with tech titans and tech-loving celebrities. Students will be able to ask questions and chat with these exciting role models to kick off your Hour of Code.

### Tune into the live chats, or watch the video archives:

**TUESDAY**, December 9   
10:00 AM PST - [Lyndsey Scott](http://www.youtube.com/watch?v=6s5oxGmbXy4)   
12:00 PM PST - [Jack Dorsey](http://www.youtube.com/watch?v=PBGJfpbSWjY)   
3:00 PM PST - [Ashton Kutcher](http://www.youtube.com/watch?v=d1LuhJPJP9s)   


**WEDNESDAY**, December 10   
7:30 AM PST - [Cory Booker](http://www.youtube.com/watch?v=wD0Heuvv87I)   
10:00 AM PST - [JR Hildebrand](http://www.youtube.com/watch?v=DfhAdnosy58)   
11:00 AM PST - [Clara Shih](http://www.youtube.com/watch?v=2p7uhb1qulA)   
12:00 PM PST - [Jessica Alba](http://youtu.be/m4oEbAQbWCE)   


**THURSDAY**, December 11   
5:30 AM PST - [Karlie Kloss](http://www.youtube.com/watch?v=6SzsRGTmjy0)   
9 AM PST - [David Karp](http://www.youtube.com/watch?v=1tVei0jOyVQ)   
10 AM PST - [Jess Lee](http://www.youtube.com/watch?v=wXKPrtfaoi8)   
11 AM PST - [Usher](http://www.youtube.com/watch?v=xvQSSaCD4yw)   


**FRIDAY**, December 12   
10:00 AM PST - [Hadi Partovi](http://www.youtube.com/watch?v=PDnjt6iIBzo)

&#42;Recordings of Bill Gates and Sheryl Sandberg chats will be available on [our YouTube channel](https://www.youtube.com/user/CodeOrg/)

### This year's celebrity video chat participants:

<%= view :video_chat_speakers %>

<% end %>

## Every organizer wins a thank you gift-code {#gift_code}

Every educator who hosts an Hour of Code for students will receive 10 GB of Dropbox space or $10 Skype credit as a thank you gift!

<% if @country == 'ca' %>

## $2000 Brilliant Project {#brilliant_project}

[Brilliant Labs](http://brilliantlabs.com/hourofcode) will provide the resources necessary, up to a value of $2000.00, to implement a technology based, hands on, student centric learning project to one classroom in each province and territory (note: with the exception of Quebec). To qualify, teachers must register at hourofcode.com/ca#signup by December 6, 2014. For more details, terms, and conditions, please visit [brilliantlabs.com/hourofcode](http://brilliantlabs.com/hourofcode).

## Lucky Schools win an Actua Workshop {#actua_workshop}

15 lucky schools across Canada will be gifted 2 hands-on STEM workshops delivered by one of Actua's [33 Network Members](http://www.actua.ca/about-members/). Actua members deliver science, technology, engineering, and math (STEM) workshops that are connected to provincial and territorial learning curriculum for K-12 students. These in-classroom experiences are delivered by passionate, highly-trained undergraduate student role models in STEM. Teachers can expect exciting demonstrations, interactive experiments and a lot of STEM fun for their students! Please note that in-classroom workshop availability may vary in remote and rural communities.

[Actua](http://actua.ca/) is Canada’s leader in Science, Technology, Engineering, and Math Outreach. Each year Actua reaches over 225,000 youth in over 500 communities through its barrier-breaking programming.

**Congratulations to the 2014 winners!**

| School                          | City        | Actua Network Member            |
| ------------------------------- | ----------- | ------------------------------- |
| Spencer Middle School           | Victoria    | Science Venture                 |
| Malcolm Tweddle School          | Edmonton    | DiscoverE                       |
| Britannia Elementary            | Vancouver   | GEERing Up                      |
| Captain John Palliser           | Calgary     | Minds in Motion                 |
| St. Josaphat School             | Regina      | EYES                            |
| Bishop Roborecki School         | Saskatoon   | SCI-FI                          |
| Dalhousie Elementary School     | Winnipeg    | WISE Kid-Netic Energy           |
| Hillfield Strathallan College   | Hamilton    | Venture Engineering and Science |
| Byron Northview Public School   | London      | Discovery Western               |
| Stanley Public School           | Toronto     | Science Explorations            |
| Ottawa Catholic School Board    | Ottawa      | Virtual Ventures                |
| École Arc-en-Ciel               | Montreal    | Folie Technique                 |
| Saint Vincent Elementary School | Laval       | Musee Armand Frappier           |
| Garden Creek School             | Fredericton | Worlds UNBound                  |
| Armbrae Academy                 | Halifax     | SuperNOVA                       |

## Kids Code Jeunesse will help support you in the classroom! {#kids_code}

Are you a teacher who wants to introduce computer programming to your students and would like support in the classroom? Any teacher that would like a trained Computer Programming volunteer to assist in the classroom can contact [Kids Code Jeunesse](http://www.kidscodejeunesse.org) and we’ll work on getting you supported! [Kids Code Jeunesse](http://www.kidscodejeunesse.org) is a Canadian not for profit aimed at providing every child with the opportunity to learn to code. And every teacher the opportunity to learn how to teach computer programming in the classroom.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## 100个教室将会赢得一套可编程的机器人 {#programmable_robots}

[Sphero](http://www.gosphero.com/) is the app-controlled robotic ball changing the way students learn. Powered by [SPRK lessons](http://www.gosphero.com/education/), these round robots give kids a fun crash course in programming while sharpening their skills in math and science. Sphero is giving away 100 classroom sets – each including 5 robots. Any classroom (public or private) within the U.S. or Canada is eligible to win this prize.

<% end %>

## More questions about prizes? {#more_questions}

Check out [Terms and Conditions](<%= hoc_uri('/prizes-terms') %>) or visit our forum to see [FAQs](http://support.code.org) and ask your questions.

<% if @country == 'us' %>

# Frequently Asked Questions {#faq}

## 需要整个学校参加才能获得10000美元的硬件奖励吗？

是的，你的整个学校参与才有资格获奖，但只需要一个人注册并提交硬件奖申请表[这里](<%= hoc_uri('/prizes') %>).

## 需要整个学校参与才能赢得科技会话吗？

任何班级（公立或私立学校）都有资格获得奖励，不需要整个学校的参与。

## 非公立学校可以赢得视频聊天奖吗？

是的！私立或独立学校和公立学校一样有资格获得视频聊天奖励。

## 非美国的学校可以获得视频聊天奖励吗？

不，很遗憾，由于物流我们无法对美国和加拿大以外的学校提供视频聊天奖。 所有国际组织者**都有**资格获得Dropbox 空间或Skype 信用。

## 为什么只有公立学校可以获得10000美元硬件奖励？

我们很愿意既帮助公立学校的老师又帮助私立学校的老师，但是现状涉及到物流问题。 我们已经与[ DonorsChoose.org](http://donorschoose.org)合作管理教室的资金奖励，仅适用于美国K-12公立学校。 通过DonorsChoose.org，该组织能够更好地获得可用于公立学校的一致和准确的数据。

## 我是在美国以外，我可以有资格获奖吗？

由于处于小型专职人员模式，Code.org无法处理管理国际大奖的物流。因此美国以外的人是无法获得奖励。

## 申请硬件奖励的截止日期是什么时间？

要获得资格，整个学校必须注册编程一小时，并在2014年11月14日前完成[硬件申请表](<%= hoc_uri('/prizes') %>)。 在美国各州都将有一所学校收到我们为其班级配备的电脑。 Code.org 将在 2014 年 12 月 1 日前选出获奖者并通过电子邮件告知。

## 赢得科技聊天资格的截止日期是什么时间？

要获得资格，你的教室必须在2014年11月14日前注册编程一小时。 教室将赢得与名人的视频聊天。 Code.org 将在 2014 年 12 月 1 日前选出获奖者并通过电子邮件告知。

## 如果我的学校或教室得奖什么时候会得到通知？

要获得资格，整个学校必须注册编程一小时，并在2014年11月14日前完成[硬件申请表](<%= hoc_uri('/prizes') %>)。 Code.org 将在 2014 年 12 月 1 日前选出获奖者并通过电子邮件告知。

## 如果我们全校没有在计算机科学教育周（十二月8-14日）期间参与编程一小时，我还有获奖资格吗？

Yes, just be sure to submit a logistics plan that outlines how your whole school is participating over a reasonable length of time and register for the Hour of Code by November 14th. <% end %>