---
<%
form = DB[:forms].where(kind: "VolunteerEngineerSubmission2015", id: <%= volunteer_id_i %>).first
volunteer = JSON.parse(form[:data])
%>
from: '"Tanya Parker (Code.org)" <tanya_parker@code.org>'
to: <%= volunteer[:name_s] + " <" + volunteer[:email_s] + ">" %>
subject: "A teacher is requesting your help for the Hour of Code"
---

### The following teacher is requesting your help for the Hour of Code

- Name: <%= teacher_name_s %>
- Email address: [<%= teacher_email_s %>](<%= teacher_email_s %>)
- School name: <%= school_name_s %>
- School location: <%= school_location_s %>
- Message: <%= email_message_s %>

Most schools still don’t teach computer science. Most students don’t know that it’s about solving big problems and connecting us all closer together. This is your chance to inspire at least one young person in your area. If you are available to volunteer with this teacher, **please contact the teacher directly with the above information**.

Tanya Parker<br>
Product Manager, Code.org

<hr/>

You are receiving this email because you signed up to volunteer for the Hour of Code. If you would like to stop receiving these emails, [unsubscribe here](<%= unsubscribe_link %>).

![](<%= tracking_pixel %>)`
