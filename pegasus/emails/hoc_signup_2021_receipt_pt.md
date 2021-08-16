---
from: "Hadi Partovi (Code.org) <hadi_partovi@code.org>"
subject: "Obrigado por se inscrever para sediar a Hora do Código!"
---
  <% hostname = CDO.canonical_hostname('hourofcode.com') %>
  <% codedotorg = CDO.canonical_hostname('code.org') %>

# Obrigado por se inscrever para organizar um evento da Hora do Código!
Você está possibilitando que alunos de todo o mundo aprendam uma Hora do Código que pode mudar suas vidas, desde o 1ro de outubro ate o 18 de dezembro. Entraremos em contato para falar sobre novos tutoriais e outras atualizações. Então, o que você pode fazer agora?

## 1. Encontre um voluntário para ajudá-lo no evento.
[Busque em nosso mapa de voluntários](https://<%= codedotorg %>/volunteer/local) voluntários que possam visitar sua sala de aula ou fazer um chat de vídeo remotamente para inspirar seus alunos, falando sobre a imensidão de possibilidades que a Ciência da Computação proporciona.

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
Você está recebendo este e-mail porque você se cadastrou na Hora do Código, apoiada por mais de 200 parceiros e organizada pela Code.org. A Code.org é uma organização sem fins lucrativos. Nosso endereço é: 1501 4th Avenue, Suite 900, Seattle, WA 98101. Não quer receber esses e-mails? [Cancele sua assinatura](<%= local_assigns.fetch(:unsubscribe_link, "") %>).
</small>

![](<%= local_assigns.fetch(:tracking_pixel, "") %>)
