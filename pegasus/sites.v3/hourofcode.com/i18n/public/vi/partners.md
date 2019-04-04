---
title: <%= hoc_s(:title_partners).inspect %>
---
Giờ Lập Trình được phát triển bởi Hour of Code và Tuần Tham vấn Giáo dục Khoa học Máy tính và Ủy ban Phê bình.

[Ủy ban Phê bình](<%= resolve_url('/advisory-committee') %>) bao gồm các đại diện từ K-12, học viện, tổ chức phi lợi nhuận, vì lợi nhuận và các tổ chức quốc tế. Ủy ban này sẽ hướng dẫn chiến lược cho các chiến dịch Giờ Lập Trình.

[Ủy ban Phê bình](<%= resolve_url('/review-committee') %>) bao gồm 15 nhà giáo dục trên toàn khối K-12 để đánh giá và đề nghị các hoạt động sử dụng phiếu tự đánh giá của Ủy ban Phê bình. Các nhà giáo dục đánh giá hoạt động của sinh viên và giáo án bài học của giảng viên đã gửi đến bởi hàng trăm đối tác hoạt động của chúng tôi, đánh giá các hoạt động giáo dục có giá trị, khả năng hứa hẹn của học viên, và tiềm năng phản biện để bộc lộ khả năng đa dạng của sinh viên.

Hoạt động của Ủy ban và sự cống hiến đã đóng góp vào sự thành công của Giờ Lập Trình và tầm nhìn của nó như cung cấp một lời giới thiệu cho khoa học máy tính đến với tất cả mọi học viên.

<% if @country == 'la' %>

# Các đối tác Mĩ Latinh

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Các đối tác Châu Phi

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Các đối tác Châu Úc

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Các đói tác Trung Hoa

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Các đối tác Pháp

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Các đối tác Indonesia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Các đối tác Icreland

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Các đối tác Ấn độ

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Các đối tác Nhật Bản

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Các đối tác Hà Lan

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Các đối tác New Zealand

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Các đối tác Anh Quốc

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Các đối tác Canada

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Các đối tác Chính và Những nhà Tài trợ Tổ chức

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