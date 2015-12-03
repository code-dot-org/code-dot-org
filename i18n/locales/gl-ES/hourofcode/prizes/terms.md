* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Premios - términos e condicións

## Crédito en Amazon.com, iTunes e Windows Store:

O crédito de Amazon.com, iTunes e Windows store limítase a mestres de ensinanzas primarias e secundarias, educadores de clubes e organizacións educativas. O crédito de $10 debe engadirse a unha conta existente, e devandito crédito expira despois dun ano. Limite un premio por organizador.

Todo organizador debe rexistrase para a Hora do Código para poder recibir o crédito de Amazon.com, iTunes ou Windows Store. Se todo o seu colexio participa na Hora do Código, cada docente debe rexistrarse individualmente como organizador para clasificarse.

Code.org poráse en contacto cos organizadores despois da Hora do Código (7-13 de Decembro) para darenlles instruccións para utilizar o crédito de Amazon.com, iTunes e Windows Store.

<% if @country == 'us' %>

## Conjunto de ordenadores portátiles para una clase (o $10.000 para outro material tecnolóxico):

Premio limitado a colexios públicos de ensino básico e medio dos Eua. Para poder participar, o seu colexio enteiro debe rexistrars para a Hora do Código antes do 16 de Novembro de 2015. Un colexio en cada estado recibirá un conjunto de ordenadores para su aula. Code.org seleccionará e notificará ós gañadores por email o día 1 de Decembro de 2015.

Debemos aclarar que esto non é un sorteo nin un concurso de azar.

1) A solicitude non reporta ningún interese nen risco financierio, calquera colexio e clase pode participar, sen ter que realizar ningun pago a Code.org nin a ningunha outra organización

2) Os gañadores serán seleccionados únicamente de entre os colexios donde toda unha clase (ou colexio) teña participado na Hora do código, o cual supón un reto para as habilidades colectivas tanto de mestres como de estudantes.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video chat with a guest speaker:

Prize limited to K-12 classrooms in the U.S. and Canada only. Code.org will select winning classrooms, provide a time slot for the web chat, and work with the appropriate teacher to set up the technology details. Your whole school does not need to apply to qualify for this prize. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>