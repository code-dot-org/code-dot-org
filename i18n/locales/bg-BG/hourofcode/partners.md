* * *

Заглавие: <%= hoc_s(:title_partners) %>

* * *

The Hour of Code is driven by the Hour of Code and Computer Science Education Week Advisory and Review Committees.

The [Advisory Committee](%= resolve_url('/advisory-committee') %) is composed of representatives from K-12, academia, nonprofits, for-profits, and international organizations. This committee guides the strategy for the Hour of Code campaign.

The [Review Committee](%= resolve_url('/review-committee') %) is composed of 15 educators across K-12 grade bands that assess and recommend activities using the Advisory Committee's rubric. These educators review student-led tutorials and teacher-led lesson plans submitted by hundreds of tutorial partners, evaluating the activities' educational value, ability to engage learners, and potential appeal to diverse sets of students.

Both committees' work and dedication have contributed to the success of the Hour of Code and its vision of offering an introduction to computer science for every student.

<% if @country == 'la' %>

# Партньори от Латинска Америка

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Партньори от Африка

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Партньори от Австралия

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

# Партньори от Индонезия

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Ireland Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Партньори от Индия

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Партньори от Япония

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Netherlands Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Партньори от Нова Зеландия

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Партньори от Обединеното кралство

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Партньори от Канада

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Основни партньори и корпоративни поддръжници

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# Основни рекламни партньори

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# Международни партньори

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# Партньори в създаването на уроци

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# Инфраструктурни партньори и инструменти

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# Допълнителни партньори

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>