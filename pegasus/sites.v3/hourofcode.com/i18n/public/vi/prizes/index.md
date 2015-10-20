---

title: <%= hoc_s(:title_prizes) %>
layout: wide
nav: prizes_nav

---

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

# Giải thưởng cho mọi nhà tổ chức

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

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# Những câu hỏi thường gặp

## Who is eligible to receive the all organizer thank you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank you gift. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank you gift?

You must sign up **before** Dec 7th in order to be eligible to receive the all organizer thank you gift.

## When will I receive my thank you gift?

We will contact you in December after Computer Science Education Week (Dec 7-11th) with next steps on how to redeem your choice of thank you gift.

## Can I receive both Amazon.com and Microsoft's Windows store credit?

No. Thank you gifts are limited to one per organizer. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank you gift.

<% if @country == 'us' %>

## Có phải toàn trường bạn phải tham gia để giành chiến thắng $10.000 trong cuộc thi Hardware?

Yes. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](<%= resolve_url('/prizes/hardware-signup') %>). Every teacher participating will need to [sign up](<%= resolve_url('/') %>) their classroom individually in order to receive the all organizer thank you gift.

## Who is eligible to win the $10,000 in hardware?

Giải thưởng chỉ giới hạn cho hệ thống trường học 12 khối ở Mỹ. To qualify, your entire school must register for the Hour of Code by November 16, 2015. Một lớp học ở bất kì tiểu bang nào của Mỹ sẽ được trang bị máy tính. Code.org will select and notify winners via email by December 1, 2015.

## Tại sao giải thưởng $10.000 phần cứng chỉ dành cho các trường công lập?

Chúng tôi rất muốn giúp các giáo viên trong trường công lập và trường tư nhân như nhau, nhưng tại thời điểm này, vấn đề hậu cần của chúng tôi đang khó khăn. Chúng tôi đã hợp tác với DonorsChoose.org để quản lý tài trợ giải thưởng lớp học, chỉ làm việc với công chúng, trường học K-12. Theo DonorsChoose.org, tổ chức tốt có thể truy cập dữ liệu phù hợp và chính xác, nó có sẵn cho các trường công.

## Khi nào là hạn để đăng ký các giải thưởng phần cứng?

To qualify, you must complete the [Hardware Application form](<%= resolve_url('/prizes/hardware-signup') %>) by November 16, 2015. Một lớp học ở bất kì tiểu bang nào của Mỹ sẽ được trang bị máy tính. Code.org will select and notify winners via email by December 1, 2015.

## If my whole school can’t do the Hour of Code during Computer Science Education Week (Dec. 7-13), can I still qualify for prizes?

Yes, in the [Hardware Application form](<%= resolve_url('/prizes/hardware-signup') %>) include the dates that your whole school is participating.

<% end %>

## Tôi không ở Hoa Kỳ. Tôi có thể đủ điều kiện cho giải thưởng?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank you gift. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>