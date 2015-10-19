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

# Præmier til alle arrangører

Every educator who hosts an Hour of Code for students receives 10 GB of Dropbox space as a thank you gift!

<% else %>

## Prizes for EVERY organizer

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

## 51 schools will win a class-set of laptops (or $10,000 for other technology)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](%= resolve_url('/prizes/hardware-signup') %) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# FAQ

## Who is eligible to receive the all organizer thank you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank you gift. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank you gift?

You must sign up **before** Dec 7th in order to be eligible to receive the all organizer thank you gift.

## When will I receive my thank you gift?

We will contact you in December after Computer Science Education Week (Dec 7-11th) with next steps on how to redeem your choice of thank you gift.

## Can I receive both Amazon.com and Microsoft's Windows store credit?

No. Thank you gifts are limited to one per organizer. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank you gift.

<% if @country == 'us' %>

## Skal hele din skole deltage, for at vinde for $10.000 i hardware?

Yes. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](%= resolve_url('/prizes/hardware-signup') %). Every teacher participating will need to [sign up](%= resolve_url('/') %) their classroom individually in order to receive the all organizer thank you gift.

## Who is eligible to win the $10,000 in hardware?

Præmien er desværre begrænset til offentlige K-12 amerikanske skoler. To qualify, your entire school must register for the Hour of Code by November 16, 2015. En skole, fra hver af de amerikanske stater, vil modtage en klassesæt computere. Code.org will select and notify winners via email by December 1, 2015.

## Hvorfor kan præmien på $10.000 hardware kun vindes af offentlige skoler i USA?

Vi ville elske at hjælpe lærere i både offentlige og private skoler, men på dette tidspunkt, kan det logistisk ikke lade sig gøre. Vi har indgået et samarbejde med [DonorsChoose.org](http://donorschoose.org) som administrator af præmierne, og de arbejder kun arbejder sammen med offentlige skoler. Ifølge DonorsChoose.org har organisationen kun adgang til de data, der er til rådighed for offentlige skoler.

## Hvornår er fristen for at tilmelde sig hardware-prisen?

To qualify, you must complete the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) by November 16, 2015. En skole, fra hver af de amerikanske stater, vil modtage en klassesæt computere. Code.org will select and notify winners via email by December 1, 2015.

## If my whole school can’t do the Hour of Code during Computer Science Education Week (Dec. 7-13), can I still qualify for prizes?

Yes, in the [Hardware Application form](%= resolve_url('/prizes/hardware-signup') %) include the dates that your whole school is participating.

<% end %>

## Jeg bor uden for USA. Kan jeg vinde nogen af præmierne?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank you gift. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>