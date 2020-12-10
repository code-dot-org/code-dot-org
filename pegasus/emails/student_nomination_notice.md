---
from: '"Pegasus (Code.org)" <pegasus@code.org>'
to: '"Marketing" <marketing@code.org>'
subject: Student Nominated
---
## Student Nominated

- Nominator: <%= name_s %> [<%= email_s %>](<%= email_s %>)
- Relationship: <%= local_assigns.fetch(:relationship_s, "") %>
- Student: <%= local_assigns.fetch(:student_name_s, "") %> [<%= local_assigns.fetch(:student_email_s, "") %>](<%= local_assigns.fetch(:student_email_s, "") %>)
- Student Link: [<%= local_assigns.fetch(:student_link_s, "") %>](<%= local_assigns.fetch(:student_link_s, "") %>)
- Grade: <%= local_assigns.fetch(:student_grade_i, "") %>
- School: <%= local_assigns.fetch(:school_name_s, "") %>
- School Zip Code: <%= local_assigns.fetch(:school_zip_code_s, "") %>.

### Message

<pre><%= local_assigns.fetch(:message_s, "") %></pre>

![](<%= local_assigns.fetch(:tracking_pixel, "") %>)
