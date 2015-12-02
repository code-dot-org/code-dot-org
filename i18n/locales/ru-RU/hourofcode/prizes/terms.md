* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Призы - положения и условия

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Один выкуп для каждого организатора.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Если вся школа участвует в "Часе Программирования" то, каждый педагог индивидуально должен зарегистрироваться как организатор.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Класс комплект Ноутбуков (или $ 10 000 для других нужд совершенствования процесса обучения информатике):

Приз ограничивается только для К-12 школ США. To qualify, your entire school must register for the Hour of Code by November 16, 2015. Одна школа в каждом штате США получит набор компьютеров для класса. Code.org will select and notify winners via email by December 1, 2015.

To clarify, this is not a sweepstakes or a contest involving pure chance.

1) There is no financial stake or risk involved in applying - any school or classroom may participate, without any payment to Code.org or any other organization

2) Winners will only be selected among schools where the entire classroom (or school) participates in an Hour of Code, which involves a test of the students' and teachers' collective skill.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Видео чат с приглашенным спикером:

Prize limited to K-12 classrooms in the U.S. and Canada only. Code.org will select winning classrooms, provide a time slot for the web chat, and work with the appropriate teacher to set up the technology details. Your whole school does not need to apply to qualify for this prize. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>