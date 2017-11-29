---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Get your community involved in the Hour of Code

## Сөзді жариялаңыз

Tell your friends about the **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## Түгел мектебіңізге Кодтау Сағатын ұсыныңыз

Сіздің басты міндетіңіз ретінде мектебіңіздегі әрбір сыныпты тіркеу үшін оларға [мына электрондық поштаны жіберіңіз](%= resolve_url('/promote/resources#sample-emails') %).

## Қызметкеріңізді қатысуға шақырыңыз

[Бұл email-ды](%= resolve_url('/promote/resources#sample-emails') %) өзіңіздің менеджер немесе компания CEO-сына жіберіңіз.

## Өз қауымығызға Код Сағатын жарнамалаңыз

[Жергілікті топ құрыңыз](%= resolve_url('/promote/resources#sample-emails') %) - ер/қыз барлаушы клубтары, шіркеу, университет, ардагерлер тобы, кәсіподақ, тіпті, немесе кейбір достарыңыз. Жаңа дағдыларды үйрену үшін сізге мектепте болу қажет емес. Өзіңіздің шараңыз үшін [мына постер, баннер, стикер, видео және тағы басқаларын](%= resolve_url('/promote/resources') %) пайдаланыңыз.

## Жергілікті лауазымды тұлғаларды Кодтау Сағатын демеуге шақырыңыз

Жергілікті өкілдерге, қалалық кеңеске немесе мектеп тақтасына [мына электрондық поштаны жіберіңіз](%= resolve_url('/promote/resources#sample-emails') %) және Кодтау Сағатында сіздің сыныпты қарауға шақырыңыз. Бұл сағаттан тыс уақытта сіздің ауданда компьютер ғылымдарын құруда көмегін тигізеді.

<%= view :signup_button %>