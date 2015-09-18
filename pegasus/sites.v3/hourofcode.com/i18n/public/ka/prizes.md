---

title: <%= hoc_s(:title_prizes) %>
layout: wide

---

<%= view :signup_button %>

<% if @country == 'la' %>

# პრიზები ყველა ორგანიზატორისთვის

ყოველი პედაგოგი, რომელიც კოდის ერთ საათს ჩაატარებს თავისი მოსწავლეებისთვის მიიღებს საჩუქრად Dropbox-ზე 10GB ადგილს!

<% else %>

# 2015 წლის საჩუქრები - მალე!

**ყოველი** პედაგოგი, რომელიც გაუწევს ორგანიზებას კოდის ერთ საათს, მიირებს პრიზს. შეამოწმეთ სიახლეები 2015 წლის შემოდგომაზე.

<% end %>

# 2014 წლის კოდის ერთი საათის პრიზები

<% if @country == 'us' || @country == 'ca' || @country == 'uk' %> <a id="gift_code"></a>

## Every organizer won a thank you gift

ყოველმა პედაგოგმა, რომელმაც ორგანიზება გაუწია კოდის ერთ საათს თავისი მოსწავლეებისთვის, მადლობის ნიშნად მიიღო Dropbox ადგილის 10GB ან 10 დოლარის Skype კრედიტები!

## 51-მა სკოლამ მოიგო ლეპტოპები მთელი კლასისთვის (ან 10 000 დოლარის ღირებულების სხვა ტექნიკა)

აშშ-ის ***ყოველ*** შტატში (და ვაშინგტონის ოლქში) თითო იღბლიანმა სკოლამ მოიგო 10 000 დოლარის ღირებულების ტექნიკა. [**ნახეთ შარშანდელი გამარჯვებულები**](http://codeorg.tumblr.com/post/104109522378/prize-winners)

<% end %>

<% if @country == 'uk' %>

<a id="video_chat"></a>

## 20 lucky classrooms won a video chat with a guest speaker!

20 lucky classrooms were be invited to join a video chat to celebrate the Hour of Code. Students chatted with tech leaders like [Niklas Zennström](https://www.youtube.com/watch?v=28Uiam6mFeI), the founder of Skype and Kazaa and [Wendy Tan](https://www.youtube.com/watch?v=Xzh54UPe4qg), co-founder and CEO of Moonfruit.

<% end %>

<% if @country == 'us' %>

<a id="video_chat"></a>

## 100 classrooms won a video chat with a guest speaker!

100 lucky classrooms participated in live video Q&As with tech titans and tech-loving celebrities. Students asked questions and chatted with these exciting role models to kick off the Hour of Code.

### უყურეთ შარშანდელ ვიდეოჩატებს:

<%= view :video_chat_speakers %>

<% end %>

<% if @country == 'ca' %>

<a id="brilliant_project"></a>

## $2000 Brilliant Project

[Brilliant Labs](http://brilliantlabs.com/hourofcode) provided the resources necessary, up to a value of $2000.00, to implement a technology based, hands on, student centric learning project to one classroom in each province and territory (note: with the exception of Quebec). For more details, terms and conditions, please visit [brilliantlabs.com/hourofcode](http://brilliantlabs.com/hourofcode).

<a id="actua_workshop"></a>

## Lucky Schools won an Actua Workshop

15 lucky schools across Canada were gifted 2 hands-on STEM workshops delivered by one of Actua's [33 Network Members](http://www.actua.ca/about-members/). Actua members deliver science, technology, engineering, and math (STEM) workshops that are connected to provincial and territorial learning curriculum for K-12 students. These in-classroom experiences are delivered by passionate, highly-trained undergraduate student role models in STEM. Teachers can expect exciting demonstrations, interactive experiments and a lot of STEM fun for their students! Please note that in-classroom workshop availability may vary in remote and rural communities.

[Actua](http://actua.ca/) is Canada’s leader in Science, Technology, Engineering, and Math Outreach. Each year Actua reaches over 225,000 youth in over 500 communities through its barrier-breaking programming.

**Congratulations to the 2014 winners!**

| სკოლა                          | ქალაქი       | Actua ქსელის წევრი              |
| ------------------------------ | ------------ | ------------------------------- |
| სპენსერის საშუალო სკოლა        | ვიქტორია     | Science Venture                 |
| მალკოლმ ტვიდლის სკოლა          | ედმონტონი    | DiscoverE                       |
| საშუალო სკოლა Britannia        | ვანკუვერი    | GEERing Up                      |
| Captain John Palliser          | კალგარი      | Minds in Motion                 |
| წმ. ჟოზაფათის სკოლა            | რეგინა       | EYES                            |
| ეპისკოპოს რობორეცკის სკოლა     | სასკატუნი    | SCI-FI                          |
| დალჰაუსის საშუალო სკოლა        | ვინიპეგი     | WISE Kid-Netic Energy           |
| ჰილფილს სტრატჰალანის კოლეჯი    | ჰემილტონი    | Venture Engineering and Science |
| ბაირონ ნოთვიუს საჯარო სკოლა    | ლონდონი      | Discovery Western               |
| სტენლის საჯარო სკოლა           | ტორონტო      | Science Explorations            |
| ოტავას კათოლიკური სკოლის საბჭო | ოტავა        | Virtual Ventures                |
| École Arc-en-Ciel              | მონრეალი     | Folie Technique                 |
| სან ვინსენტის საშუალო სკოლა    | ლავალი       | Musee Armand Frappier           |
| ბერძნული სკოლა გარდენი         | ფრედერიკტონი | Worlds UNBound                  |
| Armbrae Academy                | ჰალიფაქსი    | SuperNOVA                       |

<a id="kids_code"></a>

## Kids Code Jeunesse helped support classrooms across Canada!

[Kids Code Jeunesse](http://www.kidscodejeunesse.org) provided trained computer programming volunteers to support teachers in computer science education. Kids Code Jeunesse is a Canadian not-for-profit aimed at providing every child with the opportunity to learn to code and every teacher the opportunity to learn how to teach computer programming in the classroom.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

<a id="programmable_robots"></a>

## 100 classrooms won a set of programmable robots

[Sphero](http://www.gosphero.com/) is the app-controlled robotic ball changing the way students learn. Powered by [SPRK lessons](http://www.gosphero.com/education/), these round robots give kids a fun crash course in programming while sharpening their skills in math and science. Sphero gave away 100 classroom sets – each including 5 robots. Any classroom (public or private) within the U.S. or Canada was eligible to win this prize.

<% end %>

<a id="more_questions"></a>

## More questions about prizes?

Check out our [Terms and Conditions](<%= resolve_url('https://code.org/tos') %>) or visit our forum to see [FAQs](http://support.code.org) and ask your questions.

<%= view :signup_button %>