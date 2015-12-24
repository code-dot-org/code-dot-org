* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Premios - términos y condiciones

## Amazon.com, iTunes y crédito de la tienda de Windows:

Amazon.com, iTunes y crédito de la tienda de Windows se limitan a K-12 profesores, educadores de clubes después de la escuela y las organizaciones de educación. El crédito de $10 debe agregarse a una cuenta existente, y el crédito se vence después de 1 año. Limitado a un regalo por organizador.

Cada organizador debe estar registrado para la Hora de Código para poder recibir Amazon.com, iTunes o crédito de la tienda de Windows. Si toda tu escuela participa en la Hora de Código, cada educador debe registrarse individualmente como organizador para calificar.

Code.org se pondrá en contacto con los organizadores después de la Hora de Código (Dic. 7-13) para proporcionar instrucciones y redimir el crédito de la tienda de Windows, iTunes o Amazon.com.

<% if @country == 'us' %>

## Paquete de laptops (ó $10,000 para otras tecnologías):

El premio es para escuelas públicas K-12 en Estados Unidos únicamente. Para competir toda la escuela deberá registrarse para la Hora de Código antes del 16 de noviembre de 2015. Una escuela en cada estado de Estados Unidos podrá ganar un conjunto de computadoras. Code.org seleccionará y notificará a los ganadores vía correo electrónico antes del 1 de Diciembre del 2015.

Debemos aclarar, esto no es una lotería o un concurso de azar.

1) No hay ningún interés o riesgo financiero en la aplicación, cualquier escuela puede participar, sin tener que realizar ningún pago a Code.org o ninguna otra organización

2) Los ganadores se seleccionarán únicamente entre las escuelas donde toda una clase (o escuela) participe en una Hora de Código, lo cual implica un reto a las habilidades colectivas de estudiantes y profesores.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Video chat con un orador invitado:

Este premio está limitado a las aulas K-12 en los Estados Unidos y Canadá únicamente. Code.org seleccionará los grupos ganadores, asignará el horario para la conversación y trabajará con el profesor competente establecer los detalles de la tecnología a usar. No es necesario que toda tu escuela se inscriba para concursar por este premio. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>