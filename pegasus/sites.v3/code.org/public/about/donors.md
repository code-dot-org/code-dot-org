---
title: Donors
nav: about_nav
---
# Donors

Code.org&reg; is dedicated to the vision that every student in every school should have the opportunity to learn to code.  We are supported by philanthropic donations from corporations, foundations, and generous individuals.  Code.org is a public 501c3. All donations to Code.org are tax-deductible, and matched 50%.

<a href="/donate"><button>Please consider a donation</button></a>

<%
  categories = {
    'platinum' => 'Platinum Supporters ($3,000,000+ contribution)',
    'gold' => 'Gold Supporters ($1,000,000+ contribution)',
    'silver' => 'Silver Supporters ($500,000+ contribution)',
  }
  categories.each_pair do |level,heading|
%>
## <%= heading %>
<%= view :about_donors2, supporters:DB[:cdo_donors].where(level_s:level), :columns=> 3 %>
<%
  end
%>
<%
  categories = {
    'bronze' => 'Bronze Supporters ($100,000+ contribution)',
    'supporter' => 'Supporters ($25,000+ contribution)',
   } 
  categories.each_pair do |level,heading|
%>
## <%= heading %>
<%= view :about_donors, supporters:DB[:cdo_donors].where(level_s:level) %>
<%
  end
%>
<hr>
<a href="/about/donors-other">
  <p>
    View all other supporters
  </p>
</a>
</hr>
