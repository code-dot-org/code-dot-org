---

title: <%= hoc_s(:title_prizes_terms) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

# Награди - правила и условия

## Amazon.com or Microsoft’s Windows Store credit:

The Amazon.com and Microsoft’s Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Организаторът избира една от двете награди.

Every organizer must register for the Hour of Code in order to receive the Amazon.com or Microsoft’s Windows Store credit. Ако сте записали цялото училище в Часът на кодирането, всеки преподавател индивидуално трябва да се регистрира като организатор, за да участва в класацията.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com and Microsoft’s Windows Store credit.

<% if @country == 'us' %>

## Комплект от лаптопи (или $10,000 за други технологии) за класа:

Наградата се ограничава само за публични училища К-12 САЩ. За да се класирате, цялото училище трябва да се регистрира за часът на кодирането до 16 ноември 2015 г. Едно училище във всеки щат на САЩ ще получи набор от компютри за един клас. Code.org ще избере и уведоми спечелилите по електронната поща до 1 декември 2015.

Да изясним, това не е лотария или конкурс, включващи чист шанс.

1) Тук няма финансов риск или риск от измама - всяко училище или класната стая могат да участват, без заплащане на Code.org или на друга организация

2) Победителите ще бъдат избрани само сред училищата, където целият клас (или училище) участват в Часът на кодирането, който включва тества колективната работа и умения на ученици и учители.

<% end %>

<%= view :signup_button %>