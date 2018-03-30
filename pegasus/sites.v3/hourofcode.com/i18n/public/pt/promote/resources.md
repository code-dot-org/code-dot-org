---
title: <%= hoc_s(:title_resources) %>
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

[![imagem](<%= localized_image('/images/fit-200/hour-of-code-logo.png') %>)](<%= localized_image('/images/hour-of-code-logo.png') %>)

[Baixar versões em alta resolução](http://images.code.org/share/hour-of-code-logo.zip)

**A "Hour of Code" (Hora do Código) é uma marca registrada. Não queremos impedir seu uso, mas queremos garantir que ele se enquadre em alguns limites:**

1. Qualquer referência à marca "Hour of Code" deve ser feita de forma que não sugira que ela é uma marca de sua propriedade, mas uma referência à Hora do Código como um movimento popular. **Um bom exemplo: "Participe da Hora do Código® na ACMECorp.com". Exemplo de uso errado: "Experimente a Hora do Código da ACME Corp".**
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

### Peça para sua escola, empregador ou amigos se inscreverem:

**Linha de assunto:** Junte-se a mim e a mais 100 milhões de estudantes para uma Hora de Código

Computadores estão em toda parte, mudando todos os setores do planeta. Mas menos da metade das escolas ensina ciência da computação. A boa notícia é que estamos a caminho de mudar essa realidade! Se você ouviu sobre a Hora do Código antes, deve saber que ela fez história. Mais de 100 milhões de estudantes já participaram de uma Hora do Código.

Com a Hora do Código, a ciência da computação tem aparecido nas páginas iniciais do Google, MSN, Yahoo! e da Disney. Mais de 100 parceiros se uniram para apoiar este movimento. Todas as lojas da Apple no mundo já sediaram uma Hora do Código, e líderes como o Presidente Obama e o Primeiro Ministro do Canadá - Justin Trudeau - escreveram suas primeiras linhas de código como parte da campanha.

Esse ano, vamos torná-lo ainda maior. I’m asking you to join the Hour of Code <%= campaign_date('year') %>. Por favor, se envolva com um evento da Hora do Código durante a Semana de Educação da Ciência da Computação, <%= campaign_date('full') %>.

Espalhe a ideia. Sedie um evento. Peça a uma escola local que se inscreva. Ou experimente uma Hora do Código você mesmo - todos podem se beneficiar aprendendo os fundamentos.

Comece já em http://hourofcode.com/<%= @country %>

<a id="help-schools"></a>

### Voluntário em uma escola:

**Assunto:** Podemos ajudar você a sediar um evento Hora do Código?

Between <%= campaign_date('short') %>, ten percent of students around the world will celebrate Computer Science Education Week by doing an Hour of Code event at their school. It’s an opportunity for every child to learn how the technology around us works.

[Nossa organização / meu nome] adoraria ajudar [nome da escola] a executar um evento da Hora do Código. Podemos ajudar os professores hospedar uma Hora do Código em suas salas de aula (nem sequer precisamos de computadores!) ou se você gostaria de hospedar uma palestra na escola, nós podemos arranjar um orador para falar sobre como a tecnologia funciona e o que é necessário para ser um engenheiro de software.

Os alunos criarão seus próprios aplicativos ou jogos e podem mostrar seus pais, e nós também vamos imprimir certificados da Hora do Código que os alunos podem levar para casa. E, é divertido! Com atividades interativas, mão na massa, os alunos aprenderão habilidades de pensamento computacional de forma acessível.

Computadores estão em toda parte, mudando todos os setores do planeta. Mas menos da metade das escolas ensina ciência da computação. A boa notícia é que estamos a caminho de mudar essa realidade! Se você ouviu falar sobre a Hora do Código, talvéz você saiba que ela fez história - mais de 100 milhões de estudantes em todo o mundo participaram de uma Hora do Código.

Graças à Hora do Código, a ciência da computação estava nas páginas iniciais do Google, MSN e Yahoo. Mais de 100 parceiros se uniram para apoiar este movimento. Todas as lojas da Apple no mundo já sediaram uma Hora do Código, e líderes como o Presidente Obama e o Primeiro Ministro do Canadá - Justin Trudeau - escreveram suas primeiras linhas de código como parte da campanha.

Você pode ler mais sobre o evento no http://hourofcode.com/. Ou, deixe-nos saber se você gostaria de agendar algum tempo para falar sobre como [nome da escola] pode participar.

Obrigado!

[Seu nome], [organização]

<a id="media-pitch"></a>

### Convide a mídia para participar de seu evento:

**Assunto:** Escola local participa da missão de levar a ciência da computação aos alunos

Os computadores estão em toda parte, mudando todos os setores do planeta, mas menos da metade das escolas ensina ciência da computação. As minorias sociais e as mulheres têm baixíssima representação nas aulas de ciência da computação, bem como no setor da tecnologia. A boa notícia é que estamos a caminho de mudar essa realidade.

Com a Hora do Código, a ciência da computação tem aparecido nas páginas iniciais do Google, MSN, Yahoo! e da Disney. Mais de 100 parceiros se uniram para apoiar este movimento. Todas as lojas da Apple do mundo já sediaram uma Hora do Código. Presidente Obama escreveu sua primeira linha de código como parte da campanha.

É por isso que cada um dos [X number] alunos da [SCHOOL NAME] estão participando do maior evento de aprendizado da história: a Hora do Código, durante a Semana de Educação da Ciência da Computação (<%= campaign_date('full') %>).

Estou escrevendo para convidar você a comparecer ao nosso evento inicial, e ver crianças iniciarem a atividade em [DATA].

A Hora do Código, organizada pela Code.org (uma organização sem fins lucrativos) e outras 100 organizações, é um movimento global que acredita que os estudantes de hoje estão prontos para aprender habilidades fundamentais para o sucesso do século XXI. Junte-se a nós.

**Contato:** [SEU NOME], [TÍTULO], cell: (212) 555-5555 **Quando:** [DATA e HORÁRIO do seu evento] **Onde:** [ENDEREÇO e DIREÇÕES]

Aguardo seu contato.

[Seu Nome]

<a id="parents"></a>

### Informe os pais sobre o evento de sua escola:

**Assunto:** Nossos alunos estão mudando o futuro com uma Hora do Código

Caros pais,

Vivemos em um mundo rodeado por tecnologia. E sabemos que, independentemente da área que nossos alunos escolham seguir na vida adulta, sua capacidade de alcançar o sucesso dependerá cada vez mais de compreender como a tecnologia funciona.

Mas apenas uma pequena fração de nós está aprendendo **como** a tecnologia funciona. Menos da metade das escolas ensina ciência da computação.

É por isso que toda a nossa escola participará do maior evento de aprendizado da história: a Hora do Código, durante a Semana da Educação em Ciência da Computação (<%= campaign_date('full') %>). Mais de 100 milhões de alunos no mundo todo já experimentaram uma Hora do Código.

Nossa Hora do Código é uma prova de que a [NOME DA ESCOLA] está pronta para ensinar essas habilidades fundamentais do século XXI. Para continuar levando atividades de programação aos nossos alunos, queremos fazer da Hora do Código um grande evento. Convido você a se voluntariar, contactar os meios de comunicação locais, compartilhar as notícias em suas mídias sociais e considerar a possibilidade de promover outros eventos da Hora do Código em sua comunidade.

Esta é uma oportunidade de mudar o futuro da educação em [NOME DA CIDADE].

Veja http://hourofcode.com/ < % = @country %> para mais detalhes, e ajude a espalhar a ideia.

Atenciosamente,

Seu diretor

<a id="politicians"></a>

### Convide um representante político local para o evento de sua escola:

**Assunto:** Junte-se a nossa escola enquanto mudamos o futuro com uma Hora do Código

Caro, [NOME Prefeito/Secretário/Governador/Senador]:

Sabia que a computação é a principal fonte de remuneração nos EUA.? Há mais de 500 mil vagas de emprego disponíveis na área de computação em todo o país, mas, no último ano, apenas 42.969 alunos formados em ciência da computação entraram para a força de trabalho.

A ciência da computação é fundamental para *todos* os setores hoje em dia. Ainda assim, a maioria das escolas não a ensina. Na [NOME DA ESCOLA], estamos tentando mudar isso.

É por isso que toda a nossa escola participará do maior evento de aprendizado da história: a Hora do Código, durante a Semana da Educação em Ciência da Computação (<%= campaign_date('full') %>). Mais de 100 milhões de alunos no mundo todo já experimentaram uma Hora do Código.

Estou escrevendo para convidá-lo a participar do nosso evento da Hora do Código e falar na nossa palestra inicial. Será no dia [DATA, HORA, LOCAL], e servirá para mostrar que [Nome da Cidade ou Estado] está pronto(a) para ensinar as habilidades fundamentais do século XXI aos nossos alunos. Queremos garantir que nossos alunos estejam na vanguarda da criação de tecnologia do futuro, e não apenas consumindo-a.

Entre em contato comigo pelo telefone: [TELEFONE] ou e-mail: [EMAIL]. Aguardo sua resposta.

Atenciosamente,

[Seu Nome], [Título]

<%= view :signup_button %>