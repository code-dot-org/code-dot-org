---
title: <%= hoc_s(:title_partners).inspect %>
---
The Hour of Code is driven by the Hour of Code and Computer Science Education Week Advisory and Review Committees.

The [Advisory Committee](%= resolve_url('/advisory-committee') %) is composed of representatives from K-12, academia, nonprofits, for-profits, and international organizations. இக்குழு குறியீடு மணி பிரச்சார யுக்திகள் வழிகாட்டுகிறது.

[ஆய்வு குழு](%= resolve_url('/review-committee') %) மதிப்பீடு மற்றும் செயற்பாடுகள் ஆலோசனைக் குழு ஈடுபடாதவர்கள் பயன்படுத்தி பரிந்துரைக்கிறோம் K-12 நிலை பட்டைகள் குறுக்கே 15 ஆசிரியர்களுக்கு ஆனது. இந்த ஆசிரியர்கள் மாணவர் தலைமையிலான நடவடிக்கைகள் மற்றும் ஆசிரியர் தலைமையிலான பாடம் திட்டங்கள், செயல்பாடுகள் கல்வி மதிப்பு, கற்போர் மற்றும் சாத்தியமான வேண்டுகோள் மாணவர்கள் பல்வேறு இணை திறன் மதிப்பிடும் செயல் கூட்டாளிகள் நூற்றுக்கணக்கான சமர்ப்பிக்கப்பட்ட ஆய்வு.

இரு குழுக்கள் உழைப்பு மற்றும் குறியீட்டு மணி வெற்றி மற்றும் கணினி அறிவியல் அறிமுகம் வழங்கும் ஒவ்வொரு மாணவனும் அதன் பார்வை பங்களிப்பு செய்துள்ளன.

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

# Major Partners and Corporate Supporters

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# International Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# Curriculum and Tutorial Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# Infrastructure Partners and Tools

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# Additional Partners

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>