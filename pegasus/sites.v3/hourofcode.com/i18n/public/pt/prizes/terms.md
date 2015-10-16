---

title: <%= hoc_s(:title_prizes_terms) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

# Prêmios - termos e condições

## Amazon.com or Microsoft’s Windows Store credit:

The Amazon.com and Microsoft’s Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. Limite de um resgate por organizador.

Every organizer must register for the Hour of Code in order to receive the Amazon.com or Microsoft’s Windows Store credit. Caso sua escola inteira participe da Hora do Código, cada educador deve se cadastrar individualmente como organizador para se qualificar.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com and Microsoft’s Windows Store credit.

<% if @country == 'us' %>

## Conjunto de laptops para sala de aula (ou US$10.000 para outra tecnologia)

Prêmio limitado apenas às escolas públicas de ensino fundamental e médio dos EUA. Para concorrer, sua escola inteira deve se inscrever na Hora do Código até 16 de novembro de 2015. Uma escola de cada Estado dos EUA receberá um conjunto de computadores para a sala de aula. A Code.org vai selecionar e notificar os vencedores por e-mail, em 1º de dezembro de 2015.

Para esclarecer, essa premiação não será feita por sorteio, nem como concurso envolvendo sorte.

1) Não há nenhum interesse financeiro ou risco envolvido na inscrição - qualquer escola ou sala de aula pode participar, sem qualquer pagamento para a Code.org ou qualquer outra organização

2) Os vencedores serão selecionados somente dentre as escolas em que a sala de aula inteira (ou escola) participar de uma Hora do Código, o que envolve um teste de habilidade coletiva dos estudantes e dos professores.

<% end %>

<%= view :signup_button %>