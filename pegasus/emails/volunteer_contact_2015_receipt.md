---
from: '"Tanya Parker (Code.org)" <tanya_parker@code.org>'
to: <%= volunteer_name_s + " <" + volunteer_email_s + ">" %>
subject: "A teacher is requesting your help for the Hour of Code"
---

<% remove_link = "http://#{CDO.canonical_hostname('code.org')}/v2/forms/VolunteerEngineerSubmission2015/#{form.secret}/delete" %>

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

You are receiving this email because you signed up to volunteer for the Hour of Code. If you would like to be removed from the list of volunteers so you no longer receive emails from teachers, [unsubscribe here](<%= remove_link %>).

![](<%= tracking_pixel %>)`
