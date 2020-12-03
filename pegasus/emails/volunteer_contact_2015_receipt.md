---
<%
def format_email_address(email, name='')
  name = "\"#{name.gsub('"', '\"').gsub("'","\\'")}\"" if name =~ /[;,\"\'\(\)]/
  "#{name} <#{email}>".strip
end
%>
to: <%= format_email_address(volunteer_email_s, volunteer_name_s).inspect.html_safe %>
from: 'Code.org Volunteers <volunteers@code.org>'
reply-to: <%= format_email_address(email_s, name_s).inspect.html_safe %>
subject: "A teacher is requesting your help"
---

<% update_preferences = "https://#{CDO.canonical_hostname('code.org')}/volunteer/engineer/edit/#{volunteer_secret_s}/" %>

Hi <%= volunteer_name_s %>,

<%= name_s %> is a teacher at <%= school_name_s %>. They found you on the [volunteer site](https://code.org/volunteer/local) and after reviewing your profile specifically requested if you could help their class. They would like it if you could:

<ul>
<% if type_task_onsite_b %><li> visit the classroom for technical help and inspiration<% end %>
<% if type_task_remote_b %><li> Skype into the classroom to say a few words of inspiration to the kids<% end %>
<% if type_task_mentor_b %><li> be a mentor to help prepare them for coding with their students<% end %>
</ul>

We won't release your email directly to a teacher, so they're waiting for you to write back.

Most schools still don’t teach computer science. Most students don’t know that it’s about solving big problems and connecting us all closer together. This is your chance to inspire at least one young person in your area. If you are available to volunteer with this teacher, **please contact <%= name_s %> directly at [<%= email_s %>](<%= "mailto:" + email_s %>)**.

In your email to <%= name_s %>, please be sure to share the following information:

- Your name, company, and job description
- Days and times you are available to volunteer
- Why you chose to volunteer to inspire students
- Ask if there is any paperwork you need to fill out before volunteering

Best,
Alice Steinglass<br/>
President, Code.org


Contact information from teacher:

- **Teacher Name:** <%= name_s %>
- **Email address:** [<%= email_s %>](<%= "mailto:" + email_s %>)
- **School name:** <%= school_name_s %>
- **School location:** <%= school_location_s %>

Need to update the information you submitted when you signed up to volunteer? Update it any time.

- [Update my information](<%= update_preferences %>)

Getting too many email requests? It means there aren't enough volunteers in your region. Please recruit a friend to help out too. :-)

- [Unsubscribe from additional teacher requests **this year**](<%= update_preferences %>)
- [Unsubscribe from teacher requests **forever**](<%= update_preferences %>)
- [Unsubscribe from all Code.org emails](<%= local_assigns.fetch(:unsubscribe_link, "") %>)

![](<%= local_assigns.fetch(:tracking_pixel, "") %>)
