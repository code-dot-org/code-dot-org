* * *

title: <%= hoc_s(:title_stats) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

# Materiais de divulgação e estatísticas úteis

## Use esta breve apresentação nos boletins informativos

### Leve a ciência da computação para sua escola: promova a Hora do Código

Os computadores estão em toda parte, mas menos escolas ensinam ciência da computação hoje do que há 10 anos. A boa notícia é que estamos a caminho de mudar essa realidade. Se você ouviu falar da [Hora do Código](<%= resolve_url('/') %>) do ano passado, sabe que ela marcou a história. Na primeira Hora do Código, 15 milhões de alunos tiveram contato com a ciência da computação. No ano passado, o número aumentou para 60 milhões de alunos! A [Hora do Código](<%= resolve_url('/') %>) é uma introdução de uma hora à ciência da computação, criada para desmistificar a programação e mostrar que todos podem aprender seus fundamentos básicos. [Sign up](<%= resolve_url('/') %>) to host an Hour of Code this <%= campaign_date('full') %> during Computer Science Education Week. To add your school to the map, go to https://hourofcode.com/<%= @country %>

## Infográficos

<%= view :stats_carousel %>

<%= view :signup_button %>