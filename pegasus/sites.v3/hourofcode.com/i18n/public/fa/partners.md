---
title: <%= hoc_s(:title_partners).inspect %>
---
ساعت برنامه نویسی توسط مجموعه ساعت برنامه نویسی، مشاوران هفته آموزشی علوم رایانه و کمیته های بررسی راهبری می شود.

[کمیته مشاوران](<%= resolve_url('/advisory-committee') %>) شامل نمایندگانی از آموزش K-12، دانشگاهی، غیر انتفاعی، انتفاعی و سازمان های بین المللی می باشد. این کمیته استراتژی های کمپین ساعت برنامه نویسی را تبیین می کند.

[کمیته بررسی](<%= resolve_url('/review-committee') %>) متشکل از 15 مربی در رده های آموزش K-12 است که فعالیت ها را با استفاده از روال های کمیته مشاوران ارزیابی و توصیه می کند. این مربیان فعالیت های دانش آموز محور و برنامه های آموزشی معلم محور را که توسط صدها نفر از شرکای همکار ارائه شده اند بررسی می کنند و ارزش علمی فعالیت ها، توانایی تعامل با دانش آموزان و درخواست های تجدید نظر گروه های مختلف دانش آموزان را ارزیابی می کنند.

کار و تعهد هر دو کمیته به موفقیت ساعت برنامه نویسی و چشم انداز آن در ارائه مقدمه ای بر دانش رایانه برای هر دانش آموز کمک کرده است.

<% if @country == 'la' %>

# شرکای امریکای لاتین

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# شرکای آفریقایی

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# شرکای استرالیایی

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# شرکای چینی

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# شرکای فرانسوی

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# شرکای اندونزی

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# شرکای ایرلند

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# شرکای هندی

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# شرکای ژاپنی

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# شرکای هلندی

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# شرکای نیوزلندی

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# شرکای بریتانیایی

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# شرکای کانادایی

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# شرکای اصلی و حامیان حقوقی

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

---

# International Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

---

# Curriculum and Tutorial Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# Infrastructure Partners and Tools

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# Additional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>