* * *

title: <%= hoc_s(:title_prizes) %> layout: wide

* * *

<%= view :signup_button %>

<% if @country == 'la' %>

# Награди за всеки организатор

Every educator who hosts an Hour of Code for students receives 10 GB of Dropbox space as a thank you gift!

<% else %>

# Очаквайте скоро наградите за 2015 г!

**Every** educator who organizes an Hour of Code event is eligible to receive a prize. Check back for updates in fall 2015.

<% end %>

# 2014 Час на кода награди

<% if @country == 'us' || @country == 'ca' || @country == 'uk' %>

## Всеки организатор спечели подарък като благодарност {#gift_code}

Every educator who hosted an Hour of Code for students received 10 GB of Dropbox space or $10 Skype credit as a thank you gift!

## 51 щастливи училища ще спечелят набор от преносими компютри (или $10,000 за други технологии)

One lucky school in ***every*** U.S. state (and Washington D.C.) won $10,000 worth of technology. [**See last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners)

<% end %>

<% if @country == 'uk' %>

## 20 lucky classrooms won a video chat with a guest speaker! {#video_chat}

20 lucky classrooms were be invited to join a video chat to celebrate the Hour of Code. Students chatted with tech leaders like [Niklas Zennström](https://www.youtube.com/watch?v=28Uiam6mFeI), the founder of Skype and Kazaa and [Wendy Tan](https://www.youtube.com/watch?v=Xzh54UPe4qg), co-founder and CEO of Moonfruit.

<% end %>

<% if @country == 'us' %>

## 100 класни стаи ще спечелят видео конферентна връзка със специален гост! {#video_chat}

100 lucky classrooms participated in live video Q&As with tech titans and tech-loving celebrities. Students asked questions and chatted with these exciting role models to kick off the Hour of Code.

### Гледайте миналогодишните видео чатове със знаменитости:

<%= view :video_chat_speakers %>

<% end %>

<% if @country == 'ca' %>

## Проекти на Brilliant на стойност $2000 {#brilliant_project}

[Brilliant Labs](http://brilliantlabs.com/hourofcode) provided the resources necessary, up to a value of $2000.00, to implement a technology based, hands on, student centric learning project to one classroom in each province and territory (note: with the exception of Quebec). For more details, terms and conditions, please visit [brilliantlabs.com/hourofcode](http://brilliantlabs.com/hourofcode).

## Щастливи училища ще спечелят Actua семинар {#actua_workshop}

15 lucky schools across Canada were gifted 2 hands-on STEM workshops delivered by one of Actua's [33 Network Members](http://www.actua.ca/about-members/). Actua members deliver science, technology, engineering, and math (STEM) workshops that are connected to provincial and territorial learning curriculum for K-12 students. These in-classroom experiences are delivered by passionate, highly-trained undergraduate student role models in STEM. Teachers can expect exciting demonstrations, interactive experiments and a lot of STEM fun for their students! Please note that in-classroom workshop availability may vary in remote and rural communities.

[Actua](http://actua.ca/) is Canada’s leader in Science, Technology, Engineering, and Math Outreach. Each year Actua reaches over 225,000 youth in over 500 communities through its barrier-breaking programming.

**Congratulations to the 2014 winners!**

| Училище                         | град        | Член Actua мрежата              |
| ------------------------------- | ----------- | ------------------------------- |
| Spencer Middle School           | Виктория    | Научно дружество                |
| Malcolm Tweddle School          | Едмънтън    | DiscoverE                       |
| Britannia Elementary            | Ванкувър    | GEERing Up                      |
| Captain John Palliser           | Калгари     | Minds in Motion                 |
| St. Josaphat School             | Regina      | EYES                            |
| Bishop Roborecki School         | Saskatoon   | SCI-FI                          |
| Dalhousie Elementary School     | Уинипег     | WISE Kid-Netic Energy           |
| Hillfield Strathallan College   | Хамилтън    | Venture Engineering and Science |
| Byron Northview Public School   | Лондон      | Discovery Western               |
| Stanley Public School           | Торонто     | Science Explorations            |
| Ottawa Catholic School Board    | Отава       | Virtual Ventures                |
| École Arc-en-Ciel               | Монреал     | Folie Technique                 |
| Saint Vincent Elementary School | Лавал       | Musee Armand Frappier           |
| Garden Creek School             | Fredericton | Worlds UNBound                  |
| Armbrae Academy                 | Халифакс    | SuperNOVA                       |

## Kids Code Jeunesse помогна и подкрепи класни стаи в Канада! {#kids_code}

[Kids Code Jeunesse](http://www.kidscodejeunesse.org) provided trained computer programming volunteers to support teachers in computer science education. Kids Code Jeunesse is a Canadian not-for-profit aimed at providing every child with the opportunity to learn to code and every teacher the opportunity to learn how to teach computer programming in the classroom.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## 100 класни стаи, печелят набор от програмируеми роботи {#programmable_robots}

[Sphero](http://www.gosphero.com/) is the app-controlled robotic ball changing the way students learn. Powered by [SPRK lessons](http://www.gosphero.com/education/), these round robots give kids a fun crash course in programming while sharpening their skills in math and science. Sphero gave away 100 classroom sets – each including 5 robots. Any classroom (public or private) within the U.S. or Canada was eligible to win this prize.

<% end %>

## Повече въпроси за наградите? {#more_questions}

Check out our [Terms and Conditions](<%= resolve_url('https://code.org/tos') %>) or visit our forum to see [FAQs](http://support.code.org) and ask your questions.

<%= view :signup_button %>