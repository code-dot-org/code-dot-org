---

title: <%= hoc_s(:title_prizes) %>
layout: wide
nav: prizes_nav

---

<%= view :signup_button %>

# Hadiah Hour of Code 2015

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize1.jpg" />

<img style="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize3.png" />

<img styel="float: left; padding-right: 10px; padding-bottom: 10px;" src="/images/fill-260x200/prize4.png" />

<p style="clear:both; height: 0px;">
  &nbsp;
</p>

<% if @country == 'la' %>

# Hadiah untuk tiap penyelanggara

Every educator who hosts an Hour of Code for students receives 10 GB of Dropbox space as a thank-you gift!

<% else %>

## Hadiah untuk setiap penyelenggara

**Every** educator who hosts an Hour of Code is eligible to receive **$10 to Amazon.com, iTunes or Windows Store** as a thank-you gift!

<img style="float:left;" src="/images/fit-130/amazon_giftcards.png" />

<img style="float:left;" src="/images/fit-130/apple_giftcards.png" />

<img styel="float:left;" src="/images/fit-130/microsoft_giftcards.png" />

<p style="clear:both">
  &nbsp;
</p>

<% if @country == 'us' %>

## 51 Sekolah yang beruntung akan memenangkan satu set laptop untuk kelas (atau teknologi lain yang bernilai $10,000)

One lucky school in *every* U.S. state (and Washington D.C.) will win $10,000 worth of technology. [Sign up here](<%= resolve_url('/prizes/hardware-signup') %>) to be eligible and [**see last year's winners**](http://codeorg.tumblr.com/post/104109522378/prize-winners).

<% end %>

# FAQ

## Who is eligible to receive the all organizer thank-you gift?

Both US and non-US Hour of Code 2015 organizers are eligible to receive the all organizer thank-you gift. The $10K hardware prize is limited to US residents only.

## Is there a deadline to sign up to receive the all organizer thank-you gift?

You must sign up **before** <%= campaign_date('start_long') %> in order to be eligible to receive the all organizer thank-you gift.

## When will I receive my thank-you gift?

We will contact you in December after Computer Science Education Week (<%= campaign_date('full') %>) with next steps on how to redeem your choice of thank-you gift.

## Can I redeem all of the thank-you gift options?

No. Thank-you gifts are limited to one per organizer. We will contact you in December after Computer Science Education Week with next steps on how to redeem your choice of thank-you gift.

<% if @country == 'us' %>

## Apakah sekolah anda sudah mendaftar untuk memenangkan perangkat keras senilai $10.000?

Yes. Your whole school has to participate to be eligible for the prize but only one person needs to register and submit the Hardware Prize application form [here](<%= resolve_url('/prizes/hardware-signup') %>). Every teacher participating will need to [sign up](<%= resolve_url('/') %>) their classroom individually in order to receive the all organizer thank you gift.

## Siapa yang memenuhi syarat untuk memenangkan Hardware senilai $10.000?

Hadiah terbatas untuk sekolah publik K-12 U.S. Untuk memenuhi syarat, sekolah anda harus mendaftar untuk Hour of Code sebelum 16 November 2015. Satu sekolah di setiap negara bagian di U.S. akan menerima satu set komputer untuk kelas. Code.org akan memilih dan memberitahukan pemenang melalui email paling lambat tanggal 1 Desember 2015.

## Mengapa hadiah perangkat keras senilai $10.000 hanya tersedia untuk sekolah umum?

We would love to help teachers in public and private schools alike, but at this time, it comes down to logistics. We have partnered with [DonorsChoose.org](http://donorschoose.org) to administer classroom funding prizes, which only works with public, US K-12 schools. According to DonorsChoose.org, the organization is better able to access consistent and accurate data that's available for public schools.

## Kapan batas waktu untuk mengajukan permohonan untuk hadiah perangkat keras?

To qualify, you must complete the [Hardware Application form](<%= resolve_url('/prizes/hardware-signup') %>) by November 16, 2015. Satu sekolah di setiap negara bagian di U.S. akan menerima satu set komputer untuk kelas. Code.org akan memilih dan memberitahukan pemenang melalui email paling lambat tanggal 1 Desember 2015.

<% end %>

## If my whole school can’t do the Hour of Code during Computer Science Education Week (<%= campaign_date('short') %>), can I still qualify for prizes?

Yes, in the [Hardware Application form](<%= resolve_url('/prizes/hardware-signup') %>) include the dates that your whole school is participating.

## Saya berada di luar Amerika Serikat. Bisakah saya mendapat hadiah?

Yes, all organizers, both US and non-US, are eligible to receive the all organizer thank-you gift. The $10K hardware prize is US only.

<% end %> <%= view :signup_button %>