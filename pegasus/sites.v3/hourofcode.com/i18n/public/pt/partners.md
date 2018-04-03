---
title: <%= hoc_s(:title_partners) %>
---
A Hora do Código é gerenciada pelos Comitês de Assessoria e Revisão da Semana da Educação em Ciência da Computação e da Hora do Código.

O [Comitê de Assessoria](<%= resolve_url('/advisory-committee') %>) é composto por representantes do ensino fundamental e médio, do setor acadêmico e de organizações com e sem fins lucrativos e internacionais. Esse comitê guia as estratégias para a campanha da Hora do Código.

O [Comitê de Revisão](<%= resolve_url('/review-committee') %>) é composto por 15 educadores de grupos do ensino fundamental e médio que avaliam e recomendam atividades utilizando os critérios do Comitê de Assessoria. Esses educadores revisam as atividades conduzidas por alunos e os planos de aula conduzidos por professores enviados por centenas de parceiros, avaliando o valor educacional das atividades, sua capacidade de envolver os alunos e seu potencial atrativo para diversos tipos de estudantes.

O trabalho e a dedicação dos dois comitês contribuíram para o sucesso da Hora do Código e sua visão de oferecer uma introdução à ciência da computação para todos os estudantes.

<% if @country == 'la' %>

# Parceiros da América Latina

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Parceiros da África

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Parceiros da Austrália

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Parceiros da China

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Parceiros da França

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Parceiros da Indonésia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Parceiros da Irlanda

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Parceiros da Índia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Parceiros do Japão

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

# Parceiros do Canadá

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Principais parceiros e patrocinadores corporativos

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

---

# Principais parceiros promocionais

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'promotional') %>

---

# Parceiros internacionais

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

---

# Parceiros de atividades

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# Parceiros e ferramentas de Infraestrutura

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# Outros parceiros

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>