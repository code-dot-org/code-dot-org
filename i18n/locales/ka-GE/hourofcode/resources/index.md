* * *

title: <%= hoc_s(:title_resources) %> layout: wide

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

<%= view :resources_banner %>

# მადლობა კოდის საათზე დარეგისტრირებისთვის!

თქვენ შესაძლოს ხდით მოსწავლეებისთვის მთელს მსოფლიოში კოდის საათში ჩართვას, რასაც შეუძლია *მათი დარჩენილი ცხოვრების შეცვლა*, დეკემბრის განმავლობაში <%= campaign_date('full') %>.

პრიზების, ახალი ტუტორიალებისა და სხვა საინტერესო სიახლეების შესახებ ყოველთვის შეგატყობინებთ. გაინტერესებთ, ახლა რა შეიძლება, გააკეთოთ?

## 1. გაავრცელეთ ხმა

მოუყევით თქვენს მეგობრებს #HourOfCode-ის შესახებ.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. სთხოვეთ მთელ თქვენს სკოლას კოდის საათის ჩატარება

[Send this email](<%= resolve_url('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## 3. მიმართეთ თქვენს დამსაქმებელს რომ იმონაწილეოს

[Send this email](<%= resolve_url('/resources#email') %>) to your manager or the CEO.

## 4. მოყევით კოდის საათის შესახებ თქვენს საზოგადოებაში

დაარეგისტრირეთ ადგილობრივი ჯგუფი — ბიჭების/გოგოების სკაუტების კლუბი, ეკლესია, უნივერსიტეტი, უნივერსიტეტების ჯგუფი ან მშრომელთა გაერთიანება. ან ჩაატარეთ კოდის საათის "უბნის წვეულება" თქვენი სამეზობლოსთვის.

## 5. მიმართეთ თქვენს ადგილობრივ ოფიციალური თანამდებობის პირს, მხარი დაუჭიროს კოდის საათს

[Send this email](<%= resolve_url('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view :signup_button %>