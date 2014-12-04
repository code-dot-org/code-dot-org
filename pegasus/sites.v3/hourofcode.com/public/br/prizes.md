
<div class="row">
  <h1 class="col-sm-9">
    Prêmios para os organizadores
  </h1>
  
  <div class="col-sm-3 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Inscreva-se para concorrer</button></a>
  </div>
</div>

<% if @country == 'us' %>

## Uma sala de aula ganhará uma viagem para Washington, D.C. para participar de uma Hora do Código histórica e altamente confidencial! {#dc}

A Code.org vai sortear uma sala de aula para participar de um evento muito especial da Hora do Código na capital dos EUA — tão especial que todos os detalhes são confidenciais! Os alunos vencedores (e seus acompanhantes) desfrutarão de uma viagem com todas as despesas pagas para Washington D.C. Os alunos terão um dia inteiro de atividades supersecretas na segunda-feira, dia 8 de dezembro.

<% end %>

<% if @country == 'us' %>

<h2 id="hardware_prize" style="font-size: 18px">
  Além disso, 51 escolas ganharão kits de laptops para as salas de aula (ou o equivalente a US$10.000 em tecnologia)
</h2>

Uma escola sorteada de ***cada*** Estado dos EUA (+ Washington D.C.) ganhará o equivalente a US$10.000 em tecnologia. Organize a Hora do Código para que todos os alunos da sua escola possam concorrer. **O prazo para o envio acabou. Os vencedores serão anunciados em breve.**

<% end %>

<% if @country == 'us' %>

### Quais são suas chances de ganhar?

[Veja uma lista das escolas](/events) inscritas na Hora do Código do seu Estado. Uma escola pública de ensino fundamental e médio de cada Estado dos EUA ganhará kits de laptops para suas salas de aula. <% end %>

<% if @country == 'uk' %>

## As salas de aula sorteadas ganharão um chat de vídeo com um convidado especial! {#video_chat}

