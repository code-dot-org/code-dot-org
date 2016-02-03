* * *

title: <%= hoc_s(:title_stats) %> layout: wide nav: promote_nav

* * *

<%= view :signup_button %>

# Propaganda y estadisticas útiles

## Usar esta breve propaganda en las hojas informativas

### Lleva las Ciencias de Computación a tu escuela o colegio. Empiece con una Hora de Código

Los ordenadores están en todas partes, pero hoy hay menos escuelas que enseñan ciencia de la computación que hace 10 años. La buena noticias es que estamos trabajando para cambiar esto. Si haz oído de la [ Hora de Código](%= resolve_ur('/') %>) el año pasado, sabrás que hizo historia. En la primera Hora de Código, 15 millones de estudiantes probaron ciencias de la computación. El año pasado, ese número incremento a 60 millones de estudiantes! La [Hora de Código](%= resolve_ur('/') %), es una hora de introducción a las ciencias de computación, diseñada para desmitificar lo que se piensa sobre programación y demostrar que cualquiera puede aprender los conceptos básicos. [Registrate](%= resolve_url('/') %) para realizar una Hora de Código esta <%= fecha_campaña('completa') %> durante la Semana de la Educación de Ciencia de la computación. Para añadir tu escuela en el mapa, ir a https://hourofcode.com/<%= @country %>

## Infografías

<%= view :stats_carousel %>

<%= view :signup_button %>