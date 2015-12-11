* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Shpërblime - termat dhe kushtet

## Amazon.com, iTunes dhe Windows Store:

Kreditet e Amazon.com, iTunes dhe Windows Store janë të limituara për fakultetet K-12, mësuesit e klubeve të mbasdites dhe organizim edukativ. Krediti me vlerë 10$ duhet të shtohet në një llogari eksistuese dhe ky kredit skadon pas 1 viti. Organizatori ka vetëm një mundësi për rikthim të krediteve.

Çdo organizator duhet të regjistrohet në Orën e Kodimit për të siguruar kredit në Amazon.com, iTunes ose Windows Store. Nëse shkolla juaj është pjesëmarrëse e Orës së Kodimit, çdo institucion mësimor duhet të regjistrohet për tu kualifikuar si organizator.

Code.org do të kontaktoj çdo organizator pas seancave të Orës së Kodimit (Dhjetor 8-14) me udhëzimet se si mund të rikuperosh kreditin në Amazon.com, iTunes and Windows Store.

<% if @country == 'us' %>

## Set laptopësh për klasën (ose $10,000 për mjete tjera teknologjike):

Shpërblim i dedikuar vetëm për shkollat Amerikane deri në klasë të 12-të. Për t'u kualifikuar, shkolla juaj duhet të regjistrohet për Orën e Kodimit jo më larg se 16 nëntor, 2015. Një shkollë nga çdo shtet në ShBA do të marrë një set kompjuterash për klasa. Code.org do të përzgjedh dhe do të njoftojë fituesit përmes email-it, në 1 dhjetor 2015.

Sa për sqarim, kjo nuk është një garë apo kompeticion që bazohet vetëm në fat.

1) Aplikimi juaj nuk ka ndonje rrezik financiarë - çdo shkollë apo klasë mund të marr pjesë pa pagesë tek Code.org ose organizata të ndryshme

2) Fituesit përzgjidhen vetëm nga shkollat ku e gjithë klasa (ose shkolla) ka qenë pjesëmarrëse në Orën e Kodimit, në të cilën përfshihen testet e nxënesve dhe mësuesve në vlerësimin e aftësive kolektive.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Komunikim përmes videos me mysafirin e ftuar:

Shpërblime të dedikuara vetëm për nxënësit deri në klasë të 12-të në Shba dhe Kanada. Code.org do të përzgjedh klasën fituese, përcaktoje kohën kur të realizohet komunikim përmes web-it, dhe do të koordinojë mësimdhënësit për të përcaktuar detajet tjera teknologjike. Jo e gjithë shkolla juaj duhet të aplikoje për të kandiduar për shpërblim. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>