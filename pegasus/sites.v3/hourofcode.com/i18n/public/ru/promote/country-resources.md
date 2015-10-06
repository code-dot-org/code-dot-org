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

## Видео <iframe width="560" height="315" src="https://www.youtube.com/embed/k3cg1e27zQM" frameborder="0" allowfullscreen></iframe>
<

p>[**Join Nova Scotia for the Hour of Code (3 min)**](https://www.youtube.com/watch?v=k3cg1e27zQM)

<% elsif @country == 'uk' %>

# How-to Guide for Organizations

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_image('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

## 1) Попробуйте видео уроки:

We’ll host a variety of fun, hour-long tutorials, created by a variety of partners. New tutorials are coming to kick off the Hour of Code before <%= campaign_date('full') %>.

**Все уроки Часа Кода:**

  * Require minimal prep-time for organizers
  * Являются интуитивными, позволяя ученикам работать в их собственном темпе и уровне квалификации

[![](https://uk.code.org/images/tutorials.png)](https://uk.code.org/learn)

## 2) Определите вашу потребность в оборудовании - компьютеры не обязательны

The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every participant, and can even do the Hour of Code without a computer at all.

  * **Протестируйте учебники на компьютерах или других электронных устройствах ученика.** Убедитесь, что они работают должным образом (со звуком и видео).
  * **Просмотрите страницу поздравления,** чтобы увидеть то, что студенты будут видеть, по окончанию задания. 
  * **Provide headphones for your group**, or ask students to bring their own, if the tutorial you choose works best with sound.

## 3) Планируйте заранее, основываясь на доступных вам технологиях

  * **Нет достаточного количества устройств?** Используйте [парное программирование](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). When participants partner up, they help each other and rely less on the teacher.
  * **Низкая пропускная способность интернет соединения?** Покажите видео всему классу, чтобы каждый ученик не загружал видео на свое устройство. Или попробуйте оффлайн учебники.

## 4) Вдохновите учеников - покажите им видео

Покажите ученикам вдохновляющее видео, чтобы открыть "Час кода". Примеры:

  * Оригинальное начальное видео от Code.org, в котором вы сможете увидеть Билла Гейтса, Марка Цукерберга и звезду NBA Криса Боша ([1минутная версия](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5-минутная версия](https://www.youtube.com/watch?v=nKIu9yen5nc) и [9-минутная версия](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ)
  * [ПРезидент Обама призывает всех учеников изучать компьютерные науки](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Заинтересуйте ваших учеников - начните с небольшого вступления**

<% else %>

# Additional resources coming soon!

<% end %>

<%= view :signup_button %>