---
from: "Hadi Partovi (Code.org) <hadi_partovi@code.org>"
subject: "¡Gracias por inscribirte para ser anfitrión de una Hora de Código!"
---
  <% hostname = CDO.canonical_hostname('hourofcode.com') %>
  <% codedotorg = CDO.canonical_hostname('code.org') %>

# ¡Gracias por inscribirte para ser anfitrión de una Hora de Código!
Usted está haciendo posible para que los estudiantes de todo el mundo aprendan una Hora de Código que puede cambiar el resto de sus vidas, durante los días del 1 al 7 de octubre. Estaremos en contacto sobre nuevos tutoriales y otras noticias interesantes. ¿Qué puede usted hacer ahora?

## 1. Encuentre a un voluntario local para ayudarle con su evento.
[Buscar en nuestro mapa del voluntariado](https://<%= codedotorg %>/volunteer/local) para que los voluntarios puedan visitar tu aula o hagan un videochat remotamente para inspirar a tus estudiantes acerca de la amplitud de posibilidades con las Ciencias de la Computación.

## 2. Corre la voz
Necesitamos su ayuda para llegar a los organizadores en todo el mundo. ¡Habla a tus amigos de la #HoraDeCódigo! [Use estos recursos útiles](https://<%= hostname %>/promote/resources) para promocionar tu evento.

## 3. Pídele a tu escuela que ofrezca una Hora de Código
[Envíe este correo electrónico](https://<%= hostname %>/promote/resources#sample-emails) o [comparte estos folletos](https://<%= hostname %>/promote/resources) a su director y desafíe a cada clase de su escuela para que se inscriba.

## 4. Pídele a tu compañía que se involucre
[Envia este correo electrónico](https://<%= hostname %>/promote/resources#sample-emails) a tu gerente o director general.

## 5. Promociona la Hora de Código en tu comunidad
Recluta a un grupo local o incluso algunos amigos. [Enviar este correo electrónico](https://<%= hostname %>/promote/resources#sample-emails).

Gracias por dirigir el movimiento para dar a cada estudiante la oportunidad de aprender habilidades informáticas fundacionales.

Hadi Partovi<br />
Fundador, Code.org

<hr/>
<small>
Estás recibiendo este correo electrónico porque usted se registro para la Hora de Código, apoyado por más de 200 socios y organizado por Code.org. Code.org es una 501c3 sin fines de lucro. Nuestra dirección es 1501 4th Avenue, Suite 900, Seattle, WA 98101. ¿No quieres estos correos? [Darse de baja](<%= local_assigns.fetch(:unsubscribe_link, "") %>).
</small>

![](<%= local_assigns.fetch(:tracking_pixel, "") %>)
