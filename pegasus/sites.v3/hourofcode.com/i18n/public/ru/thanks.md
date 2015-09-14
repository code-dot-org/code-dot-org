<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Спасибо за регистрацию на проведение Часа Кода!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. Распространите новость

Расскажите своим друзьям про #ЧасКода.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Попросите провести Час Программирования в Вашей школе

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## Обратитесь к вашему руководству с предложением принять участие в проекте Час Кодирования

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## 4. Расскажите о проекте Час Кодирования там, где вы живете

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5.Обратитесь к вашему местному должностному лицу c просьбой поддержать проект Час Кодирования

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>