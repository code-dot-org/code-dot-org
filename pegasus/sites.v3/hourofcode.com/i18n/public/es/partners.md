---
title: <%= hoc_s(:title_partners).inspect %>
---
La hora del código es conducido por la hora del código ordenador ciencia educación semana asesoramiento y comités de.

El [Comité Consultivo](<%= resolve_url('/advisory-committee') %>) está integrado por representantes de K-12, academia, sin fines de lucro, con fines de lucro y organizaciones internacionales. Este Comité de guías de la estrategia de la campaña hora de código.

El [Comité de examen](<%= resolve_url('/review-committee') %>) se compone de 15 educadores a través de bandas de grado K-12 que evaluación y recomiendan las actividades mediante la rúbrica de la Comisión Consultiva. Estos educadores revisan las actividades dirigidas por los estudiantes y planes de lecciones dirigidas por los maestros presentados por cientos de compañeros de actividades, la evaluación de las actividades de valor educativo, capacidad para involucrar a los estudiantes, y el potencial atractivo para diversos conjuntos de los estudiantes.

Trabajo y dedicación comités han contribuido al éxito de la hora del código y su visión de ofrecer una introducción a la informática para todos los estudiantes.

<% if @country == 'la' %>

# Socios de América Latina

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Socios de África

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Socios de Australia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Socios de China

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Socios de Francia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Socios de Indonesia

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Socios de Irlanda

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Socios de la India

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Socios de Japón

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Socios de Holanda

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Socios de Nueva Zelanda

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Socios de Reino Unido

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Socios de Canadá

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Principales socios y patrocinadores empresariales

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'major') %>

---

# Socios internacionales

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'international') %>

---

# Curriculum y Compañeros de Tutoriales

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'tutorial') %>

---

# Socios de infraestructura y herramientas

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'infrastructure') %>

---

# Socios adicionales

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'additional') %>

<%= view :signup_button %>