---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
nav: how_to_nav
social:
  "og:title": <%= hoc_s(:meta_tag_og_title) %>
  "og:description": <%= hoc_s(:meta_tag_og_description) %>
  "og:image": http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": http://<%=request.host%>
  "twitter:card": player
  "twitter:site": '@codeorg'
  "twitter:url": http://<%=request.host%>
  "twitter:title": <%= hoc_s(:meta_tag_twitter_title) %>
  "twitter:description": <%= hoc_s(:meta_tag_twitter_description) %>
  "twitter:image:src": http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png
---
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HoraDoCodigo' %>

# Obrigado por se inscrever para sediar a Hora do Código!

Como forma de agradecer sua ajuda em tornar possível que novos alunos aprendam ciência da computação, gostaríamos de oferecer um conjunto gratuito de pôsteres impressos profissionalmente para uso em sala de aula. Use o código de oferta **FREEPOSTERS** na hora de fechar o pedido. (Nota: A oferta só estará disponível enquanto durar o estoque do material, e você precisará cobrir os custos de envio. Uma vez que esses pôsteres são enviados dos Estados Unidos, os custos de envio podem ser bastante elevados se forem enviados para o Canadá e internacionalmente. Entendemos que isso pode não estar em seu orçamento e nós encorajamos você a imprimir os arquivos PDF para sua sala de aula.)  
<br /> [<button>Obtenha cartazes</button>](https://store.code.org/products/code-org-posters-set-of-12) Use o código de oferta FREEPOSTERS</p> 

<% if @country == 'us' %> Thanks to the generosity of Ozobot, Dexter Industries, littleBits, and Wonder Workshop, over 100 classrooms will be selected to receive robots or circuits for their class! To be eligible to receive a set, make sure to complete the survey sent from Code.org after the Hour of Code. Code.org will select the winning classrooms. In the meantime, check out some of the robotics and circuits activities. Please note that this is only open for US schools. <% end %>

<br /> **The Hour of Code runs during <%= campaign_date('full') %> and we'll be in touch about new tutorials and other exciting updates as they come out. In the meantime, what can you do now?**

## 1. Divulgue o evento em sua escola e comunidade

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> Incentive os outros a participar [com nossos e-mails de amostra.](%= resolve_url('/promote/resources#sample-emails') %) Entre em contato com seu diretor e desafie todas as salas de aula da sua escola para se inscrever. Recrute um grupo local - clubes de escoteiros ou escoteiras, igrejas, universidades, sindicatos ou até mesmo alguns amigos. Você não precisa estar na escola para aprender novas habilidades. Convide um político local ou legislador para visitar sua escola para a Hora do Código. Isso pode ajudá-lo a conseguir suporte para o ensino da Ciência da Computação para além de uma hora.

Use estes [cartazes, banners, adesivos, vídeos e muito mais](%= resolve_url('/promote/resources') %) em seu próprio evento.

## 2. Encontre um voluntário da região para ajudar com o seu evento.

[Procure em nosso mapa de voluntários](%= resolve_url('https://code.org/volunteer/local') %) para ver os voluntários que podem visitar sua sala de aula ou participar de uma videoconferência remota para inspirar seus alunos sobre as várias possibilidades trazidas pela ciência da computação.

## 3. Planeje sua Hora do Código

Escolha uma [atividade da Hora do Código](https://hourofcode.com/learn) para sua classe e [reveja este guia de instruções](%= resolve_url('/how-to') %).

# Vá além da Hora do Código

<% if @country == 'us' %> A Hora do código é só o início. Não importa se você é administrador, professor ou entusiasta da tecnologia: nós temos [desenvolvimento profissional, currículo e recursos para ajudar você a iniciar ou expandir as aulas de ciência da computação em sua escola.](https://code.org/yourschool) Se você já ensina ciência da computação, use esses recursos durante a Semana da Educação da Ciência da Computação para reforçar o apoio da administração da escola, dos pais e da comunidade.

Você tem muitas opções para se adequar à sua escola. A maioria das organizações que oferecem os tutoriais da Hora do Código também possuem planos de estudo e desenvolvimento profissional disponível. Se você encontrar uma lição que você gosta, pergunte sobre ir mais longe. Para ajudá-lo a começar, destacamos vários [provedores de planos de estudos que ajudarão ou seus alunos a ir além da hora.](https://hourofcode.com/beyond)

<% else %> A Hora do código é só o início. A maioria das organizações oferecendo aulas da hora do código também tem planos de estudo disponíveis para ir mais longe. Para ajudá-lo a começar, destacamos vários [provedores de planos de estudos que ajudarão ou seus alunos a ir além da hora.](https://hourofcode.com/beyond)

Code.org também oferece [cursos introdutórios de ciência da computação](https://code.org/educate/curriculum/cs-fundamentals-international) completos, traduzidos em mais de 25 línguas sem nenhum custo para você ou sua escola. <% end %>

<%= view 'popup_window.js' %>