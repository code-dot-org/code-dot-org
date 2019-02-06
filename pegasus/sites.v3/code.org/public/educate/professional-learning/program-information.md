---
title: Program Information
theme: responsive
---

<%=
"<h3>Congratulations on your nomination for a scholarship!</h3> You’ve been nominated as a talented, passionate educator who can bring computer science to the students at your school. Your local partner will have your nomination as they consider your application for the regional scholarships or discounts they have available. Grant funding is limited, so apply soon if you are interested." if params[:nominated]
%>

<h2>Find your local workshop and apply</h2>

Find the professional learning workshops closest to you.

<%= view :regional_partner_search, source_page_id: "program-information" %>

<br/>
<br/>
