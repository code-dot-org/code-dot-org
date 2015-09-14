<% if @country == 'la' %>

# Recursos

## Vídeos <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe>
<

p > [ **¿Por qué todos града que aprender programar? Participá де ла Hora del Código en Аржентина (5 мин)**](https://www.youtube.com/watch?v=HrBh2165KjE)

<% elsif @country == 'uk' %>

# Допълнителни ресурси

## Използвайте това изложение, за да ангажирате корпорациите

[<img width="500" height="300" src="<%= localized_file('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

<% else %>

# Допълнителни ресурси, Очаквайте скоро!

<% end %>