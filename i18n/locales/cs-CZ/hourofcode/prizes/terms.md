* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Ceny - podmínky

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Omezení na jednu odměnu na organizátora.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Jestli-li se vaše celá škola zúčastní Hodiny kódu, každý pedagog se musí jednotlivě zaregistrovat jako organizátor, aby získal právo na cenu.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Sada notebooků (nebo pro jiné technologie za 10 000 dolarů) pro třídu:

Cena je omezená pouze na USA veřejné K-12 školy. To qualify, your entire school must register for the Hour of Code by November 16, 2015. Jedna škola v každém státě USA obdrží sadu počítačů pro třídu. Code.org will select and notify winners via email by December 1, 2015.

To clarify, this is not a sweepstakes or a contest involving pure chance.

1) There is no financial stake or risk involved in applying - any school or classroom may participate, without any payment to Code.org or any other organization

2) Winners will only be selected among schools where the entire classroom (or school) participates in an Hour of Code, which involves a test of the students' and teachers' collective skill.

<% end %>

<%= view :signup_button %>