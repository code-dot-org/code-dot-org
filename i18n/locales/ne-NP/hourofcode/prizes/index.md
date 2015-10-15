* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

<% if @country == 'la' %>

# प्रत्के व्यवस्थापकको लागि पुरस्कारहरू

Every educator who hosts an Hour of Code for students receives 10 GB of Dropbox space as a thank you gift!

<% else %>

# २०१५ पुरस्कार

<% end %>

<% if @country == 'us' %>

## ५१ बिद्यालयले कक्षा कोठा ल्यापटप (वा प्रबधिको लागि $१००००)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](%= resolve_url('/prizes/hardware-signup') %) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

## **प्रेतेक ** प्रशिक्षक् जसलेHour of Cod आयोजना गर्छ तो पुरस्कार को लागि योग्य हुनेछ.

Check back for updates in fall 2015.

## धरै पुरस्कारहरु चाडै आउदै छन!