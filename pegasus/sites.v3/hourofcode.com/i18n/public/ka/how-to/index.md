---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# როგორ ვასწავლოთ კოდის ერთი საათის ფარგლებში

Join the movement and introduce a group of students to their first hour of computer science with these steps:

## 1) უყურეთ ამ ინსტრუქციის ვიდეოს <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 2) აირჩიეთ ტუტორიალი თქვენი საათისთვის:

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('https://code.org/learn') %>) for students of all ages, created by a variety of partners.

**[Student-guided Hour of Code tutorials:](<%= resolve_url("https://code.org/learn") %>)**

  * მასწავლებლისგან მომზადების მინიმალურ დროს მოითხოვს
  * აძლევს მოსწავლეს საშუალებას საკუთარი ტემპისა და უნარების მიხედვით იმეცადინოს

**[Teacher-guided Hour of Code tutorials:](<%= resolve_url("https://code.org/educate/teacher-led") %>)**

  * გაკვეთილის გეგმები, რომლებიც მასწავლებლისგან გარკვეულ მომზადებას მოითხოვენ
  * განაწილებულია კლასებისა *და* თემების (მაგ. მათემატიკა, ინგლისური და ა.შ.) მიხედვით

[![](/images/fit-700/tutorials.png)](<%= resolve_url('https://code.org/learn') %>)

## 3) გაუწიეთ პოპულარიზაცია კოდის ერთი საათის თქვენს ღონისძიებას

გაუწიეთ პოპულარიზაცია კოდის ერთი საათის თქვენს ღონისძიებას [ამ ხელსაწყოებით](<%= resolve_url('/promote') %>) და წაახალისეთ სხვები, რომ საკუთარ ღონისძიებებს უმასპინძლონ.

## 4) დაგეგმეთ, რა ტექნიკა დაგჭირდებათ - კომპიუტერი აუცილებელი არ არის

კოდის ერთი საათის საუკეთესო გამოცდილება მოიცავს ინტერნეტთან დაკავშირებულ კომპიუტერებს. მაგრამ **არ** გჭირდებათ კომპიუტერი თითოეული ბავშვისთვის - და საერთოდ კომპიუტერის გარეშეც შეგიძლიათ კოდის ერთი საათის ჩატარება.

