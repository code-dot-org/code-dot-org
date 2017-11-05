---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# Como ensinar a Hora do Código

Junte-se ao movimento e proporcione a um grupo de alunos sua primeira hora de ciência da computação seguindo estas etapas:

## 1) Veja o guia prático em vídeo <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 2) Escolha um tutorial para sua hora:

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('/learn') %>) for students of all ages, created by a variety of partners.

**[Tutoriais autoexplicativos da Hora do Código:](<%= resolve_url('/learn') %>)**

  * Exigem um tempo mínimo de preparação dos professores
  * São autoexplicativos, o que permite que os alunos trabalhem em seu próprio ritmo e nível de habilidade

**[Tutoriais para professores da Hora do Código:](<%= resolve_url('https://code.org/educate/teacher-led') %>)**

  * São planos de aula que exigem uma preparação mais avançada do professor
  * São classificados por nível *e* por disciplina (por exemplo, matemática, inglês, etc.)

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

## 3) Promova sua Hora do Código

Promova sua Hora do Código [com essas ferramentas](<%= resolve_url('/promote') %>) e incentive outras pessoas a organizar seus próprios eventos.

## 4) Avalie suas necessidades tecnológicas (computadores são opcionais)

A melhor experiência da Hora do Código inclui computadores conectados à Internet. Mas você **não** precisa de um computador para cada criança, e pode inclusive realizar a Hora do Código sem computador nenhum.

**Planeje com antecedência!** Faça o seguinte antes do início do seu evento:

  * Teste os tutoriais nos computadores ou dispositivos dos alunos. Verifique se eles funcionam da maneira adequada nos navegadores com som e vídeo.
  * Forneça fones de ouvido para sua turma, ou peça aos alunos que tragam seus próprios fones, se o tutorial escolhido funcionar melhor com som.
  * **Não tem dispositivos suficientes?** Use a [programação em duplas](https://www.youtube.com/watch?v=vgkahOzFH2Q). Quando os alunos trabalham em equipe, eles ajudam uns aos outros e dependem menos do professor. Eles também verão que a ciência da computação é uma atividade social e colaborativa.
  * **Tem baixa largura de banda?** Programe-se para mostrar os vídeos para a classe toda, assim os alunos não terão de fazer o download individualmente. Outra opção é trabalhar com os tutoriais off-line.

![](/images/fit-350/group_ipad.jpg)

## 5) Comece sua Hora do Código com um vídeo ou discurso inspirador

**Convide um [voluntário da região](https://code.org/volunteer/local) para inspirar seus alunos falando sobre as várias possibilidades que a ciência da computação traz.** Há milhares de voluntários no mundo todo prontos para ajudar com a sua Hora do Código. [Use este mapa](https://code.org/volunteer/local) para encontrar voluntários da sua região que possam visitar sua sala de aula ou participar de uma videoconferência com seus alunos.

[![](/images/fit-300/volunteer-map.png)](<%= resolve_url('https://code.org/volunteer/local') %>)

**Mostre um vídeo inspirador:**

  * O vídeo original de lançamento da Code.org, com a participação de Bill Gates, Mark Zuckerberg e o astro da NBA, Chris Bosh (há versões de [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutos](https://www.youtube.com/watch?v=nKIu9yen5nc) e [9 minutos](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * O [vídeo de lançamento da Hora do Código de 2013](https://www.youtube.com/watch?v=FC5FbmsH4fw), ou o <% if @country == 'uk' %> [vídeo da Hora do Código de 2015](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [vídeo da Hora do Código de 2015](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [O vídeo do presidente Obama convidando todos os alunos a aprender ciência da computação](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Encontre mais [recursos](<%= resolve_url('https://code.org/inspire') %>) e [vídeos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP) inspiradores.

**Não tem problema se você e seus alunos não têm experiência com ciência da computação. Apresentamos aqui algumas ideias para começar sua atividade da Hora do Código:**

  * Explique de que forma a tecnologia interfere em nossas vidas, usando exemplos que sensibilizem tanto meninos como meninas (fale sobre salvar vidas, ajudar as pessoas, conectar as pessoas, etc.).
  * Em uma atividade com a turma toda, monte uma lista com as coisas que usam a programação na vida cotidiana.
  * Veja algumas dicas para deixar as meninas interessadas em ciência da computação [aqui](<%= resolve_url('https://code.org/girls') %>).

**Precisa de mais orientação?** Faça o download deste [modelo de plano de aula](/files/EducatorHourofCodeLessonPlanOutline.docx).

**Quer mais ideias de ensino?** Confira as [melhores práticas](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) de educadores experientes.

## 6) É hora de programar!

**Direcione os alunos para a atividade**

  * Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn') %>) under the number of participants.

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

**Quando seus alunos tiverem dificuldades, tudo bem responder:**

  * "Eu não sei. Vamos descobrir juntos."
  * "A tecnologia nem sempre funciona da maneira que queremos."
  * "Aprender programação é como aprender uma nova língua; você não vai se tornar fluente imediatamente."

**[Confira essas dicas de ensino](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**O que fazer se um aluno terminar mais cedo?**

  * Students can see all tutorials and try another Hour of Code activity at [hourofcode.com/learn](<%= resolve_url('/learn') %>)
  * Ou, peça aos alunos que terminarem mais cedo para que ajudem os colegas que estão tendo problemas com a atividade.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Comemore

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * [Imprima certificados](<%= resolve_url('https://code.org/certificates') %>) para seus alunos.
  * Imprima adesivos com a mensagem ["Eu participei da Hora do Código!"](<%= resolve_url('/promote/resources#stickers') %>) para seus alunos.
  * [Encomende camisetas personalizadas](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) para sua escola.
  * Compartilhe fotos e vídeos do seu evento da Hora do Código nas mídias sociais. Use #HoraDoCodigo e @codeorg, assim podemos divulgar sua experiência de sucesso também!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Outros recursos da Hora do Código para educadores:

  * Use este [modelo de plano de aula](/files/EducatorHourofCodeLessonPlanOutline.docx) para organizar a Hora do Código.
  * Confira as [melhores práticas](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) dos professores que já trabalharam na Hora do Código. 
  * Assista à gravação de nosso [Guia do educador para o seminário web da Hora do Código](https://youtu.be/EJeMeSW2-Mw).
  * [Assista ao vivo a uma sessão de perguntas e respostas](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) com nosso fundador, Hadi Partovi, para se preparar para a Hora do Código.
  * Visite o [Fórum da Hora do Código para Professores](http://forum.code.org/c/plc/hour-of-code) para conseguir conselhos, ideias e apoio de outros educadores. <% if @country == 'us' %>
  * Veja as [Perguntas Frequentes da Hora do Código](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## O que vem depois da Hora do Código?

A Hora do Código é apenas o primeiro passo de uma jornada para aprender mais sobre como a tecnologia funciona e como criar aplicativos de software. Para continuar essa jornada:

  * Incentive os alunos a continuar [aprendendo on-line](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [Assista](<%= resolve_url('https://code.org/professional-development-workshops') %>) a uma oficina presencial, de um dia, para receber instruções de uma pessoa com experiência em ciência da computação. (Somente para educadores dos EUA)

<%= view :signup_button %>