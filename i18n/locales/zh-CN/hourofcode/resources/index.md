* * *

title: <%= hoc_s(:title_resources) %> layout: wide

* * *

<% 脸书网 = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %> - 编程一小时

<%= view :resources_banner %>

# 感谢注册并组织编程一小时活动！

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during <%= campaign_date('full') %>.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## 1. 帮助宣传这个活动

告诉你的朋友关于 #编程一小时

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. 邀请你的学校加入编程一小时

[Send this email](<%= resolve_url('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 请求你的雇主参与其中

[Send this email](<%= resolve_url('/resources#email') %>) to your manager or the CEO.

## 在你的社区里推广编程一小时

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## 5.邀请当地官员支持编程一小时活动

[Send this email](<%= resolve_url('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view :signup_button %>