---
from: '"Hadi Partovi (Code.org)" <hadi_partovi@code.org>'
subject: "Welcome to Code Studio"
layout: sendy
theme: none
---
[![Code.org](/images/fit-48/logo.png)](/)

## [Name,fallback=]

Thank you for creating a Code Studio account with [Code.org](http://code.org).  

We hope that you enjoy learning the basics of computer science with the [Code Studio](http://studio.code.org) platform.

Sincerely,

Hadi Partovi, Founder, [Code.org](http://code.org/)

<br/>
<br/>

---

<%
  weight = SecureRandom.random_number
  donor = DB[:cdo_donors].where('((weight_f - ?) >= 0)', weight).first
%>
Note: [<%= donor[:name_s] %>](<%= donor[:url_s]  %>) made the generous gift to sponsor your learning.  

View the full list of [Code.org donors](http://code.org/about/donors)
