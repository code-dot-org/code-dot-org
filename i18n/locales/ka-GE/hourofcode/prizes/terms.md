* * *

title: <%= hoc_s(:title_prizes_terms) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# პრიზები - წესები და პირობები

## Amazon.com, iTunes and Windows Store credit:

The Amazon.com, iTunes and Windows Store credit are limited to K-12 faculty, educators for afterschool clubs, and education organizations. The $10 credit must be added to an existing account, and the credit expires after 1 year. ერთ ორგანიზატორს მხოლოდ ერთი კოდის გააქტიურება შეუძლია.

Every organizer must register for the Hour of Code in order to receive the Amazon.com, iTunes or Windows Store credit. თუ კოდის ერთ საათში მთელი სკოლა იღებს მონაწილეობას, პრიზების მისაღებად ყოველი მასწავლებელი ცალკე უნდა დარეგისტრირდეს ორგანიზატორად.

Code.org will contact organizers after the Hour of Code (Dec. 7-13) to provide instructions for redeeming Amazon.com, iTunes and Windows Store credit.

<% if @country == 'us' %>

## ლეპტოპები მთელი კლასისთვის (ან 10 000 დოლარის ღირებულების სხვა ტექნიკა):

პრიზი განკუთვნილია მხოლოდ საჯარო K-12 აშშ-ში მდებარე სკოლებისთვის. პრიზის მისაღებად კოდის ერთ საათზე უნდა დარეგისტრირდეს მთელი სკოლა, არაუგვიანეს 2015 წლის 16 ნოემბრისა. აშშ-ს ყოველი შტატის ერთი სკოლა მთელი კლასისთვის მიიღებს კომპიუტერებს. Code.org გამარჯვებულებს 2015 წლის 1 დეკემბრისთვის აირჩევს და დაუკავშირდება.

დავაზუსტებთ, რომ ეს არ არის გათამაშება ან მხოლოდ გამართლებაზე დაფუძნებული შეჯიბრი.

1) განცხადების შეტანა არ არის დაკავშირებული ფინანსურ რისკთან - მონაწილეობა შეუძლია ნებისმიერ სკოლასა ან კლასს და არანაირი გადასახადი, Code.org თუ სხვა ორგანიზაციისთვის არ მოითხოვება

2) გამარჯვებულებს ავარჩევთ მხოლოდ იმ სკოლებს შორის, სადაც მთელი კლასი (ან სკოლა) იღებს მონაწილეობას კოდის ერთ საათში, რაც ნიშნავს მოსწავლეებისა და მასწავლებლების კოლექტიური უნარების ტესტის ჩაბარებასაც.

<% end %>

<% if @country == 'us' || @country == 'ca' %>

## ვიდეოჩატი მოწვეულ სპიკერთან:

პრიზი განკუთვნილია K-12 კლასებისთვის მხოლოდ აშშ-სა და კანადაში. Code.org აირჩევს გამარჯვებულ კლასებს, განსაზღვრავს ვიდეოჩატის დროს და ითანამშრომლებს შესაბამის მასწავლებელთან ტექტინიკური დეტალების მოსაგვარებლად. ამ პრიზის მისაღებად არ არის აუცილებელი მთელი სკოლის რეგისტრაცია. Both public and private schools are eligible to win.

<% end %>

<%= view :signup_button %>