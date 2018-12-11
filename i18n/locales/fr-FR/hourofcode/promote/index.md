---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_donor_text).gsub(/%{random_donor}/, get_random_donor_twitter)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_donor_text).include? '#HourOfCode' %>

# Encouragez votre communauté à s'investir dans l'Heure de Code

## 1. Parlez-en autour de vous

Faites connaître l'Heure de Code à vos amis: **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Proposez à votre école de participer à Une Heure de Code

[Envoyez ce courriel](%= resolve_url('/promote/resources#sample-emails') %) à votre principal ou au directeur de votre école et proposez à chaque professeur de s'inscrire.

## 3. Invitez votre employeur à s'impliquer

[Envoyez ce courriel](%= resolve_url('/promote/resources#sample-emails') %) à votre chef ou le PDG de votre société.

## 4. Promouvez votre Heure de Code dans votre communauté

[Recrutez un groupe local](%= resolve_url('/promote/resources#sample-emails') %) — associations, église, université, groupe d'anciens combattants, syndicat ou tout simplement vos amis. Pas besoin d'être à l'école pour apprendre de nouvelles compétences. Utilisez ces [affiches, banderoles, autocollants, vidéos et plus encore](%= resolve_url('/promote/resources') %) pour votre évènement.

## 5. Demandez à un élu local de soutenir l'initiative Une Heure de Code

[Envoyez cet email](%= resolve_url('/promote/resources#sample-emails') %) à vos représentants locaux, Conseil municipal ou Commission scolaire et invitez-les à visiter votre école durant votre Heure de Code. Ça pourrait aider à agrandir le groupe des amoureux d'informatique de votre région au-delà du projet d'une heure.

<%= view :signup_button %>