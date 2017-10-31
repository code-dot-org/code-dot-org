---
title: '<%= hoc_s(:title_resources) %>'
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<link rel="stylesheet" type="text/css" href="/css/promote-page.css"></link>

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

[![imagem](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](%= localized_image('/images/hour-of-code-logo.png') %)

[Baixar versões em alta resolução](http://images.code.org/share/hour-of-code-logo.zip)

**"Hour of Code" is trademarked. We don't want to prevent its usage, but we want to make sure it fits within a few limits:**

1. Qualquer referência à marca "Hour of Code" deve ser feita de forma que não sugira que ela é uma marca de sua propriedade, mas uma referência à Hora do Código como um movimento popular.
    
    - Um bom exemplo: "Participe da Hora do Código no ACMECorp.com". 
    - Exemplo de uso errado: "Experimente a Hora do Código promovida pela ACME Corp".
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

### Ask your school, employer, or friends to sign up:

**Subject line:** Join me and over 100 million students for an Hour of Code

Os computadores estão em toda parte, mudando todos os setores do planeta. Mas menos da metade das escolas ensina ciência da computação. Good news is, we’re on our way to change this! Se você já ouviu falar da Hora do Código, sabe que ela marcou a história. Mais de 100 milhões de alunos já experimentaram uma Hora do Código.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Mais de 100 parceiros se uniram para apoiar este movimento. Every Apple Store in the world has hosted an Hour of Code, and leaders like President Obama and Canadian Prime Minister Justin Trudeau wrote their first lines of code as part of the campaign.

This year, let's make it even bigger. I’m asking you to join the Hour of Code 2017. Please get involved with an Hour of Code event during Computer Science Education Week, <%= campaign_date('full') %>.

Divulgue. Sedie um evento. Peça para uma escola local se inscrever. Ou experimente a Hora do Código você mesmo — todos podem se beneficiar aprendendo seus fundamentos.

Comece em http://hourofcode.com/<%= @country %>

<a id="media-pitch"></a>

### Convide a mídia para participar de seu evento

**Assunto:** Escola local participa da missão de levar a ciência da computação aos alunos

Os computadores estão em toda parte, mudando todos os setores do planeta, mas menos da metade das escolas ensina ciência da computação. As minorias sociais e as mulheres têm baixíssima representação nas aulas de ciência da computação, bem como no setor da tecnologia. A boa notícia é que estamos a caminho de mudar essa realidade.

With the Hour of Code, computer science has been on homepages of Google, MSN, Yahoo!, and Disney. Mais de 100 parceiros se uniram para apoiar este movimento. Todas as lojas da Apple do mundo já sediaram uma Hora do Código. Even President Obama wrote his first line of code as part of the campaign.

That’s why every one of the [X number] students at [SCHOOL NAME] are joining in on the largest learning event in history: The Hour of Code, during Computer Science Education Week (<%= campaign_date('full') %>).

I'm writing to invite you to attend our kickoff assembly and to see kids start the activity on [DATE].

The Hour of Code, organized by the nonprofit Code.org and over 100 others, is a global movement that believes the students of today are ready to learn critical skills for 21st-century success. Junte-se a nós.

**Contact:** [YOUR NAME], [TITLE], cell: (212) 555-5555 **When:** [DATE and TIME of your event] **Where:** [ADDRESS and DIRECTIONS]

I look forward to being in touch. [YOUR NAME]

<a id="parents"></a>

### Informe os pais sobre o evento de sua escola:

**Subject line:** Our students are changing the future with an Hour of Code

Caros pais,

Vivemos em um mundo cercado de tecnologias. E sabemos que, independentemente da área que nossos alunos escolham seguir na vida adulta, sua capacidade de alcançar o sucesso dependerá cada vez mais de compreender como a tecnologia funciona.

Mas apenas uma pequena fração de nós está aprendendo **como** a tecnologia funciona. Menos da metade das escolas ensina ciência da computação.

É por isso que toda a nossa escola participará do maior evento de aprendizado da história: a Hora do Código, durante a Semana da Educação em Ciência da Computação (<%= campaign_date('full') %>). Mais de 100 milhões de alunos no mundo todo já experimentaram uma Hora do Código.

Our Hour of Code is making a statement that [SCHOOL NAME] is ready to teach these foundational 21st-century skills. Para continuar levando atividades de programação aos nossos alunos, queremos fazer da Hora do Código um grande evento. Convido-o a se voluntariar, mobilizar os meios de comunicação locais, compartilhar as notícias em seus canais de mídia social e considerar a possibilidade de promover outros eventos da Hora do Código em sua comunidade.

Esta é uma oportunidade de mudar o futuro da educação em [NOME DA CIDADE].

Para ver mais detalhes, acesse http://hourofcode.com/<%= @country %> e ajude-nos a divulgar.

Atenciosamente,

Seu diretor

<a id="politicians"></a>

### Convide um representante político local para o evento de sua escola:

**Subject line:** Join our school as we change the future with an Hour of Code

Caro, [nome do Prefeito/Secretário/Governador/Senador]:

Sabia que a computação é a principal fonte de remuneração nos EUA? Há mais de 500 mil vagas de emprego disponíveis na área de computação em todo o país, mas, no último ano, apenas 42.969 alunos formados em ciência da computação entraram para a força de trabalho.

Computer science is foundational for *every* industry today, yet most schools don’t teach it. At [SCHOOL NAME], we are trying to change that.

É por isso que toda a nossa escola participará do maior evento de aprendizado da história: a Hora do Código, durante a Semana da Educação em Ciência da Computação (<%= campaign_date('full') %>). Mais de 100 milhões de alunos no mundo todo já experimentaram uma Hora do Código.

I'm writing to invite you to join our Hour of Code event and speak at our kickoff assembly. It’ll take place on [DATE, TIME, PLACE], and will make a strong statement that [State or City name] is ready to teach our students critical 21st-century skills. Queremos garantir que nossos alunos estejam na vanguarda da criação de tecnologia do futuro, e não simplesmente consumindo-a.

Entre em contato comigo [pelo telefone (número do telefone) ou pelo e-mail (endereço do e-mail)]. Aguardo sua resposta.

Atenciosamente,

[NAME], [TITLE]

<%= view :signup_button %>