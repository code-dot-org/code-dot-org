---
<% 
if %w(co la pe).include? @country 
  inSpanish = true
  subject = "¡Gracias por inscribirte para ser anfitrión de una Hora de Código!"
elsif @country == "br" 
  inPortuguese = true
  subject = "Obrigado por se inscrever para sediar a Hora do Código!"
else
  inSpanish, inPortuguese = false
  subject = "Thanks for signing up to host an Hour of Code!"
end
%>
from: "Hadi Partovi (Code.org) <hadi_partovi@code.org>"
subject: <%= subject %>
litmus_tracking_id: "5g5lyi1a"
---
<% hostname = CDO.canonical_hostname('hourofcode.com') %>

<% if inSpanish %>

# ¡Gracias por inscribirte para ser anfitrión de una Hora de Código!

Usted está haciendo posible para que los estudiantes de todo el mundo aprendan una Hora de Código que puede cambiar el resto de sus vidas, durante los días del 3 al 7 de octubre.

#### Estaremos en contacto sobre nuevos tutoriales y otras noticias interesantes. ¿Qué puede usted hacer ahora?

## 1. Encuentre a un voluntario local para ayudarle con su evento.
[Buscar en nuestro mapa del voluntariado](https://code.org/volunteer/local) para que los voluntarios puedan visitar tu aula o hagan un videochat remotamente para inspirar a tus estudiantes acerca de la amplitud de posibilidades con las Ciencias de la Computación.

## 2. Corre la voz
We need your help to reach organizers worldwide. Tell your friends about the #HourOfCode. [Use these helpful resources](https://<%= hostname %>/promote/resources) to promote your event.

## 3. Recruit your whole school for the Hour of Code
[Envíe este correo electrónico](https://<%= hostname %>/promote/resources#sample-emails) o [comparte estos folletos](https://<%= hostname %>/promote/resources) a su director y desafíe a cada clase de su escuela para que se inscriba.

## 4. Pídele a tu compañía que se involucre
[Envia este correo electrónico](https://<%= hostname %>/promover/recursos #muestra-mensajes de correo electrónico) a tu gerente o director general.

## 5. Promociona la Hora de Código en tu comunidad
Recluta a un grupo local o incluso algunos amigos. [Enviar este correo electrónico](https://<%= hostname %>/promote/resources#sample-emails).

Gracias por dirigir el movimiento para dar a cada estudiante la oportunidad de aprender habilidades informáticas fundacionales.

Hadi Partovi<br />
Fundador, Code.org

<hr/>
<small>
Estás recibiendo este correo electrónico porque usted se registro para la Hora de Código, apoyado por más de 200 socios y organizado por Code.org. Code.org es una 501c3 sin fines de lucro. Nuestra dirección es 1501 4th Avenue, Suite 900, Seattle, WA 98101. ¿No quieres estos correos? [Darse de baja](<%= unsubscribe_link %>).
</small>

<% elsif inPortuguese %>

# Obrigado por se inscrever para organizar um evento da Hora do Código!

Você está possibilitando que alunos de todo o mundo aprendam uma Hora do Código que pode mudar suas vidas, no período de 3 a 7 de outubro.

#### Entraremos em contato para falar sobre novos tutoriais e outras atualizações. Então, o que você pode fazer agora?

## 1. Encontre um voluntário para ajudá-lo no evento.
[Busque em nosso mapa de voluntários](https://code.org/volunteer/local) voluntários que possam visitar sua sala de aula ou fazer um chat de vídeo remotamente para inspirar seus alunos, falando sobre a imensidão de possibilidades que a Ciência da Computação proporciona.

## 2. Divulgue
Precisamos da sua ajuda para alcançar organizadores do mundo todo. Fale para os seus amigos sobre a #HoraDoCodigo. [Use estes recursos](https://<%= hostname %>/promote/resources) para promover seu evento.

## 3. Convide sua escola inteira para participar da Hora do Código
[Envie este e-mail](https://<%= hostname %>/promote/resources#sample-emails) para o diretor ou [compartilhe estes materiais](https://<%= hostname %>/promote/resources).

## 4. Peça para que sua empresa participe
[Envie este e-mail](https://<%= hostname %>/promote/resources#sample-emails) para seu gerente ou CEO.

## 5. Promova a Hora do Código na sua comunidade
Reúna um grupo da sua região ou mesmo alguns amigos. [Envie este e-mail](https://<%= hostname %>/promote/resources#sample-emails).

Obrigado por participar deste movimento e por dar aos alunos a chance de aprender as habilidades básicas da Ciência da Computação.

Hadi Partovi<br />
Fundador da Code.org

<hr/>
<small>
Você está recebendo este e-mail porque você se cadastrou na Hora do Código, apoiada por mais de 200 parceiros e organizada pela Code.org. A Code.org é uma organização sem fins lucrativos. Nosso endereço é: 1501 4th Avenue, Suite 900, Seattle, WA 98101. Não quer receber esses e-mails? [Cancele sua assinatura](<%= unsubscribe_link %>).
</small>

<% else %>

# Thanks for signing up to host an Hour of Code!

You're making it possible for students all around the world to learn one Hour of Code that can change the rest of their lives, during December 5-11.

#### We'll be in touch about new tutorials and other exciting updates. What can you do now?

## 1. Find a local volunteer to help you with your event.
[Search our volunteer map](https://code.org/volunteer/local) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 2. Spread the word
We need your help to reach organizers worldwide. Tell your friends about the #HourOfCode. [Use these helpful resources](https://<%= hostname %>/promote/resources) to promote your event.

## 3. Recruit your whole school for the Hour of Code
[Send this email](https://<%= hostname %>/promote/resources#sample-emails) to your principal or [share these handouts](https://<%= hostname %>/promote/resources).

## 4. Ask your employer to get involved
[Send this email](https://<%= hostname %>/promote/resources#sample-emails) to your manager, or the CEO.

## 5. Promote the Hour of Code in your community
Recruit a local group or even some friends. [Send this email](https://<%= hostname %>/promote/resources#sample-emails).

Thank you for leading the movement to give every student the chance to learn foundational computer science skills. 

Hadi Partovi<br />
Founder, Code.org

<hr/>
<small>
You're receiving this email because you signed up for the Hour of Code, supported by more than 200 partners and organized by Code.org. Code.org is a 501c3 non-profit. Our address is 1501 4th Avenue, Suite 900, Seattle, WA 98101. Don't want these emails? [Unsubscribe](<%= unsubscribe_link %>).
</small>

<% end %>

![](<%= tracking_pixel %>)
