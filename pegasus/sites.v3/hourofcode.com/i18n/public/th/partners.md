---
title: <%= hoc_s(:title_partners).inspect %>
---
Hour of Code จัดการโดยคณะกรรมการที่ปรึกษาและตรวจสอบ Hour of Code และ สัปดาห์การศึกษาวิชาวิทยาการคอมพิวเตอร์

[คณะกรรมการที่ปรึกษา](<%= resolve_url('/advisory-committee') %>)ประกอบไปด้วยผู้แทนจากองค์กรการศึกษาระดับอนุบาลถึงมัธยมปลาย, มหาวิทยาลัย, องค์กรไม่หวังผลกำไร, องค์กรหวังผลกำไร, และองค์กรระหว่างประเทศ คณะกรรมการนี้แนะแนวทางสำหรับการรณรงค์ Hour of Code

[คณะกรรมการตรวจสอบ](<%= resolve_url('/review-committee') %>)ประกอบไปด้วยนักการศึกษาตั้งแต่ชั้นอนุบาลถึงมัธยมปลาย 15 ท่าน ที่ประเมินและแนะนำกิจกรรมโดยใช้กรอบของคณะกรรมการที่ปรึกษา นักการศึกษาเหล่านี้ตรวจสอบกิจกรรมโดยนักเรียนและแผนการสอนโดยครู ซึ่งส่งมาจากหุ้นส่วนด้านกิจกรรม ประเมินค่าทางการศึกษาจากกิจกรรม ความสามารถในการเข้าถึงผู้เรียน และความสารถในการดึงดูดนักเรียนจากกลุ่มที่หลากหลาย

งานและการอุทิศของทั้งสองคณะกรรมการได้เป็นส่วนช่วยในความสำเร็จของ Hour of Code และวิสัยทัศน์ที่จะนำเสนอวิชาวิทยาการคอมพิวเตอร์ให้กับนักเรียนทุกคน

<% if @country == 'la' %>

# หุ้นส่วนในละตินอเมริกา

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# หุ้นส่วนในแอฟริกา

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# หุ้นส่วนในออสเตรเลีย

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# หุ้นส่วนในจีน

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# หุ้นส่วนในฝรั่งเศส

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# หุ้นส่วนในอินโดนีเซีย

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# หุ้นส่วนในไอร์แลนด์

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# หุ้นส่วนในอินเดีย

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# หุ้นส่วนในญี่ปุ่น

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# หุ้นส่วนในเนเธอร์แลนด์

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# หุ้นส่วนในนิวซีแลนด์

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# หุ้นส่วนในสหราชอาณาจักร

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# หุ้นส่วนในแคนาดา

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# หุ้นส่วนหลักและบริษัทผู้สนับสนุน

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