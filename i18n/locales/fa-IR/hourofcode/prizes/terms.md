* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# جوایز - شرایط و ضوابط

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Limit one redemption per organizer.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. If your entire school participates in the Hour of Code, each educator must individually register as an organizer to qualify.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## کلاس مجموعه ای از لپ تاپ ها (یا 10.000 دلار برای فن آوری دیگر):

Prize limited to public K-12 U.S. schools only. To qualify, your entire school must register for the Hour of Code by November 16, 2015. One school in every U.S. state will receive a class-set of computers. Code.org will select and notify winners via email by December 1, 2015.

To clarify, this is not a sweepstakes or a contest involving pure chance.

1) There is no financial stake or risk involved in applying - any school or classroom may participate, without any payment to Code.org or any other organization

2) Winners will only be selected among schools where the entire classroom (or school) participates in an Hour of Code, which involves a test of the students' and teachers' collective skill.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## چت تصویری با مهمان سخنران :

محدودیت جایزه تنها به K-12 کلاس درس در ایالات متحده و کانادا داده میشود. Code.org will select winning classrooms, provide a time slot for the web chat, and work with the appropriate teacher to set up the technology details. Your whole school does not need to apply to qualify for this prize. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>