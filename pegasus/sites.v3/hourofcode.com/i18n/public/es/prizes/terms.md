---

title: <%= hoc_s(:title_prizes_terms) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

# Premios - términos y condiciones

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Limitado a un regalo por organizador.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. Si toda tu escuela participa en la Hora de Programación, cada educador debe registrarse individualmente como organizador para calificar.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## Paquete de laptops (ó $10,000 para otras tecnologías):

El premio es para escuelas públicas K-12 en Estados Unidos únicamente. Para competir toda la escuela deberá registarse para la Hora de Código antes del 16 de noviembre de 2015. Una escuela en cada estado de Estados Unidos podrá ganar un conjunto de computadoras para toda una generación. Code.org seleccionará y notificará a los ganadores vía correo electrónico antes del 1ro de diciembre de 2014.

Debemos aclarar, esto no es una lotería o un concurso de azar.

1) No hay ningún interés o riesgo financiero en la aplicación, cualquier escuela puede participar, sin tener que realizar ningún pago a Code.org o ninguna otra organización

2) Los ganadores se seleccionarán únicamente entre las escuelas donde toda una clase (o escuela) participe en una Hora de Código, lo cual implica un reto a las habilidades colectivas de estudiantes y profesores.

<% end %>

<%= view :signup_button %>