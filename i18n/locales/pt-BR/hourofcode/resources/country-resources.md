<% if @country == 'la' %>

# Recursos

## Vídeos <iframe width="560" height="315" src="https://www.youtube.com/embed/HrBh2165KjE" frameborder="0" allowfullscreen></iframe>
<

p>[**Por que todos precisam aprender a programar? Participe da Hora do Código na Argentina (5 min)**](https://www.youtube.com/watch?v=HrBh2165KjE)

<% elsif @country == 'uk' %>

# Additional Resources

## Use this handout to recruit corporations

[<img width="500" height="300" src="<%= localized_file('/images/corporations.png') %>" />](<%= localized_file('/files/corporations.pdf') %>)

<% else %>

# Outros recursos em breve!

<% end %>