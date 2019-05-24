---
title: <%= hoc_s(:title_partners).inspect %>
---
კოდის საათს მართავს კოდის საათისა და კომპიუტერული მეცნიერების საგანმანათლებლო კვირეულის საკონსულტაციო და სამეთვალყურეო კომიტეტები.

[Advisory Committee](<%= resolve_url('/advisory-committee') %>) შედგება წარმომადგენლებისაგან 1-დან 12-მდე ჩათვლით კლასებიდან, კომერციული, არაკომერციული და საერთაშორისო ორგანიზაციებიდან. კოდის საათის კამპანიის სტრატეგიას ხელმძღვანელობს ეს კომიტეტი.

[განმხილველი კომიტეტი](<%= resolve_url('/review-committee') %>) შედგება 15 განმანათლებლისგან K-12 კლასის ჯგუფიდან, რომლებიც ირჩევენ და რეკომენდაციას უწევენ აქტივობებს, რომელთაც გამოიყენებენ მრჩეველთა კომიტეტის რუბრიკაში. ეს პედაგოგები განიხილავენ მოსწავლეების მიერ წარმართულ აქტივობებს და მასწავლებლების მიერ წარმართული გაკვეთილის გეგმებს, რომლებსაც აგზავნის აქტივობის ასობით პარტნიორი. ისინი აფასებენ აქტივობების საგანმანათლებლო ღრებულებას, პროცესში მოსწავლეების ჩართვის შესაძლებლობას და სტუდენტების სხვადასხვა ჯგუფისთვის მიმზიდველობას.

ორივე კომიტეტის მუშაობა და საქმისადმი თავდადება დაეხმარა კოდის საათს წარმატების მიღწევასა და მისიის განხორციელებაში, ჩვენ ყველა მოსწავლეს ვთავაზობთ კომპიუტერული მეცნიერების შესავალს.

<% if @country == 'la' %>

# პარტნიორები ლათინური ამერიკიდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# პარტნიორები აფრიკიდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# პარტნიორები ავსტრალიიდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# პარტნიორები ჩინეთიდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# პარტნიორები საფრანგეთიდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# პარტნიორები ინდონეზიიდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# პარტნიორები ირლანდიიდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# პარტნიორები ინდოეთიდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# პარტნიორები იაპონიიდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# პარტნიორები ნიდერლანდებიდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# პარტნიორები ახალი ზელანდიიდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# პარტნიორები გაერთიანებული სამეფოდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# პარტნიორები კანადიდან

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# მთავარი პარტნიორები და კორპორატიული სპონსორები

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