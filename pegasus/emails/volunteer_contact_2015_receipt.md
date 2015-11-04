---
<%
def format_email_address(email, name='')
  name = "\"#{name.gsub('"', '\"').gsub("'","\\'")}\"" if name =~ /[;,\"\'\(\)]/
  "#{name} <#{email}>".strip
end
%>
to: '<%= format_email_address(volunteer_email_s, volunteer_name_s) %>'
from: '"Tanya Parker (Code.org)" <tanya_parker@code.org>'
reply-to: '<%= format_email_address(email_s, name_s) %>'
subject: "A teacher is requesting your help for the Hour of Code"
---

<% update_preferences = "http://#{CDO.canonical_hostname('code.org')}/volunteer/engineer/edit/#{volunteer_secret_s}/" %>

Hi <%= volunteer_name_s %>,

<%= name_s %> is a teacher at <%= school_name_s %>. S/he found you on the Hour of Code site and after reviewing your profile specifically requested if you could help their class with the Hour of Code this year. S/he would like it if you could:

***

<% type_task_ss.each do |task| %>
  <% if task == 'onsite' %>
    * visit the classroom for technical help and inspiration
  <% elsif task == 'remote' %>
    * Skype into the classroom to say a few words of inspiration to the kids
  <% elsif task == 'mentor' %>
    * be a mentor to help prepare him/her for coding with his/her students 
  <% end %>
<% end %>
  
***

We won't release your email directly to a teacher, so s/he's waiting for you to write back. 

Most schools still don’t teach computer science. Most students don’t know that it’s about solving big problems and connecting us all closer together. This is your chance to inspire at least one young person in your area. If you are available to volunteer with this teacher, **please contact the teacher directly at [<%= email_s %>](<%= "mailto:" + email_s %>)**. 

Tanya Parker<br>
Product Manager, Code.org

Contact information from teacher:
- **Teacher Name:** <%= name_s %>
- **Email address:** [<%= email_s %>](<%= "mailto:" + email_s %>)
- **School name:** <%= school_name_s %>
- **School location:** <%= school_location_s %>

<hr/>

Getting too many email requests? It means there aren't enough volunteers in your region. Please recruit a friend to help out too. :-)

- [Unsubscribe from additional teacher requests **this year**](<%= update_preferences %>)
- [Unsubscribe from teacher requests **forever**](<%= update_preferences %>)
- [Unsubscribe from all Code.org emails](<%= unsubscribe_link %>)

![](<%= tracking_pixel %>)