Ao todo, 20 salas de aula sorteadas serão convidadas para participar de um chat com vídeo para comemorar a Hora do Código, de 8 a 14 de dezembro. Seus alunos poderão fazer perguntas e conversar com os líderes do setor da tecnologia. **O prazo para o envio acabou. Os vencedores serão anunciados em breve.**

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Ao todo, 100 salas de aula ganharão um chat de vídeo com um convidado especial! {#video_chat}

Dentre as salas de aula participantes, 100 sorteadas serão convidadas para participar de uma sessão de vídeo de Perguntas frequentes ao vivo, com os gênios da tecnologia e as celebridades adeptas dessa ciência. Os alunos poderão fazer perguntas e conversar com esses incríveis ídolos para iniciar sua Hora do Código.

Qualquer sala de aula (pública ou particular) dos EUA ou do Canadá pode concorrer a este prêmio. Não é preciso que toda a sua escola se inscreva. **O prazo para o envio acabou. Os vencedores serão anunciados em breve.**

### Celebridades que participarão do chat com vídeo este ano:

<%= view :video_chat_speakers %>

<% end %>

## Todos os organizadores ganharão um código-presente em forma de agradecimento

Todos os organizadores que sediarem uma Hora do Código para os alunos receberão 10 GB de espaço no Dropbox ou US$10 de crédito no Skype, como forma de agradecimento!

<% if @country == 'ca' %>

## Projeto brilhante de US$2.000 {#brilliant_project}

O [Brilliant Labs](http://brilliantlabs.com/hourofcode) fornecerá os recursos necessários, no valor máximo de US$2.000,00, para complementar um projeto de aprendizado prático, focado no aluno e baseado em tecnologia, para uma sala de aula de cada distrito e região (observação: exceto para o Quebec). Para concorrer, os professores devem se inscrever em hourofcode.com/ca#signup até o dia 6 de dezembro de 2014. Para saber mais detalhes, termos e condições, visite o site [brilliantlabs.com/hourofcode](http://brilliantlabs.com/hourofcode).

## As escolas sorteadas ganharão uma oficina da Actua {#actua_workshop}

Dentre as escolas do Canadá, as 15 sorteadas ganharão 2 oficinas práticas das áreas de Ciência, Tecnologia, Engenharia e Matemática (STEM, na sigla em inglês), realizadas por um dos [33 membros da rede](http://www.actua.ca/about-members/) Actua. Os membros da Actua oferecem oficinas de STEM, conectadas a um currículo de aprendizado regional e territorial para os alunos dos ensinos fundamental e médio. Essas experiências em sala de aula são oferecidas por alunos-modelo, altamente capacitados e motivados, formados em cursos de STEM. Os professores podem contar com demonstrações animadoras, experiências interativas e muita diversão de STEM para seus alunos! Observe que a disponibilidade para as oficinas em sala de aula pode variar em comunidades de localidades remotas ou rurais.

[Actua](http://actua.ca/) é a líder canadense em acesso à Ciência, Tecnologia, Engenharia e Matemática. Todos os anos, a Actua atinge mais de 225.000 jovens de mais de 500 comunidades, por meio de sua programação que ultrapassa obstáculos.

## A Kids Code Jeunesse lhe dará suporte na sala de aula! {#kids_code}

Você é professor, deseja apresentar a programação aos seus alunos e gostaria de receber suporte na sala de aula? Todos os professores que desejarem ter um voluntário treinado em programação para auxiliar na sala de aula poderão entrar em contato com a [Kids Code Jeunesse](http://www.kidscodejeunesse.org), e nós trabalharemos para providenciar suporte! [Kids Code Jeunesse](http://www.kidscodejeunesse.org) é uma organização canadense sem fins lucrativos que visa oferecer a todas as crianças a oportunidade de aprender a programar. E a todos os professores, a oportunidade de saber como ensinar a programação em sala de aula.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Das salas de aula participantes, 100 ganharão robôs programáveis {#programmable_robots}

[Sphero](http://www.gosphero.com/) é a bola robótica controlada por aplicativo que está mudando o modo como os alunos aprendem. Baseado em [lições do SPRK](http://www.gosphero.com/education/), esses robôs redondinhos dão às crianças um curso superdivertido sobre programação, desenvolvendo, ao mesmo tempo, suas habilidades em matemática e ciência. O Sphero está dando 100 kits para salas de aulas, cada um deles com 5 robôs. Qualquer sala de aula (pública ou particular) dos EUA ou do Canadá pode concorrer a este prêmio.

<% end %>

<h2 id="more_questions">Ainda tem dúvidas sobre prêmios?</h2>

Consulte os [Termos e Condições](<%= hoc_uri('/prizes-terms') %>) ou visite nosso fórum para ver as [Perguntas frequentes](http://support.code.org) e tirar suas dúvidas.

<% if @country == 'us' %>

# Perguntas frequentes {#faq}

## Toda a sua escola precisa se envolver para ganhar US$10.000 em hardware?

Sim. Toda a sua escola precisa participar para poder concorrer ao prêmio, mas uma só pessoa precisa se registrar e enviar o formulário de inscrição do Prêmio de Hardware [aqui](<%= hoc_uri('/prizes') %>).

## Toda a sua escola precisa se envolver para ganhar um chat tecnológico?

Qualquer sala de aula (pública ou particular) pode concorrer a este prêmio. Não é preciso que toda a sua escola se inscreva.

## As escolas particulares podem ganhar o prêmio de chat com vídeo?

Sim! Escolas particulares e independentes podem concorrer, juntamente com as escolas públicas, para ganhar os prêmios de chat com vídeo.

## As escolas de fora dos EUA podem ganhar o prêmio de chat com vídeo?

Infelizmente não. Devido à logística, nós não conseguimos oferecer o prêmio de chat com vídeo para as escolas que não ficam nos EUA e no Canadá. Todos os organizadores internacionais **podem** concorrer aos prêmios de espaço no Dropbox ou crédito no Skype.

## Por que o prêmio de hardware de US$10.000 só pode ser dado às escolas públicas?

Nós adoraríamos ajudar tanto os professores das escolas públicas, quanto os das escolas particulares. Entretanto, no momento, o problema é a logística. Nós fizemos uma parceria com a [DonorsChoose.org](http://donorschoose.org) para administrar os prêmios de fundos para salas de aula, válidos apenas para as escolas públicas de ensinos fundamental e médio dos EUA. De acordo com a DonorsChoose.org, a organização está melhor capacitada para acessar dados precisos e consistentes, disponíveis para escolas públicas.

## Eu não estou nos Estados Unidos. Posso concorrer aos prêmios?

Como temos uma equipe pequena, apesar de trabalhar em tempo integral, a Code.org não consegue lidar com a logística da administração de prêmios internacionais. Desta forma, quem não estiver nos Estados Unidos não poderá concorrer aos prêmios.

## Qual é o prazo para se inscrever para o prêmio de hardware?

Para concorrer, toda a sua escola deve se cadastrar na Hora do Código, além de preencher o [Formulário de inscrição de hardware](<%= hoc_uri('/prizes') %>) até 14 de novembro de 2014. Uma escola de cada Estado dos EUA receberá um conjunto de computadores para a sala de aula. A Code.org vai selecionar e notificar os vencedores por e-mail, em 1º de dezembro de 2014.

## Qual é o prazo para concorrer ao chat tecnológico?

Para concorrer, cadastre sua sala de aula na Hora do Código até o dia 14 de novembro de 2014. As turmas ganharão um chat de vídeo com uma celebridade. A Code.org vai selecionar e notificar os vencedores por e-mail, em 1º de dezembro de 2014.

## Quando serei notificado se minha escola ou sala de aula ganhar um prêmio?

Para concorrer, toda a sua escola deve se cadastrar na Hora do Código, além de preencher o [Formulário de inscrição de hardware](<%= hoc_uri('/prizes') %>) até 14 de novembro de 2014. A Code.org vai selecionar e notificar os vencedores por e-mail, em 1º de dezembro de 2014.

## Se apenas parte da minha escola conseguir fazer a Hora do Código durante a Semana da Educação em Ciência da Computação (de 8 a 14 de dezembro), ainda poderei concorrer aos prêmios?

Sim, só não se esqueça de apresentar um plano de logística que descreva de que maneira toda a sua escola está participando, utilizando um período razoável de tempo, e de se inscrever para a Hora do Código até 14 de novembro. <a style="display: block" href="<%= hoc_uri('/#join') %>"><button style="float: right;">Inscreva-se para concorrer</button></a> <% end %>