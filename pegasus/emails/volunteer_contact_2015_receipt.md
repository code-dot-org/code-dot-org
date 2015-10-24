---
from: '"Tanya Parker (Code.org)" <tanya_parker@code.org>'
to: <%= volunteer_name_s + " <" + volunteer_email_s + ">" %>
subject: "A teacher is requesting your help for the Hour of Code"
---

<% stop_this_year = "http://#{CDO.canonical_hostname('code.org')}/volunteer/engineer/unsubscribe/until2016/#{form.secret}/" %>
<% stop_forever = "http://#{CDO.canonical_hostname('code.org')}/volunteer/engineer/unsubscribe/forever/#{form.secret}/" %>

### The following teacher is requesting your help for the Hour of Code

- Name: <%= teacher_name_s %>
- Email address: [<%= teacher_email_s %>](<%= "mailto:" + teacher_email_s %>)
- School name: <%= school_name_s %>
- School location: <%= school_location_s %>
- Message: <%= email_message_s %>

Most schools still don’t teach computer science. Most students don’t know that it’s about solving big problems and connecting us all closer together. This is your chance to inspire at least one young person in your area. If you are available to volunteer with this teacher, **please contact the teacher directly with the above information**.

Tanya Parker<br>
Product Manager, Code.org

<hr/>

Getting too many email requests?

- [Stop sending me teacher requests *for this year*](<%= stop_this_year %>)
- [Stop sending me teacher requests forever](<%= stop_forever %>)
- [Stop sending me *any* emails forever](<%= unsubscribe_link %>)

![](<%= tracking_pixel %>)
