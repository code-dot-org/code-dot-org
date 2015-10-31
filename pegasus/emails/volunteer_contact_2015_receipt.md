---
<%
def format_email_address(email, name='')
  name = "\"#{name.gsub('"', '\"').gsub("'","\\'")}\"" if name =~ /[;,\"\'\(\)]/
  "#{name} <#{email}>".strip
end
%>
to: '<%= format_email_address(volunteer_email_s, volunteer_name_s) %>'
from: '"Tanya Parker (Code.org)" <tanya_parker@code.org>'
subject: "A teacher is requesting your help for the Hour of Code"
---

<% update_preferences = "http://#{CDO.canonical_hostname('code.org')}/volunteer/engineer/edit/#{form.secret}/" %>

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

- [Update my email preferences](<%= update_preferences %>)
- [Unsubscribe from all emails](<%= unsubscribe_link %>)

![](<%= tracking_pixel %>)
