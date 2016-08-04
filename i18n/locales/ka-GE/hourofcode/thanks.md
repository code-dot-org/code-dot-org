* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# მადლობა კოდის ერთი საათის ორგანიზატორად დარეგისტრირებისთვის!

თქვენ მოსწავლეებს მთელს მსოფლიოში აძლევთ კოდის საათში ჩართვის შესაძლებლობას, რაც *მათ ცხოვრებას შეცვლის*, <%= campaign_date('full') %> განმავლობაში. We'll be in touch about new tutorials and other exciting updates. რისი გაკეთება შეგიძლიათ ახლა?

## 1. გაავრცელეთ ხმა

თქვენ შემოუერთდით კოდის ერთი საათის მოძრაობას. მოუყევით თქვენს მეგობრებს: **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. მოძებნეთ ადგილობრივი მოხალისე, რომელიც თქვენი ღონისძიების ჩატარებაში დაგეხმარებათ.

[გამოიკვლიეთ ჩვენი მოხალისეების რუკა](%= resolve_url('https://code.org/volunteer/local') %) და იპოვეთ მოხალისე, რომელიც მოვა თქვენს კლასში ან ვიდეო–ჩატით მოუყვება თქვენს მოსწავლეებს კომპიუტერული მეცნიერების შესაძლებლობებზე.

## 3. სთხოვეთ მთელ თქვენს სკოლას კოდის ერთი საათის ჩატარება

[გაუგზავნეთ ეს წერილი](%= resolve_url('/promote/resources#sample-emails') %) თქვენს დირექტორს და შესთავაზეთ რეგისტრაციის გავლა სკოლის ყოველ კლასს.

## 4. მოუხმეთ თქვენს დამსაქმებელს, მიიღოს მონაწილეობა

[გაუგზავნეთ ეს წერილი](%= resolve_url('/promote/resources#sample-emails') %) თქვენს მენეჯერსა ან უფროსს.

## 5. გაავრცელეთ ინფორმაცია კოდის ერთი საათის შესახებ თქვენს ირგვლივ

[აიყვანეთ ადგილობრივი ჯგუფი](%= resolve_url('/promote/resources#sample-emails') %)— ბიჭების/გოგოების სკაუტების კლუბი, ეკლესია, უნივერსიტეტი, ვეტერანების ჯგუფი ან შრომითი გაერთიანება. ახალი უნარების ასათვისებლად არ არის აუცილებელი სკოლაში იყოთ. გამოიყენეთ ეს [პოსტერები, ბანერები, სტიკერები, ვიდეობი და სხვა](%= resolve_url('/promote/resources') %) თქვენი ღონისძიებისთვის.

## 6. მიმართეთ თქვენს ადგილობრივ ოფიციალური თანამდებობის პირს, მხარი დაუჭიროს კოდის ერთ საათს

[გაუგზავნეთ ეს წერილი](%= resolve_url('/promote/resources#sample-emails') %) თქვენს ადგილობრივ წარმომადგენლებს, ქალაქის მერიას ან სკოლის საბჭოს და მოიწვიეთ, ესტუმრონ სკოლას კოდის ერთი საათის ღონისძიების ფარგლებში. ასე კომპიუტერული მეცნიერების განვითარება თქვენს სივრცეში ერთი საათის მიღმაც გაგრძელდება.

## 7. დაგეგმეთ თქვენი კოდის ერთი საათი

აირჩიეთ კოდის ერთი საათის აქტივობა და [გადახედეთ ამ სახელმძღვანელოს](%= resolve_url('/how-to') %).

<%= view 'popup_window.js' %>