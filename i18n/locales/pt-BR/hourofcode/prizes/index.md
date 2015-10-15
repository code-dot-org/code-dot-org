* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

<% if @country == 'la' %>

# Prêmios para os organizadores

Todos os educadores que sediarem uma Hora do Código para estudantes recebem 10 GB de espaço no Dropbox como forma de agradecimento!

<% else %>

# Prêmios de 2015

<% end %>

<% if @country == 'us' %>

## 51 escolas ganharão kits de laptops para as salas de aula (ou o equivalente a US$10.000 em tecnologia)

Uma escola sorteada de *cada* Estado dos EUA (e de Washington D.C.) ganhará o equivalente a US$10.000 em tecnologia. [Cadastre-se aqui](%= resolve_url('/prizes/hardware-signup') %) para participar e [**veja os vencedores do ano passado**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

## **Todo** educador que organizar um evento da Hora do Código pode concorrer a um prêmio.

Procure por atualizações em outubro de 2015.

## Mais prêmios serão anunciados em breve!