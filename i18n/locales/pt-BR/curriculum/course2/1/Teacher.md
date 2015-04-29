* * *

title: Programação em papel quadriculado view: page_curriculum theme: none

* * *

<%= partial('curriculum_header', :title=> 'Graph Paper Programming', :unplugged=>true,:disclaimer=>'O tempo da aula inclui apenas a atividade. As sugestões de introdução e de resumo podem ser usadas para aprofundamento, quando o tempo permitir.', :time=>20) %>

[content]

## Visão geral da aula

Ao "programar" uns aos outros para desenhar imagens, os alunos começarão a entender o que realmente é a programação. A aula vai começar com os alunos instruindo uns aos outros a colorir quadrados no papel quadriculado, tentando reproduzir uma imagem existente. Se sobrar tempo, a aula poderá ser encerrada com as imagens criadas pelos próprios alunos.

[summary]

## Índice de ensino

### **Primeiros passos** - 15 minutos

1) [Vocabulário](#Vocab)   
2) [Apresentação da programação em papel quadriculado](#GetStarted)   
3) [Prática em conjunto](#Practice)

### **Atividade: programação em papel quadriculado** - 20 minutos

4) [Programação 4x4](#Activity1)

### **Resumo** - 5 minutos

5) [Bate-papo: O que aprendemos?](#FlashChat)  
6) [Jogo de palavras](#Shmocab)

### **Avaliação** - 10 minutos

7) [Avaliação de programação em papel quadriculado](#Assessment)

[/summary]

## Objetivos da aula

Os alunos vão:

  * Compreender a dificuldade de traduzir problemas reais em programas 
  * Aprender que as ideias podem até estar claras para eles, mas, mesmo assim, serem mal interpretadas por um computador 
  * Praticar a transmissão de ideias por códigos e símbolos

# Guia de ensino

## Materiais, recursos e preparação

### Para o aluno

  * [Folha de atividade de programação em 4x4](Activity1-GraphPaperProgramming.pdf)
  * [Avaliação de programação em papel quadriculado](Assessment1-GraphPaperProgramming.pdf)
  * Folhas quadriculadas 4x4 para os alunos praticarem (fornecidas junto com a [folha de atividade de Programação em 4x4](Activity1-GraphPaperProgramming.pdf), mas se você quiser que eles criem suas próprias folhas, inclua o padrão matemático do Common Core 2.G.2.) 
  * Folha em branco ou fichas para programas
  * Marcadores, canetas ou lápis

### Para o professor

  * [Lesson Video](http://youtu.be/Yy1zbkfRtIg?list=PL2DhNKNdmOtobJjiTYvpBDZ0xzhXRj11N)
  * Print out one [Four-by-Fours Activity Worksheet](Activity1-GraphPaperProgramming.pdf) for each group 
  * Print one [Graph Paper Programming Assessment](Assessment1-GraphPaperProgramming.pdf) for each student 
  * Supply each group with several drawing grids, paper, and pens/pencils

## Primeiros passos (15 min)

### <a name="Vocab"></a>1) Vocabulário

Nesta aula há duas palavras novas e importantes:  


[centerIt]

![](vocab.png)

[/centerIt]

**Algoritmo** - Repita comigo: Al-go-rit-mo   
Uma lista de passos que você pode seguir para concluir uma tarefa

**Programa** - Repita comigo: Pro-gra-ma   
Um algoritmo que foi codificado de forma que possa ser executado por uma máquina

  


### <a name="GetStarted"></a>2) Introdução à programação em papel quadriculado

Nesta atividade, vamos orientar uns aos outros para fazer desenhos sem deixar que outras pessoas de nosso grupo vejam a imagem original.

Neste exercício, usaremos o papel quadriculado 4x4. Começando no canto superior esquerdo, orientaremos a Máquina de Realização Automática (ARM) com instruções simples. As instruções são:

  * Mova um quadrado para a direita
  * Mova um quadrado para a esquerda
  * Mova um quadrado para cima
  * Mova um quadrado para baixo
  * Pinte um quadrado

Por exemplo, esta é a forma como escrevemos um algoritmo para instruir um amigo (que finge ser uma máquina de desenho) para colorir sua grade em branco para que ela fique como a imagem abaixo:  


[centerIt]

![](easy.png)

[/centerIt]

Isso é bem simples, mas seria preciso escrever uma instrução enorme para um quadrado igual a esse:  


[centerIt]

![](tough.png)

[/centerIt]

Com uma pequena substituição, podemos fazer isso de forma bem mais fácil! Ao invés de ter que escrever uma frase inteira para cada instrução, podemos usar as setas.   


[centerIt]

![](key.png)

[/centerIt]

Neste caso, os símbolos de seta são o código do "programa" e as palavras representam o "algoritmo". Isso significa que podemos escrever o algoritmo:

> "Mova um quadrado para a direita. Mova um quadrado para a direita. Preencha o quadrado com cor"

e isso corresponde ao programa:

> ![image](program.png)

Usando as setas, fica muito mais fácil refazer o código da imagem anterior!

[centerIt]

![](wArrows.png)

[/centerIt]

### <a name="Practice"></a>3) Prática em grupo

Comece sua aula sobre o mundo da programação desenhando ou projetando o modelo fornecido no quadro.  


[centerIt]

![](key.png)

[/centerIt]

Selecione um desenho simples, como este, para usar de exemplo.

[centerIt]

![](checkerboard.png)

[/centerIt]

Esta é uma boa maneira de apresentar todos os símbolos do exemplo. Para começar, preencha o papel quadriculado para a classe -- quadrado por quadrado -- e depois peça a eles para descreverem o que você acabou de fazer. Você pode começar falando o algoritmo em voz alta, e depois transformar suas instruções verbais em um programa.

Um algoritmo simples:

> “Mover para a direita, preencher quadrado, mover para a direita, mover para baixo  
> Preencher quadrado, mover para a esquerda, mover para a esquerda, preencher quadrado  
> Mover para baixo, mover para a direita, preencher quadrado, mover para a direita”

Alguns alunos poderão notar que há um passo desnecessário, mas faça-os esperar até a etapa de programação.  
  
Oriente a classe durante a tradução do algoritmo em um programa:

> ![image](program1.png)

Nesse momento, a sala de aula estará fervilhando com sugestões. Se os alunos entenderam o significado do exercício, esta será uma boa hora para discutir maneiras alternativas de preencher a mesma grade. Se ainda houver dúvidas, faça isso em outro dia e mostre outro exemplo.

> ![image](program2.png)

Se a classe conseguir recitar o algoritmo e definir os símbolos corretos a serem usados em cada etapa, eles estão prontos para seguir em frente. Dependendo do andamento da aula e da idade dos alunos, você pode tentar fazer uma grade mais complexa junto com eles ou fazer com que eles trabalhem em grupos com a [Folha de atividade de programação em 4x4](/curriculum/course2/1/Activity1-GraphPaperProgramming.pdf).

[tip]

# Dica de aula

Faça a classe imaginar que seu braço é uma Máquina de Realização Automática (ARM). A ideia de "algoritmos" e "programas" aparecerá cada vez mais, se os alunos sentirem que estão no controle de seus movimentos.

[/tip]

## Atividade: Programação em papel quadriculado (20 min)

### <a name="Activity1"></a>4) [Folha de atividade de programação em 4x4](/curriculum/course2/1/Activity1-GraphPaperProgramming.pdf)

  1. Divida os alunos em duplas.
  2. Peça para cada dupla escolher uma imagem da folha de atividade. 
  3. Cada aluno deverá discutir com seu parceiro o algoritmo para desenhar a imagem escolhida. 
  4. Cada dupla deverá converter o algoritmo em um programa usando símbolos. 
  5. Faça as duplas trocarem os programas entre elas e desenharem as imagens umas das outras. 
  6. A dupla deverá escolher outra imagem e fazer tudo de novo! 

  


[centerIt]

![](fourByFours.png)

[/centerIt]

## Resumo (5 min)

### <a name="FlashChat"></a>5) Bate-papo: o que aprendemos?

  * O que aprendemos hoje?
  * E se tivéssemos usado as mesmas setas, mas substituído o "Preencher quadrado" com "Colocar bloco"? O que poderíamos ter feito?
  * O que mais poderíamos programar se tivéssemos mudado o significado das setas?

### <a name="Shmocab"></a>6) Jogo de palavras

  * Para qual dessas definições aprendemos uma palavra hoje?
    
    > "Um grande papagaio tropical de cauda bem longa e bela plumagem"  
    > "Uma lista de passos a ser seguida para concluir uma tarefa"  
    > "Uma flor muito malcheirosa que brota uma vez por ano"  
    > 
    > 
    > > ...e qual é a palavra que aprendemos?

  * Qual destas definições *mais* se aproxima de um "programa"?
    
    > *Uma caixa de sapato cheia de pedras bonitas  
    > *Doze flores rosas em um vaso  
    > *Partitura de sua música favorita  
    > 
    > 
    > > Explique porque você escolheu essa resposta.

## <a name="Assessment"></a> Avaliação (10 min)

### 7) [Avaliação de programação em papel quadriculado](Assessment1-GraphPaperProgramming.pdf)   
  


## Aprendizagem estendida

Use essas atividades para melhorar a aprendizagem do aluno. Elas podem ser usadas como atividades extraclasse ou como outra forma de aprendizado.

### Cada vez melhor

  * Peça aos alunos para criarem suas próprias imagens. 
  * Eles conseguem descobrir como programar as imagens que eles criaram?

### Desafio para a classe

  * Como professor, desenhe uma imagem em uma grade de 5x5. 
  * A classe consegue codificar essa imagem junto com você?

[standards]

## Conexões e informações básicas

### Padrões ISTE (anteriormente chamados NETS)

  * 1.b - Criar trabalhos originais como meio de expressão pessoal ou em grupo.
  * 1.c - Usar modelos e simulações para explorar questões e sistemas complexos. 
  * 2.d - Contribuir com equipes de projeto para resolver problemas. 
  * 4.b - Planejar e gerenciar atividades para desenvolver uma solução ou concluir um projeto.
  * 4.d - Usar múltiplos processos e diversas perspectivas para explorar soluções alternativas.

### CSTA K-12 Computer Science Standards

  * CPP.L1:3-04 - Construir um conjunto de comandos para realizar uma tarefa simples. 
  * CPP.L1:6-05 - Construir um programa como um conjunto de instruções a serem seguidas passo a passo.
  * CT.L1:3-0 - Entender como é possível organizar informações em uma ordem útil sem usar um computador.
  * CT.L1:6-01 - Entender e usar os passos básicos na resolução de um problema com um algoritmo. 
  * CT.L1:6-02 - Desenvolver uma compreensão simples de algoritmo usando exercícios que não precisem de computador. 
  * CT.L2-07 - Representar dados de várias formas: textos, sons, imagens, números.

### Práticas de engenharia e ciência NGSS

  * K-2-ETS1-2 - Desenvolver um esboço, desenho, ou modelo físico simples para ilustrar como a forma de um objeto ajuda no seu funcionamento adequado para resolver um dado problema. 
  * 3-5-ETS1-2 - Gerar e comparar várias soluções possíveis para um problema com base em quanto cada uma é capaz de satisfazer as critérios e restrições do problema. 

### Práticas matemáticas do Common Core

  *   1. Dar sentido aos problemas e perseverar para resolvê-los.
  *   1. Ter raciocínio abstrato e quantitativo.
  *   1. Construir argumentos viáveis e fazer críticas ao raciocínio dos outros.
  *   1. Ter precisão.
  *   1. Procurar e fazer uso de estrutura.
  *   1. Procurar e expressar regularidade no raciocínio repetido. 

### Padrões matemáticos do Common Core

  * 2.G.2 - Dividir um retângulo em linhas e colunas de quadrados com o mesmo tamanho e contar para encontrar o número total deles.

### Padrões de Língua e Literatura do Common Core

  * SL.1.1 - Participar de conversas colaborativas com vários parceiros sobre tópicos do primeiro ano e trocar informações com colegas e adultos em pequenos e grandes grupos.
  * SL.1.2 - Fazer e responder a perguntas sobre detalhes-chave de um texto lido em voz alta ou sobre informações apresentadas oralmente ou por outro tipo de mídia.
  * L.1.6 - Usar palavras e frases adquiridas em conversas e leituras e em resposta aos textos, usando inclusive conjunções recorrentes para assinalar relações simples.
  * SL.2.1 - Participar de conversas colaborativas com vários parceiros sobre tópicos do segundo ano e trocar informações com colegas e adultos em pequenos e grandes grupos.
  * SL.2.2 - Reproduzir ou descrever ideias ou detalhes-chave de um texto lido em voz alta ou de informações apresentadas oralmente ou por outro tipo de mídia.
  * L.2.6 - Usar palavras e frases adquiridas em conversas e leituras e em resposta aos textos, inclusive adjetivos e advérbios para descrição.
  * SL.3.1 - Participar efetivamente de discussões colaborativas variadas (individualmente, em grupos e conduzidas pelo professor), com diversos parceiros, sobre temas e textos do terceiro ano, levando em consideração as ideias dos outros e se expressando claramente.
  * SL.3.3 - Perguntar e responder a questões sobre informações dadas por um orador, com elaboração e detalhes adequados.
  * L.3.6 - Adquirir e usar corretamente palavras e frases que sejam apropriadas em conversas no meio acadêmico em geral e relevantes ao tema, incluindo aquelas que sinalizam relações espaciais e temporais.

[/standards]

[<img src="http://www.thinkersmith.org/images/creativeCommons.png" border="0" />](http://creativecommons.org/)

[<img src="http://www.thinkersmith.org/images/thinker.png" border="0" />](http://thinkersmith.org/)  


[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css" />