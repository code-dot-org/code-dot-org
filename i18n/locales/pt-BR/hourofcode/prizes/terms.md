* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# Prêmios - termos e condições

## Crédito na Amazon.com, no iTunes e na Windows Store:

Os créditos na Amazon.com, no iTunes e na Windows Store limitam-se a professores do ensino fundamental e médio, educadores de clubes de programação e instituições de ensino. O crédito de US$10,00 deve ser adicionado a uma conta existente e expira depois de 1 ano. Limite de um resgate por organizador.

Todos os organizadores devem se registrar na Hora do Código para receber os créditos da Amazon.com, do iTunes e da Windows Store. Caso sua escola inteira participe da Hora do Código, cada educador deve se cadastrar individualmente como organizador para se qualificar.

A Code.org entrará em contato com os organizadores após a Hora do Código (de 7 a 13 dezembro), fornecendo instruções para o resgate dos créditos na Amazon.com, no iTunes e na Windows Store.

<% if @country == 'us' %>

## Conjunto de laptops para sala de aula (ou US$10.000 para outra tecnologia)

Prêmio limitado apenas às escolas públicas de ensino fundamental e médio dos EUA. Para concorrer, sua escola inteira deve se inscrever na Hora do Código até 16 de novembro de 2015. Uma escola de cada Estado dos EUA receberá um conjunto de computadores para a sala de aula. A Code.org vai selecionar e notificar os vencedores por e-mail, em 1º de dezembro de 2015.

Para esclarecer, essa premiação não será feita por sorteio, nem como concurso envolvendo sorte.

1) Não há nenhum interesse financeiro ou risco envolvido na inscrição - qualquer escola ou sala de aula pode participar, sem qualquer pagamento para a Code.org ou qualquer outra organização

2) Os vencedores serão selecionados somente dentre as escolas em que a sala de aula inteira (ou escola) participar de uma Hora do Código, o que envolve um teste de habilidade coletiva dos estudantes e dos professores.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## Chat com vídeo com um orador convidado:

Prêmio limitado para turmas do ensino fundamental e médio dos EUA e Canadá. A Code.org selecionará as turmas vencedoras, fornecerá um horário para o bate-papo on-line e trabalhará com o professor apropriado para definir os detalhes da tecnologia. Não é preciso que a escola toda se inscreva para se qualificar para este prêmio. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>