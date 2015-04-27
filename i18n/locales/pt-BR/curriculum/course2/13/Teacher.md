* * *

title: "Abelha: condicionais" view: page_curriculum theme: none

* * *

<%= partial('curriculum_header', :unittitle=>'Curso 2', :lesson=>13, :title=> 'Abelha: Condicionais', :unplugged=>false, :time=>30) %>

[content]

[together]

## Visão geral da aula

Até agora, todos os programas que os alunos escreveram deveriam ser executados exatamente da mesma forma toda vez - confiável, mas não muito flexível. Nesta etapa, vamos introduzir o comando condicional, um código que funciona de forma diferente dependendo das condições que ele encontra.

[summary]

## Índice de ensino

### **Primeiros passos**

[Introdução](#GetStarted)   


### **Atividade: Abelha: condicionais**

[Abelha: condicionais](#Activity)

### **Aprendizagem estendida**

[Atividades de extensão](#Extended)

[/summary]

## Objetivos da aula

### Os alunos vão:

  * Comparar valores usando o operador "="
  * Traduzir comandos condicionais da linguagem falada para um programa
  * Identificar quando uma condição pode ser usada para lidar com valores desconhecidos
  * Executar um algoritmo com um comando condicional
  * Resolver desafios usando uma combinação de sequências em laços e condicionais

[/together]

[together]

## Primeiros passos

### <a name="GetStarted"></a> Introdução

Faça uma revisão da atividade "Condicionais com cartas" com os alunos.

  * O que é um comando condicional?
  * Quando ele é útil?
  * Quais são algumas das condições que você usou na atividade offline?

Agora vamos usar condicionais com nossa abelha para que ela nos ajude a lidar com algumas flores roxas misteriosas. Não sabemos se essas flores têm néctar ou não, então vamos precisar usar condicionais para que coletemos néctar se houver, mas não queremos tentar coletar néctar de uma flor caso ela não tenha.

[/together]

[together]

## Atividade

### <a name="Activity"></a> [Abelha: Condicionais](http://learn.code.org/s/course2/stage/13/puzzle/1)

[/together]

<!--(this is left in here as an example of how to include an image in Markdown)
![](binaryphoto.png) -->

[together]

## Aprendizagem estendida

<a name="Extended"></a>Use essas atividades para melhorar a aprendizagem do aluno. Elas podem ser usadas como atividades extraclasse ou como outra forma de aprendizado.

### Tag Verdadeiro/Falso

  * Organize os alunos como se eles fossem jogar [Sinal vermelho / Sinal verde](http://www.gameskidsplay.net/games/sensing_games/rl_gl.htm).
  * Selecione uma pessoa para ficar na frente, como o mestre.
  * O mestre escolhe uma condição e pede para que todos que satisfazem a condição deem um passo à frente. 
      * Se você tem um cinto vermelho, dê um passo à frente.
      * Se você estiver usando sandálias, dê um passo à frente.
  * Troque as frases, e diga coisas como "Se você *não* for loiro, dê um passo à frente".

### Aninhamento

  * Divida os alunos em pares ou pequenos grupos.
  * Peça que eles escrevam os comandos "se" para jogar cartas em tiras de papel, como: 
      * Se o naipe for de paus
      * Se a cor for vermelha
  * Peça para os alunos criarem tiras semelhantes para os resultados. 
      * Some um ponto
      * Subtraia um ponto
  * Quando tiver terminado, peça aos alunos que escolham três de cada tipo de tira, e três cartas para jogar, prestando atenção à ordem selecionada.
  * Usando três pedaços de papel, peça aos alunos que escrevam três programas diferentes, usando somente os conjuntos de tiras que eles escolheram, em qualquer ordem. 
      * Incentive os alunos a colocar alguns comandos "se" dentro de outros comandos "se".
  * Agora, os alunos devem executar todos os três programas usando as cartas que eles pegaram, na mesma ordem para cada programa.  
      * Dois programas retornaram a mesma resposta?
      * Algum programa retornou algo diferente?

[/together]

[standards]

## Conexões e informações básicas

### Habilidades avaliadas pela PARCC / Smarter Balanced Assessment

  * Clicar / tocar
  * Arrastar e soltar
  * Selecionar e arrastar / deslizar
  * Selecionar objeto
  * Usar player de vídeo

### Padrões ISTE (anteriormente chamados NETS)

  * 1.a - Aplicar conhecimentos existentes para gerar novas ideias, produtos ou processos.
  * 1.c - Usar modelos e simulações para explorar questões e sistemas complexos.
  * 4.b - Planejar e gerenciar atividades para desenvolver uma solução ou concluir um projeto.
  * 4.d - Usar múltiplos processos e diversas perspectivas para explorar soluções alternativas.
  * 6.a - Entender e usar sistemas tecnológicos.
  * 6.c - Solucionar problemas de sistemas e aplicações.
  * 6.d - Transferir o conhecimento atual para o aprendizado de novas tecnologias. 

### CSTA K-12 Computer Science Standards

  * CL.L1:3-02. Trabalhar de forma cooperativa e colaborativa com colegas e professores usando tecnologia.
  * CT.L1:3-01. Usar recursos tecnológicos (por exemplo, desafios e programas de pensamento lógico) para resolver problemas apropriados para a faixa etária.
  * CPP.L1:6-05. Construir um programa como um conjunto de instruções a serem seguidas passo a passo. 
  * CPP.L1:6-06. Implementar soluções de problemas usando uma linguagem de programação visual baseada em blocos.
  * CT.L1:6-01. Entender e usar os passos básicos na resolução de um problema com um algoritmo.
  * CT.L2-01. Usar os passos básicos de resolução de problemas com algoritmo para encontrar soluções.
  * CT.L2-06. Descrever e analisar uma sequência de instruções sendo seguidas.
  * CT.L2-07. Representar dados de várias formas: textos, sons, imagens, números.
  * CT.L2-08. Usar representações visuais dos estados, estruturas e dados do problema.
  * CT.L2-12. Usar abstração para decompor um problema em problemas menores. 
  * CT.L2-14. Examinar as conexões entre elementos de matemática e ciência da computação, inclusive números binários, lógica, conjuntos e funções.
  * CT.L3A-03. Explicar como sequência, seleção, iteração, e recursividade são blocos de construção de algoritmos.

### Next-Gen Science Standards

  * K-2-PS3-2. Usar ferramentas e materiais fornecidos para desenvolver e construir um dispositivo que resolva um problema específico, ou uma solução para um problema específico.
  * K-2-ETS1-1. Fazer perguntas, observações e reunir informações sobre uma situação que as pessoas querem mudar para definir um problema simples que pode ser resolvido com o desenvolvimento de uma ferramenta ou objeto novo, ou melhorado.
  * 3-5-ETS1-2. Gerar e comparar várias soluções possíveis para um problema com base em quanto cada uma é capaz de satisfazer as critérios e restrições do problema. 

### Práticas matemáticas do Common Core

  *   1. Dar sentido aos problemas e perseverar para resolvê-los.
  *   1. Ter raciocínio abstrato e quantitativo.
  *   1. Criar modelos matemáticos
  *   1. Usar ferramentas apropriadas estrategicamente.
  *   1. Ter precisão.
  *   1. Procurar e fazer uso de estrutura.
  *   1. Procurar e expressar regularidade no raciocínio repetido.

### Padrões matemáticos do Common Core

  * 1.OA.1 - Usar adição e subtração até 20 para resolver problemas que envolvam situações de somar, subtrair, separar, juntar e comparar, usando incógnitas em todas as posições, por exemplo, usando objetos, desenhos e equações com um símbolo que substitui o número desconhecido para representar o problema.
  * 2.OA.1 - Usar adição e subtração até 100 para resolver problemas de uma ou duas etapas que envolvam situações de somar, subtrair, separar, juntar e comparar, usando incógnitas em todas as posições, por exemplo, usando objetos, desenhos e equações com um símbolo que substitui o número desconhecido para representar o problema.
  * 2.G.2 - Dividir um retângulo em linhas e colunas de quadrados com o mesmo tamanho e contar para encontrar o número total deles.
  * 2.MD.5 - Usar adição e subtração até 100 para resolver problemas que envolvam comprimentos que são dados nas mesmas unidades, por exemplo, usando desenhos (como desenhos de réguas) e equações que contêm um símbolo para o número desconhecido, para representar o problema.
  * 2.NBT.A.4 - Comparar dois números de três algarismos com base nos significados das casas de centena, dezena e unidade, usando os símbolos >, =, e < para registrar os resultados das comparações. 
  * 3.OA.3 - Usar multiplicação e divisão até 100 para resolver os problemas em situações envolvendo grupos iguais, arrays e unidades de medida.

### Padrões de Língua e Literatura do Common Core

  * SL.1.1 - Participar de conversas colaborativas com vários parceiros sobre tópicos do primeiro ano e trocar informações com colegas e adultos em pequenos e grandes grupos.
  * L.1.6 - Usar palavras e frases adquiridas em conversas e leituras e em resposta aos textos, usando inclusive conjunções recorrentes para assinalar relações simples (por exemplo, porque).
  * SL.2.1 - Participar de conversas colaborativas com vários parceiros sobre tópicos do segundo ano e trocar informações com colegas e adultos em pequenos e grandes grupos.
  * L.2.6 - Usar palavras e frases adquiridas em conversas e leituras e em resposta aos textos, inclusive adjetivos e advérbios para descrição (por exemplo, quando outras crianças estão felizes, eu também fico feliz).
  * SL.3.1 - Participar efetivamente de discussões colaborativas variadas (individualmente, em grupos e conduzidas pelo professor), com diversos parceiros, sobre temas e textos do terceiro ano, levando em consideração as ideias dos outros e se expressando claramente.
  * L.3.6 - Adquirir e usar corretamente palavras e frases que sejam apropriadas em conversas no meio acadêmico em geral e relevantes ao tema, incluindo aquelas que sinalizam relações espaciais e temporais.

[/standards]

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css" />