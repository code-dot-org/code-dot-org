* * *

title: <%= hoc_s(:title_prizes) %> layout: wide nav: prizes_nav

* * *

<%= view :signup_button %>

# 2015 Hour of Code prizes

[col-33]

![](/images/fill-275x200/prize1.jpg)

[/col-33]

[col-33]

![](/images/fill-275x200/prize3.png)

[/col-33]

[col-33]

![](/images/fill-275x200/prize4.png)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'la' %>

# პრიზები ყველა ორგანიზატორისთვის

ყოველი პედაგოგი, რომელიც კოდის ერთ საათს ჩაატარებს თავისი მოსწავლეებისთვის მიიღებს საჩუქრად Dropbox-ზე 10GB ადგილს!

<% else %>

## პრიზი ყოველი ორგანიზატორისთვის

Every educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com or Microsoft’s Windows Store** as a thank you gift!

[col-33]

![](/images/fit-100/amazon_giftcards_crop.png)

[/col-33]

[col-33]

![](/images/fit-100/microsoft_giftcards.png)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'us' %>

## 51 სკოლა მთელი კლასისთვის მოიგებს ლეპტოპებს (ან 10 000 დოლარის ღირებულების სხვა ტექნიკას)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](%= resolve_url('/prizes/hardware-signup') %) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# ხშირად დასმული კითხვები

## Who is eligible to receive the all organizer thank you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank you gift. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank you gift?

You must sign up **before** Dec 7th in order to be eligible to receive the all organizer thank you gift.

## When will I receive my thank you gift?

We will contact you in December after Computer Science Education Week (Dec 7-11th) with next steps on how to redeem your choice of thank you gift.

## Can I receive both Amazon.com and Microsoft's Windows store credit?

No. Thank you gifts are limited to one per organizer. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank you gift.

<% if @country == 'us' %>

## აუცილებელია მთელმა სკოლამ იმონაწილეოს $10,000 დოლარის hardware-ში მოსაგებად?

დიახ. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](%= resolve_url('/prizes/hardware-signup') %). Every teacher participating will need to [sign up](%= resolve_url('/') %) their classroom individually in order to receive the all organizer thank you gift.

## Who is eligible to win the $10,000 in hardware?

პრიზი განკუთვნილია მხოლოდ საჯარო K-12 აშშ-ში მდებარე სკოლებისთვის. პრიზის მისაღებად კოდის ერთ საათზე უნდა დარეგისტრირდეს მთელი სკოლა, არაუგვიანეს 2015 წლის 16 ნოემბრისა. აშშ-ს ყოველი შტატის ერთი სკოლა მთელი კლასისთვის მიიღებს კომპიუტერებს. Code.org გამარჯვებულებს 2015 წლის 1 დეკემბრისთვის აირჩევს და დაუკავშირდება.

## რატომ არის წვდომა $10,000 hardware პრიზზე მხოლოდ საჯარო სკოლებში?

ჩვენ დიდი სიამოვნებით დავეხმარებით მასწავლებლებს როგორც საჯარო, ასევე კერძო სკოლებში, მაგრამ ამჯერად ყველაფერი ლოჯისტიკაზეა დამოკიდებული. ჩვენ გავხდით [DonorsChoose.org-ის](http://donorschoose.org) პარტნიორები რათა ვაკონტროლოთ ფინანსები კლასის პრიზებისთვის, მხოლოდ საჯარო, US K-12 სკოლებისთვის. DonorsChoose.org-ის მიხედვით, ორგანიზაციას უკეთ შეუძლია ჰქონდეს წვდომა თანმიმდევრულ და ზუსტ მონაცემებთან, რომლებიც საჯარო სკოლებშია წარმოდგენილი.

## როდის არის hardware-ს პრიზისთვის აპლიკაციის გაგზავნის ბოლო ვადა?

To qualify, you must complete the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) by November 16, 2015. აშშ-ს ყოველი შტატის ერთი სკოლა მთელი კლასისთვის მიიღებს კომპიუტერებს. Code.org გამარჯვებულებს 2015 წლის 1 დეკემბრისთვის აირჩევს და დაუკავშირდება.

## თუ ჩემი მთელი სკოლა ვერ იმონაწილევებს კოდის საათში კომპიუეტრული მეცნიერების განათლების კვირისას (დეკ. 7-13), შეიძლება მაინც მქონდეს პრიზის მოგების უფლება?

Yes, in the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) include the dates that your whole school is participating.

<% end %>

## მე ამერიკის შეერთებულ შტატებს გარეთ ვარ. შეიძლება განვიხილებოდე პრიზების მოგების კანდიდატად?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank you gift. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>