**დაგეგმეთ წინასწარ!** ღონისძიების დაწყებამდე შეასრულეთ ჩამოთვლილი:

  * გატესტეთ ტუტორიალები მოსწავლეების კომპიუტერებსა ან დევაისებზე. დარწმუნდით, რომ ხმა და ვიდეო სათანადოდ მუშაობს ბრაუზერში.
  * არ დაგავიწყდეთ კლასის ყურსასმენებით უზრუნველყოფა, ან სთხოვეთ მოსწავლეებს მოიტანონ თავიანთი, თუ თქვენ მიერ შერჩეული ტუტორიალის გასავლელად საჭიროა ხმა.
  * **არ გაქვთ საკმარისი რაოდენობის მოწყობილობა?** სცადეთ[პროგრამირება წყვილებში](https://www.youtube.com/watch?v=vgkahOzFH2Q). წყვილში მუშაობისას მოსწავლეები ეხმარებიან ერთმანეთს და ნაკლებად არიან დამოკიდებული მასწავლებელზე. ამის გარდა, ისინი ხვდებიან, რომ პროგრამირებაში მნიშვნელოვანია თანამშრომლობა.
  * **ინტერნეტს დაბალი სიჩქარე აქვს?** აჩვენეთ ვიდეოები ერთ დიდ ეკრანზე - ასე ყოველ მოსწავლეს არ დასჭირდება ცალკე ჩატვირთოს ვიდეო. ან სცადეთ ოფლაინ-ტუტორიალები.

![](/images/fit-350/group_ipad.jpg)

## 5) კოდის ერთი საათი დაიწყეთ შთამაგონებელი მომხსენებლით ან ვიდეოთი

**Invite a [local volunteer](https://code.org/volunteer/local) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code. [Use this map](https://code.org/volunteer/local) to find local volunteers who can visit your classroom or join a video chat with your students.

[![](/images/fit-300/volunteer-map.png)](<%= resolve_url('https://code.org/volunteer/local') %>)

**აჩვენეთ შთამაგონებელი ვიდეო:**

  * Code.org-ის მთავარი ვიდეო-რგოლი, რომელშიც ლაპარაკობენ ბილ გეითსი, მარკ ცუკერბერგი და NBA ვარსკვლავი ქრის ბოში (ხანგრძლივობა: [1 წუთი](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 წუთი](https://www.youtube.com/watch?v=nKIu9yen5nc) ან [9 წუთი](https://www.youtube.com/watch?v=dU1xS07N-FA))
  * [კოდის ერთი საათის პრომოვიდეო](https://www.youtube.com/watch?v=FC5FbmsH4fw), ან <% if @country == 'uk' %> [2015 წლის კოდის ერთი საათის ვიდეო ](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [2015 წლის კოდის ერთი საათის ვიდეო](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [პრეზიდენტი ობამა მოუწოდებს ყველა მოსწავლეს პროგრამირების სწავლას](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * მეტი შთამაგონებელი ვიდეო იხილეთ [აქ](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

  * ახსენით, რა გავლენას ახდენს ტექნოლოგია ჩვენს ცხოვრებაზე. გამოიყენეთ მაგალითები, რომლებიც გოგონებისთვის და ბიჭებისთვის ერთნაირად საინტერესო იქნება (ესაუბრეთ სიცოცხლის გადარჩენაზე, ადამიანების დახმარებაზე, მათ ერთმანეთთან დაკავშირებაზე და ა. შ.).
  * კლასთან ერთად ჩამოწერეთ ყოველდღიური გამოყენების საგნები, რომლებიც იყენებენ პროგრამირებას.
  * გაიგეთ, როგორ დააინტერესოთ გოგონები პროგრამირებითა და ინფორმატიკით [აქ](<%= resolve_url('https://code.org/girls') %>).

**Need more guidance?** Download this [template lesson plan](/files/EducatorHourofCodeLessonPlanOutline.docx).

** გინდათ მეტი იდეა? ** გაეცანით ჩვენი გამოცდილი მასწავლებლების [ სწავლების საუკეთესო პრაქტიკებს ](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466).

## 6) დაწერეთ კოდი!

**Direct students to the activity**

  * დაწერეთ გაკვეთილის ბმული დაფაზე. ლინკი შეგიძლიათ მონაწილეების რიცხვს ქვემოთ, [თქვენი არჩეული გაკვეთილის ინფორმაციაში](<%= resolve_url('https://code.org/learn') %>) იხილოთ.

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

**When your students come across difficulties it's okay to respond:**

  * "არ ვიცი. მოდი, ერთად ვიპოვოთ გამოსავალი"
  * ტექნოლოგია ყოველთვის არ იქცევა ისე, როგორც ჩვენ გვინდა
  * "პროგრამირების სწავლა უცხო ენის სწავლას ჰგავს; შეუძლებელია დაუყოვნებლივ დაიწყოთ გამართულად საუბარი."

**[Check out these teaching tips](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**What to do if a student finishes early?**

  * მოსწავლეებს შეუძლიათ ყველა გაკვეთილის ნახვა და კოდის ერთი საათის სხვა აქტივობის ცდა აქ [<%= resolve_url('code.org/learn') %>](<%= resolve_url('https://code.org/learn') %>)
  * ან მას შეუძლია დაეხმაროს იმ კლასელებს, ვისაც გაუჭირდა დავალებების შესრულება.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) აღნიშნეთ

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * [დაბეჭდეთ სერთიფიკატები](<%= resolve_url('https://code.org/certificates') %>) თქვენი მოსწავლეებისთვის.
  * [ამობეჭდეთ სტიკერები "მე გავიარე კოდის ერთი საათი!"](<%= resolve_url('/promote/resources#stickers') %>) თქვენი მოსწავლეებისთვის.
  * [შეუკვეთეთ მაისურები](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) თქვენი სკოლისთვის.
  * გააზიარეთ თქვენი კოდის ერთი საათის სურათები და ვიდეობი სოციალურ მედიაში. გამოიყენეთ #HourOfCode და @codeorg - ასე ჩვენც შევძლებთ გავაზიაროთ თქვენი წარმატება!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## კოდის ერთი საათის სხვა რესურსები მასწავლებლებისთვის:

  * გამოიყენეთ ეს [გაკვეთილის გეგმის ნიმუში](/files/EducatorHourofCodeLessonPlanOutline.docx) და დაგეგმეთ თქვენი კოდის ერთი საათი.
  * მიიღეთ [საუკეთესო რჩევები](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) შარშანდელი კოდის ერთი საათის მასწავლებლებისგან. 
  * უყურეთ ჩვენი [პედაგოგების კოდის ერთი საათის ვებინარის](https://youtu.be/EJeMeSW2-Mw) ჩანაწერს.
  * [დაესწარით კითხვებისა და პასუხების სესიას რეალურ დროში](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) ჩვენს დამფუძნებელთან ჰადი პატოვთან და გაიგეთ მეტი კოდის ერთი საათის შესახებ.
  * მხარდაჭერისა და რჩევებისთვის ესტუმრეთ [კოდის ერთი საათის ფორუმს](http://forum.code.org/c/plc/hour-of-code). <% if @country == 'us' %>
  * გადახედეთ [კოდის ერთი საათის ხშირად დასმულ კითხვებს](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## რა ხდება კოდის ერთი საათის შემდეგ?

კოდის ერთი საათი ტექნოლოგიების მუშაობისა და პროგრამირების შესწავლის ერთი პატარა ეტაპია. ამ მოგზაურობის გასაგრძელებლად:

  * ურჩიეთ მოსწავლეებს, რომ გააგრძელონ [ონლაინ სწავლა](<%= resolve_url('https://code.org/learn/beyond') %>).
  * [დაესწარით ](<%= resolve_url('https://code.org/professional-development-workshops') %>) ერთდღიან ვორქშოპს და გაიარეთ ინსტრუქტაჟი კომპიუტერული მეცნიერებების გამოცდილი ქომაგისგან. (მხოლოდ აშშ–ის პედაგოგებისთვის)

<%= view :signup_button %>