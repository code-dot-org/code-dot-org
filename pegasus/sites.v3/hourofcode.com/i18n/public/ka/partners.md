---
title: '<%= hoc_s(:title_partners) %>'
---
კოდის საათს მართავს კოდის საათისა და კომპიუტერული მეცნიერების საგანმანათლებლო კვირეულის საკონსულტაციო და სამეთვალყურეო კომიტეტები.

[Advisory Committee](<%= resolve_url('/advisory-committee') %>) შედგება წარმომადგენლებისაგან 1-დან 12-მდე ჩათვლით კლასებიდან, კომერციული, არაკომერციული და საერთაშორისო ორგანიზაციებიდან. კოდის საათის კამპანიის სტრატეგიას ხელმძღვანელობს ეს კომიტეტი.

The [Review Committee](<%= resolve_url('/review-committee') %>) is composed of 15 educators across K-12 grade bands that assess and recommend activities using the Advisory Committee's rubric. These educators review student-led activities and teacher-led lesson plans submitted by hundreds of activity partners, evaluating the activities' educational value, ability to engage learners, and potential appeal to diverse sets of students.

ორივე კომიტეტის მუშაობა და საქმისადმი თავდადება დაეხმარა კოდის საათს წარმატების მიღწევასა და მისიის განხორციელებაში, ჩვენ ყველა მოსწავლეს ვთავაზობთ კომპიუტერული მეცნიერების შესავალს.

<% if @country == 'la' %>

# Latin America Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Africa Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Australia Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# China Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# France Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Indonesia Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Ireland Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# India Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Japan Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Netherlands Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# New Zealand Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# United Kingdom Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Canada Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# მთავარი პარტნიორები და კორპორატიული სპონსორები

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

---

# მთავარი პრმოუტერი–პარტნიორები

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

---

# საერთაშორისო პარტნიორები

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

---

# ღონისძიების პარტნიორები

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# ინფრასტრუქტურის პარტნიორები და ინსტრუმენტები

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# დამატებითი პარტნიორები

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>