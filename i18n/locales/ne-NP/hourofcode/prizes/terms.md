* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# पुरस्कार - नियम र शर्तहरू

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. आयोजक प्रति एक छुटकारा सिमित छ.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. यदि सम्पूर्ण स्कूल Hour of Code को बेला मा सहभागी हुन्छभने, प्रत्येक शिक्षाविद्ले व्यक्तिगत आयोजकको रूपमा दर्ता गर्नै पर्छ.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## ल्याप्टपहरुका क्लास-सेट (वा $१०,००० बराबर को अरु प्रविधिक समान):

पुरस्कार U.S. को K-12 सावर्जनिक स्कूल को लागि मात्र सिमित छ. To qualify, your entire school must register for the Hour of Code by November 16, 2015. U.S को हरेक इसतेत को हरेक स्कूलले क्लास-सेट कम्प्युटरहरु पौने छन्. Code.org will select and notify winners via email by December 1, 2015.

To clarify, this is not a sweepstakes or a contest involving pure chance.

1) There is no financial stake or risk involved in applying - any school or classroom may participate, without any payment to Code.org or any other organization

2) Winners will only be selected among schools where the entire classroom (or school) participates in an Hour of Code, which involves a test of the students' and teachers' collective skill.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## अतिथि वक्ता सँग भिडियो च्याट् :

Prize limited to K-12 classrooms in the U.S. and Canada only. Code.org will select winning classrooms, provide a time slot for the web chat, and work with the appropriate teacher to set up the technology details. Your whole school does not need to apply to qualify for this prize. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>