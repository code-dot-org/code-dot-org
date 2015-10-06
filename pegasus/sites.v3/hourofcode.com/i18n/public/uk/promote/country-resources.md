---

title: <%= hoc_s(:title_country_resources) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

<% if @country == 'la' %>

# Recursos

## Vídeos <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe>
<

p>[**¿Por qué todos tienen que aprender a programar? Participá de la Hora del Código en Argentina (5 min)**](https://www.youtube.com/watch?v=HrBh2165KjE)

  
 <iframe width="560" height="315" src="https://www.youtube.com/embed/_vq6Wpb-WyQ" frameborder="0" allowfullscreen></iframe>
<

p>[**La Hora del Código en Chile (2 min)**](https://www.youtube.com/watch?v=vq6Wpb-WyQ)

<% elsif @country == 'ca' %>

## Відео <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Спробуйте підручники:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Всі підручники Години коду:**

  * Require minimal prep-time for organizers
  * Призначені для самостійного навчання - дозволяючи учням працювати у власному темпі відповідно до свого рівня знань

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Визначтеся з потребами - комп'ютери не обов'язкові

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Перевірте підручники на учнівських комп'ютерах чи інших пристроях.** Переконайтесь, що все працює коректно (зі звуком та відео).
  * **Ознайомтесь з вітальною сторінкою**, яку побачать учні після завершення роботи. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Виходьте з наявних можливостей

  * **Мало комп'ютерів?** Застосовуйте [парне програмування](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Поганий Інтернет?** Сплануйте фронтальний перегляд відео-роликів, щоб зменшити завантаження учнівських комп'ютерів. Або спробуйте безмашинні чи оффлайнові вправи.

## 4) Надихайте учнів - покажіть відео-ролики

Покажіть учням надихаючі відео для початку Години коду. Приклади:

  * Перше відео від Code.org, у ролях Біл Гейтс, Марк Цукерберг, зірка НБА Кріс Бош (Існують версії на [1 хвилину](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 хвилин](https://www.youtube.com/watch?v=nKIu9yen5nc), та [9 хвилин](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [Заклик Президента Обами до всіх учнів - вивчати програмування](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Запаліть учнів - проведіть короткий вступ**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>