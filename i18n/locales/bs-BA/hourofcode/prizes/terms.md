* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Nagrade - pojmovi i postavke

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Ograniči jedno otkupljenje po organizatoru.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Ako cijela škola sudjeluje na Satu programiranja, svaki edukator se zasebno mora registrirati kao organizator kako bi se kvalificirao.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Skup klasa za prijenosna računala (ili $10,000 za druge tehnologije):

Nagrada ograničena za javne SAD K-12 škole. To qualify, your entire school must register for the Hour of Code by November 16, 2015. Jedna škola u svakoj državi SAD-a će dobiti računala za cijelu učionicu. Code.org will select and notify winners via email by December 1, 2015.

To clarify, this is not a sweepstakes or a contest involving pure chance.

1) There is no financial stake or risk involved in applying - any school or classroom may participate, without any payment to Code.org or any other organization

2) Winners will only be selected among schools where the entire classroom (or school) participates in an Hour of Code, which involves a test of the students' and teachers' collective skill.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video razgovor sa gostujućim govornikom:

Prize limited to K-12 classrooms in the U.S. and Canada only. Code.org will select winning classrooms, provide a time slot for the web chat, and work with the appropriate teacher to set up the technology details. Your whole school does not need to apply to qualify for this prize. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>