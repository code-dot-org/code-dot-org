---
title: <%= hoc_s(:title_partners) %>
---
编程一小时的网站由《编程一小时》和计算机科学教育周咨询委员会及审查委员会运营。

[咨询委员会](%= resolve_url('/advisory-committee') %)由来自基础教育、学术界、非盈利及盈利组织、国际组织的代表所组成。 该委员会负责指导编程一小时的活动策略。

[审查委员会](%= resolve_url('/review-committee') %)由15名 K-12级的教育工作者所组成，他们利用咨询委员会的规定评估和推荐活动。 这些教育工作者审查由数以百计的活动伙伴提交的学生主导的活动和由教师领导的课程计划, 评估活动的教育价值、参与学习的能力以及对不同的学生的潜在吸引力。

这两个委员会的工作和贡献都促进了《编程一小时》的成功，为每一个学生提供计算机科学入门的愿景。

<% if @country == 'la' %>

# 拉丁美洲合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# 非洲合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# 澳大利亚合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# 中国合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# 法国合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# 印度尼西亚合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# 爱尔兰合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# 印度合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# 日本合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# 荷兰合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# 新西兰合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# 英国的合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# 加拿大合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# 主要合作伙伴和企业赞助商

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

* * *

# 主要的推广合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

* * *

# 国际合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

* * *

# 活动合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

* * *

# 基础设施合作伙伴和工具

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

* * *

# 其他合作伙伴

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>