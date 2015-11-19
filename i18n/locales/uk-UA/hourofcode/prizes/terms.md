* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Призи - умови отримання

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Організатор може отримати лише один такий приз.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Якщо участь братиме уся школа, кожному вчителю потрібно реєструватись окремо.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Клас ноутбуків (або іншої техніки вартістю $10,000):

Приз призначений лише для державних 12-річних шкіл США. To qualify, your entire school must register for the Hour of Code by November 16, 2015. Одна школа у кожному зі штатів США виграє комп'ютерний клас. Code.org will select and notify winners via email by December 1, 2015.

Уточнимо - це не розіграш чи лотерея.

1) Беручи участь ви не берете на себе фінансових зобов'язань - участь може взяти будь-яка школа, без жодних платежів на користь Code.org чи інших організацій

2) Переможців обиратимуть з-поміж шкіл, котрі зареєструють всіх своїх учнів для участі в Годині коду, а також пройдуть колективне тестування навичок як учнів, так і вчителів.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Відео-чат із запрошеним оратором:

Приз призначено для шкіл США та Канади. Code.org випадковим чином обере школи-переможці, надасть часові інтервали для веб-чату та узгодить технологічні деталі з відповідним вчителем. Щоб претендувати на приз, не потрібно реєструвати всю школу. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>