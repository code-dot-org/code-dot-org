---

title: <%= hoc_s(:title_resources) %>
layout: wide
nav: promote_nav

---

<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css" />
</link>

# Promova a Hora do Código

## Quer sediar uma Hora do Código? [Consulte o guia prático](<%= resolve_url('/how-to') %>)

<%= view :promote_handouts %> <%= view :promote_videos %>

<a id="posters"></a>

## Pendure estes cartazes em sua escola

<%= view :promote_posters %>

<a id="social"></a>

## Publique estas imagens nas mídias sociais

[![imagem](/images/fit-250/social-1.jpg)](/images/social-1.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imagem](/images/fit-250/social-2.jpg)](/images/social-2.jpg)&nbsp;&nbsp;&nbsp;&nbsp; [![imagem](/images/fit-250/social-3.jpg)](/images/social-3.jpg)&nbsp;&nbsp;&nbsp;&nbsp;

<%= view :social_posters %>

<a id="logo"></a>

## Use o logotipo da Hora do Código para divulgar o evento

[![imagem](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Baixar versões em alta resolução](http://images.code.org/share/hour-of-code-logo.zip)

**A "Hour of Code" é uma marca registrada. Não queremos impedir seu uso, mas queremos garantir que ele se enquadre em alguns limites:**

  1. Qualquer referência à marca "Hour of Code" deve ser feita de forma que não sugira que ela é uma marca de sua propriedade, mas uma referência à Hora do Código como um movimento popular. Um bom exemplo: "Participe da Hora do Código no ACMECorp.com". Exemplo de uso errado: "Experimente a Hora do Código promovida pela ACME Corp".
  2. Use "TM" sobrescrito nos textos de maior destaque quando mencionar "Hour of Code" (ou Hora do Código), tanto em seu website como em descrições de aplicativos.
  3. Use o seguinte texto na página (ou no rodapé), com links para os sites da Semana da Educação em Ciência da Computação e Code.org:
    
    *"A 'Hora do Código' é uma iniciativa nacional da Semana da Educação em Ciência da Computação[csedweek.org] e da Code.org[code.org] para proporcionar a experiência de uma hora de ciência da computação e programação a milhões de estudantes".*

  4. É proibido o uso de "Hour of Code" em nomes de aplicativos.

<a id="stickers"></a>

## Imprima esses adesivos para seus alunos

(São 63 adesivos de 1 polegada de diâmetro por folha)  
[![imagem](/images/fit-250/hour-of-code-stickers.png)](/images/hour-of-code-stickers.pdf)

<a id="sample-emails"></a>

## Envie estes e-mails para ajudar a promover a Hora do Código

<a id="email"></a>

## Peça para sua escola, empregador ou amigos se inscreverem:

Os computadores estão em toda parte, mudando todos os setores do planeta. But fewer than half of all schools teach computer science. A boa notícia é que estamos a caminho de mudar essa realidade. Se você já ouviu falar da Hora do Código, sabe que ela marcou a história. Mais de 100 milhões de alunos já experimentaram uma Hora do Código.

Com a Hora do Código, a ciência da computação esteve nas páginas iniciais do Google, MSN e Yahoo! e Disney. Mais de 100 parceiros se uniram para apoiar este movimento. Todas as lojas da Apple do mundo já sediaram uma Hora do Código. O presidente Obama escreveu sua primeira linha de código como parte da campanha.

Este ano, contamos com você para torná-lo um evento ainda maior. Participe da Hora do Código 2016. Venha experimentar a Hora do Código durante a Semana da Educação em Ciência da Computação, <%= campaign_date('full') %>.

Divulgue. Sedie um evento. Peça para uma escola local se inscrever. Ou experimente a Hora do Código você mesmo — todos podem se beneficiar aprendendo seus fundamentos.

Comece em http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

## Convide a mídia para participar de seu evento

**Assunto:** Escola local participa da missão de levar a ciência da computação aos alunos

Computers are everywhere, changing every industry on the planet, but fewer than half of all schools teach computer science. As minorias sociais e as mulheres têm baixíssima representação nas aulas de ciência da computação, bem como no setor da tecnologia. A boa notícia é que estamos a caminho de mudar essa realidade.

Com a Hora do Código, a ciência da computação esteve nas páginas iniciais do Google, MSN e Yahoo! e Disney. Mais de 100 parceiros se uniram para apoiar este movimento. Todas as lojas da Apple do mundo já sediaram uma Hora do Código. O presidente Obama escreveu sua primeira linha de código como parte da campanha.

É por isso que todos os [NÚMERO] alunos da [NOME DA ESCOLA] estão participando do maior evento de aprendizado da história: a Hora do Código, durante a Semana da Educação em Ciência da Computação (<%= campaign_date('full') %>).

Gostaria de convidá-lo para participar da abertura de nosso evento e assistir ao início das atividades das crianças no dia [DATA].

A Hora do Código, organizada pela Code.org (uma organização sem fins lucrativos) e outras 100 organizações, é um movimento global que acredita que os estudantes de hoje estão prontos para aprender habilidades fundamentais para o sucesso no século XXI. Junte-se a nós.

**Contato:** [SEU NOME], [CARGO], celular: (XX) 55555-5555

**Quando:** [DATA e HORA do seu evento]

**Onde:** [ENDEREÇO e ORIENTAÇÕES DE COMO CHEGAR]

Aguardo seu contato.

<a id="parents"></a>

## Informe os pais sobre o evento de sua escola:

Caros pais,

Vivemos em um mundo cercado de tecnologias. E sabemos que, independentemente da área que nossos alunos escolham seguir na vida adulta, sua capacidade de alcançar o sucesso dependerá cada vez mais de compreender como a tecnologia funciona.

But only a tiny fraction of us are learning **how** technology works. Fewer than half of all schools teach computer science.

É por isso que toda a nossa escola participará do maior evento de aprendizado da história: a Hora do Código, durante a Semana da Educação em Ciência da Computação (<%= campaign_date('full') %>). Mais de 100 milhões de alunos no mundo todo já experimentaram uma Hora do Código.

Para nós, a Hora do Código é uma prova de que a [NOME DA ESCOLA] está pronta para ensinar essas habilidades fundamentais do século XXI. Para continuar levando atividades de programação aos nossos alunos, queremos fazer da Hora do Código um grande evento. Convido-o a se voluntariar, mobilizar os meios de comunicação locais, compartilhar as notícias em seus canais de mídia social e considerar a possibilidade de promover outros eventos da Hora do Código em sua comunidade.

Esta é uma oportunidade de mudar o futuro da educação em [NOME DA CIDADE].

Para ver mais detalhes, acesse http://hourofcode.com/<%= @country %> e ajude-nos a divulgar.

Atenciosamente,

Seu diretor

<a id="politicians"></a>

## Convide um representante político local para o evento de sua escola:

Caro, [nome do Prefeito/Secretário/Governador/Senador]:

Sabia que a computação é a principal fonte de remuneração nos EUA? Há mais de 500 mil vagas de emprego disponíveis na área de computação em todo o país, mas, no último ano, apenas 42.969 alunos formados em ciência da computação entraram para a força de trabalho.

Computer science is foundational for *every* industry today. Yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

É por isso que toda a nossa escola participará do maior evento de aprendizado da história: a Hora do Código, durante a Semana da Educação em Ciência da Computação (<%= campaign_date('full') %>). Mais de 100 milhões de alunos no mundo todo já experimentaram uma Hora do Código.

Gostaria de convidá-lo para participar de nosso evento da Hora do Código e se pronunciar em nossa abertura. Ele ocorrerá em [DATA, HORA, LOCAL] e enfatizará que [Nome da Cidade ou Estado] está pronto(a) para ensinar as principais habilidades do século XXI aos nossos alunos. Queremos garantir que nossos alunos estejam na vanguarda da criação de tecnologia do futuro, e não simplesmente consumindo-a.

Entre em contato comigo [pelo telefone (número do telefone) ou pelo e-mail (endereço do e-mail)]. Aguardo sua resposta.

Atenciosamente, [NOME], [CARGO]

<%= view :signup_button %>