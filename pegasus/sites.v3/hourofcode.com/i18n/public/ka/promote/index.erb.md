---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# მიაღებინეთ მონაწილეობა თქვენს გარშემო მყოფ საზოგადოებას კოდის ერთ საათში

## 1. გაავრცელეთ ხმა

მოუყევით თქვენს მეგობრებს **#HourOfCode**-ის შესახებ!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. სთხოვეთ მთელ თქვენს სკოლას კოდის ერთი საათის ჩატარება

[გაუგზავნეთ ეს წერილი](<%= resolve_url('/promote/resources#sample-emails') %>) თქვენს დირექტორს და შესთავაზეთ რეგისტრაციის გავლა სკოლის ყოველ კლასს.

## 3. მოუხმეთ თქვენს დამსაქმებელს, მიიღოს მონაწილეობა

[გაუგზავნეთ ეს წერილი](<%= resolve_url('/promote/resources#sample-emails') %>) თქვენს მენეჯერსა ან უფროსს.

## 4. გაავრცელეთ ინფორმაცია კოდის ერთი საათის შესახებ თქვენს ირგვლივ

[აიყვანეთ ადგილობრივი ჯგუფი](<%= resolve_url('/promote/resources#sample-emails') %>)— ბიჭების/გოგოების სკაუტების კლუბი, ეკლესია, უნივერსიტეტი, ვეტერანების ჯგუფი ან შრომითი გაერთიანება. ახალი უნარების ასათვისებლად არ არის აუცილებელი სკოლაში იყოთ. გამოიყენეთ ეს [პოსტერები, ბანერები, სტიკერები, ვიდეობი და სხვა](<%= resolve_url('/promote/resources') %>) თქვენი ღონისძიებისთვის.

## 5. მიმართეთ თქვენს ადგილობრივ ოფიციალური თანამდებობის პირს, მხარი დაუჭიროს კოდის ერთ საათს

[გაუგზავნეთ ეს წერილი](<%= resolve_url('/promote/resources#sample-emails') %>) თქვენს ადგილობრივ წარმომადგენლებს, ქალაქის მერიას ან სკოლის საბჭოს და მოიწვიეთ, ესტუმრონ სკოლას კოდის ერთი საათის ღონისძიების ფარგლებში. ასე კომპიუტერული მეცნიერების განვითარება თქვენს სივრცეში ერთი საათის მიღმაც გაგრძელდება.

<%= view :signup_button %>