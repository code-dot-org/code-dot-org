* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Shpërblime - termat dhe kushtet

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Organizatori ka vetëm një mundësi për rikthim të krediteve.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Nëse shkolla juaj është pjesëmarrëse e Orës së Kodimit, çdo institucion mësimor duhet të regjistrohet për tu kualifikuar si organizator.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Set laptopësh për klasën (ose $10,000 për mjete tjera teknologjike):

Shpërblim i dedikuar vetëm për shkollat Amerikane deri në klasë të 12-të. Për t'u kualifikuar, shkolla juaj duhet të regjistrohet për Orën e Kodimit jo më larg se 16 nëntor, 2015. Një shkollë nga çdo shtet në ShBA do të marrë një set kompjuterash për klasa. Code.org do të përzgjedh dhe do të njoftojë fituesit përmes email-it, në 1 dhjetor 2015.

Sa për sqarim, kjo nuk është një garë apo kompeticion që bazohet vetëm në fat.

1) Aplikimi juaj nuk ka ndonje rrezik financiarë - çdo shkollë apo klasë mund të marr pjesë pa pagesë tek Code.org ose organizata të ndryshme

2) Fituesit përzgjidhen vetëm nga shkollat ku e gjithë klasa (ose shkolla) ka qenë pjesëmarrëse në Orën e Kodimit, në të cilën përfshihen testet e nxënesve dhe mësuesve në vlerësimin e aftësive kolektive.

<% end %>

<%= view :signup_button %>