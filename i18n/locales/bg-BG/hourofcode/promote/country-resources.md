* * *

title: <%= hoc_s(:title_country_resources) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

<% if @country == 'la' %>

# Recursos

## Vídeos <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe>
<

p > [ **¿Por qué todos града que aprender programar? Participá де ла Hora del Código en Аржентина (5 мин)**](https://www.youtube.com/watch?v=HrBh2165KjE)

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen></iframe>
<

p>[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=vq6Wpb-WyQ)

<% elsif @country == 'ca' %>

## Видео <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Опитайте уроците:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Всички уроци на Часът на кодирането:**

  * Изискват минимално време за подготовка на организаторите
  * Предвиждат смостоятелна работа, което позволява на учениците да работят по собствените си темпове и ниво на умения

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Планирайте нужният ви хардуер - компютрите са задължителни

Най-добре е Часът на кодирането да се проведе със свързани към Интернет компютри. Но вие не се нуждаете от компютър за всяко дете и дори можете да проведете Часът на кодирането и без компютър.

  * **Преди да започнете урока по програмиране проверете да ли програмата работи.** Уверете се, че звукът и видеото работят.
  * **Пуснете поздравителната страница, за** да видите какво ще виждат учениците, когато приключат уроците. 
  * **Осигурете слушалки за класа си**, или помолете учениците да си донесат собствени, ако изберете уроци за начинаещи- работете най-добре със звук.

## 3) План как да се използва наличната техника

  * **Нямате достатъчно устройства?** Използвайте [ програмиране по двойки](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Когато участниците работят по двойки, те си помагат един на друг и разчитат по-малко на учителя.
  * **Имате слаби машини?** Планирайте показване на видео клиповете пред целия клас, така че да няма нужда учениците да ги стартират на техните компютри. Или опитайте дейностите без компютър.

## 4) Вдъхновете учениците - Покажете им видео

Покажете на учениците вдъхновяващи видео филми за старта на часът на кодирането. Примери:

  * Оригиналният стартиращ Code.org клип, с участието на Бил Гейтс, Марк Зукерберг и НБА звезда Крис Бош (има версии за [ 1 минута](https://www.youtube.com/watch?v=qYZF6oIZtfc), [ 5 минути](https://www.youtube.com/watch?v=nKIu9yen5nc) и [ 9 минути](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Президентът Обама призовава всички ученици да учат компютърни науки](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Ентусиазирайте учениците си - представете им това интро**

<% else %>

# Допълнителни ресурси, Очаквайте скоро!

<% end %>

<%= view :signup_button %>