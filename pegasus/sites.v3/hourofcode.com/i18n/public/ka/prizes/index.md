---

title: <%= hoc_s(:title_prizes) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

<% if @country == 'la' %>

# პრიზები ყველა ორგანიზატორისთვის

ყოველი პედაგოგი, რომელიც კოდის ერთ საათს ჩაატარებს თავისი მოსწავლეებისთვის მიიღებს საჩუქრად Dropbox-ზე 10GB ადგილს!

<% else %>

# 2015-ის პრიზები

<% end %>

<% if @country == 'us' %>

## 51 სკოლა მთელი კლასისთვის მოიგებს ლეპტოპებს (ან 10 000 დოლარის ღირებულების სხვა ტექნიკას)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

## **ყოველი** მასწავლებელი, რომელიც კოდის ერთი საათის ორგანიზებას გააკეთებს, განიხილება პრიზის მიღების კანდიდატად.

შეამოწმეთ განახლებები 2015 წლის შემოდგომაზე.

## მალე მეტი პრიზი იქნება!