---
<%
  require 'cdo/graphics/certificate_image.rb'
  image = create_certificate_image2(
    pegasus_dir('sites.v3', 'code.org', 'public', 'images', 'k5-professional-development-certificate-2014.png'),
    recipient.name || recipient.email,
    y:444,
    height:100,
  )
  image.format = 'jpg'
%>
from: '"Hadi Partovi (Code.org)" <hadi_partovi@code.org>'
subject: Your Code.org certificate and no-cost teaching supplies
attachments:
  certificate.jpg: '<%= Base64::encode64(image.to_blob) %>'
---
<% unless recipient.name.empty? %>
Dear <%= recipient.name %>,
<% end %>

Thank you for attending a Code.org K-5 workshop with <%= facilitator_name %> on <%= DateTime.parse(start_date).strftime('%A, %B %d %Y') %> at <%= location_name %>! We hope you had an awesome time and that you feel prepared to bring computer science to your little learners!

Attached to this email, you will find a personalized certificate acknowledging your successful completion of Code.org's K-5 professional development. We are continuously working to improve our K-5 professional development program.

Please take a moment to complete [this short survey](#) to rate your facilitator and workshop experience. Completing the survey will qualify you to receive supplies at no cost for the unplugged activities from Course 1, 2 or 3.

For more support, check out Code.org's [online office hours](http://code.org/educate/k5/k5officehours), [K-5 forum](http://support.code.org/hc/communities/public/topics) and [FAQ](http://support.code.org/). Or [contact us](http://code.org/contact).

Thanks again for your support,

Hadi Partovi<br/>
Founder, Code.org

Code.org is a public 501c3. Our address is 1301 5th Ave, Suite 1225, Seattle, WA, 98101. Don't like these emails? [Unsubscribe](<%= unsubscribe_link %>).

![](<%= tracking_pixel %>)
