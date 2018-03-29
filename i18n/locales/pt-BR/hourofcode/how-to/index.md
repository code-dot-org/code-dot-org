---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Como ensinar a Hora do Código</h1>

Faça parte da iniciativa "Hora de Código" e facilite a primeira experiência em "Ciência da Computação" aos seus alunos. É fácil executar a Hora do Código - mesmo para principiantes! If you'd like an extra set of hands to help out, you can find a [local volunteer](%= codeorg_url('/volunteer/local') %) to help run an Hour of Code in your class.

## 1. Veja esse guia prático em vídeo <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Escolha um tutorial para sua hora

Nós oferecemos uma variedade de [ tutoriais controlados pelos estudantes](%= resolve_url('/learn') %) divertidos, para todas as faixas etárias e níveis de experiência. Os alunos executam as atividades por conta própria, embora muitas atividades tenham planos de aula para professores (você verá o link quando você clicar a atividade) para orientar a discussão ou estender a atividade. [![](/images/fit-700/tutorials.png)](%=resolve_url('/learn') %)

## 3. Promova sua Hora do Código

Promova sua Hora de Código [com essas ferramentas](%= resolve_url('/promote/resources') %) e incentive outros a organizar seus próprios eventos.

## 4. Avalie suas necessidades tecnológicas — não é preciso ter computadores

A melhor experiência da Hora do Código inclui computadores conectados à Internet. Mas você **não** precisa de um computador para cada criança, e pode inclusive realizar a Hora do Código sem computador nenhum.

Certifique-se de testar tutoriais nos computadores ou dispositivos dos alunos, para garantir que eles funcionem corretamente nos navegadores com som e vídeo. **Sua Internet é lenta?** Apresente os vídeos na frente da classe, para que cada aluno não tenha que baixar seus próprios vídeos. Ou tente os tutoriais desconectados / off-line.

Forneça fones de ouvido para sua turma, ou peça aos alunos que tragam seus próprios fones, se o tutorial escolhido funcionar melhor com som.

**Não tem dispositivos suficientes?** Use a [programação em duplas](https://www.youtube.com/watch?v=vgkahOzFH2Q). Quando os alunos trabalham em equipe, eles ajudam uns aos outros e dependem menos do professor. Eles também verão que a ciência da computação é uma atividade social e colaborativa.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Comece sua Hora do Código com um vídeo ou um discurso inspirador

**Invite a [local volunteer](%= codeorg_url('/volunteer/local') %) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Mostre um vídeo inspirador:**

- O vídeo de lançamento original do Code.org, com a participação de Bill Gates, Mark Zuckerberg e a estrela da NBA - Chris Brosh. (Existem versões de [1 minuto](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minutos](https://www.youtube.com/watch?v=nKIu9yen5nc) e [9 minutos](https://www.youtube.com/watch?v=dU1xS07N-FA) disponíveis)
- Find more inspirational [resources](%= codeorg_url('/inspire') %) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Não tem problema se você e seus alunos não têm experiência com ciência da computação. Apresentamos aqui algumas ideias para começar sua atividade da Hora do Código:**

- Explique de que forma a tecnologia afeta nossas vidas, usando exemplos que sensibilizem tanto meninos como meninas (fale sobre salvar vidas, ajudar as pessoas, conectá-las, etc.).
- Em uma atividade com a turma toda, monte uma lista com as coisas que usam a programação na vida cotidiana.
- See tips for getting girls interested in computer science [here](%= codeorg_url('/girls')%).

## 6. É hora de programar!

**Apresente a atividade aos alunos**

- Escreva o link do tutorial em um quadro branco. Encontre o link listado nas [informações do seu tutorial](%= resolve_url('/learn')%) abaixo do número de participantes.

**Quando seus alunos tiverem dificuldades, nao há problema em responder:**

- "Eu não sei. Vamos descobrir juntos".
- "A tecnologia nem sempre funciona da maneira que queremos".
- "Aprender programação é como aprender uma nova língua, você não vai se tornar fluente imediatamente".

**O que fazer se um aluno terminar mais cedo?**

- Os alunos podem ver todos os tutoriais e [tentar outra atividade da Hora do Código](%= resolve_url('/learn')%).
- Ou, peça aos alunos que terminarem mais cedo para que ajudem os colegas que estão tendo problemas com a atividade.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Comemore

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](%= codeorg_url('/certificates')%) for your students.
- Imprima adesivos com a mensagem ["Eu participei da Hora do Código!"](%= resolve_url('/promote/resources#stickers') %) para seus alunos.
- [Encomende camisetas personalizadas](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) para sua escola.
- Compartilhe fotos e vídeos do seu evento da Hora do Código nas mídias sociais. Use #HoraDoCodigo e @codeorg, assim podemos divulgar sua experiência de sucesso também!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Outros recursos da Hora do Código para educadores:

- Visite o [Fórum da Hora do Código para Professores](http://forum.code.org/c/plc/hour-of-code) para conseguir conselhos, ideias e apoio de outros educadores. <% if @country == 'us' %>
- Veja as [Perguntas Frequentes da Hora do Código](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## O que vem depois da Hora do Código?

A Hora do Código é apenas o primeiro passo de uma jornada para aprender mais sobre como a tecnologia funciona e como criar aplicativos de software. Para continuar essa jornada:

- Encourage students to continue to [learn online](%= codeorg_url('/learn/beyond')%).
- [Attend](%= codeorg_url('/professional-development-workshops') %) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>