---
title: <%= hoc_s(:title_partners) %>
---
Час Кода управляется Консультативными и Обзорными Комитетами Часа Кода и Недели Изучения Компьютерных Наук.

[Консультативный комитет](<%= resolve_url('/advisory-committee') %>) состоит из представителей среднего школьного образования, высшего образования, некоммерческих, коммерческих и международных организаций. Этот комитет управляет стратегией компании Часа Кода.

[Обзорный Комитет](<%= resolve_url('/review-committee') %>) состоит из 15 педагогов всех классов среднего школьного образования, которые оценивают и рекомендуют мероприятия, используя пояснения Консультативного Комитета. Эти педагоги изучают планы заданий для самостоятельного выполнения и под руководством учителя, предоставленные сотнями партнеров, оценивают образовательную ценность заданий, способность привлечь учащихся и потенциальную привлекательность для различных групп учеников.

Работа и самоотверженность обоих комитетов способствовали успеху Часа Кода и его видению о доступности знакомства с компьютерными науками для любого ученика.

<% if @country == 'la' %>

# Партнеры из Латинской Америки

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Партнеры из Африки

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Партнеры из Австралии

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Партнеры из Китая

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Партнеры из Франции

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Партнеры из Индонезии

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Партнеры из Ирландии

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Партнеры из Индии

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Партнеры из Японии

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Партнеры из Нидерландов

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Партнеры из Новой Зеландии

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Партнеры из Великобритании

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Партнеры из Канады

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Основные Партнеры и Корпоративные Спонсоры

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

---

# Основные Рекламные Партнеры

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

---

# Международные Партнеры

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

---

# Образовательные Партнеры

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# Инфраструктурные и Инструментальные Партнеры

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# Остальные Партнеры

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>