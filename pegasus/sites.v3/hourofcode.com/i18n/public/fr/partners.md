---
title: <%= hoc_s(:title_partners).inspect %>
---
L'Heure du Code est rendu possible grâce à la Commission Consultative et aux Comités d'Examen de l'Heure du Code et de l'Informatique.

La [Commission Consultative ](<%= resolve_url('/advisory-committee') %>) est comprise de représentant(e)s d'éducation primaire et secondaire, d'universités, d'organisations sans but lucratif, d'organisations à but lucratif et d'organisations internationales. Cette commission guide la stratégie de la campagne Heure du Code.

Le [Comité d'Examen](<%= resolve_url('/review-committee') %>) est compris de 15 éducateurs provenant de toutes tranches d'éducation primaire et secondaire qui évaluent et recommandent des activités tout en utilisant la rubrique de la Commission Consultative. Ces éducateurs examinent des activités pour les élèves et des plans de cours pour les professeurs soumis par des centaines de partenaires éducatifs. Ils évaluent la valeur éducatives des activités, l'engagement des élèves et le potentiel pour attirer différentes catégories d'élèves.

Le travail de ces deux commissions et leur implication ont contribué au succès de l'Heure de Code et à sa vision de permettre à chaque élève une découverte de l'informatique.

<% if @country == 'la' %>

# Partenaires de l'Amérique Latine

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'la') %>

<% end %>

<% if @country == 'ac' %>

# Partenaires d'Afrique

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ac') %>

<% end %>

<% if @country == 'au' %>

# Partenaires d'Afrique

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'au') %>

<% end %>

<% if @country == 'cn' %>

# Partenaires de Chine

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'cn') %>

<% end %>

<% if @country == 'fr' %>

# Partenaires de France

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'fr') %>

<% end %>

<% if @country == 'id' %>

# Partenaires d'Indonésie

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'id') %>

<% end %>

<% if @country == 'ie' %>

# Partenaires d'Irlande

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ie') %>

<% end %>

<% if @country == 'in' %>

# Partenaires d'Inde

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'in') %>

<% end %>

<% if @country == 'jp' %>

# Partenaires du Japon

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'jp') %>

<% end %>

<% if @country == 'nl' %>

# Netherlands des Pays-Bas

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nl') %>

<% end %>

<% if @country == 'nz' %>

# Partenaires de Nouvelle Zélande

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'nz') %>

<% end %>

<% if @country == 'uk' %>

# Partenaires des Royaumes-Unis

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'uk') %>

<% end %>

<% if @country == 'ca' %>

# Partenaires du Canada

<%= view :about_logos, logos:DB[:cdo_partners].where(hourofcode_b:true).and(kind_s:'ca') %>

<% end %>

# Principaux partenaires et Soutiens

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