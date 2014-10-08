---
<%
  require pegasus_dir('sites.v3/code.org/helpers/hoc_helpers')
  image = create_certificate_image(name_s||email_s)
  image.format = 'jpg'
%>
from: '"Hadi Partovi (Code.org)" <hadi_partovi@code.org>'
subject: Congratulations, you participated in the Hour of Code!
attachments:
  certificate.jpg: '<%= Base64::encode64(image.to_blob) %>'
---
# Certificate of Participation

<%= name_s||email_s %> completed the Hour of Code.

Congratulations on learning your first hour of computer science!

One hour is just the first step. If you enjoyed it, you're in for a treat!

To keep going, try our [other courses](http://studio.code.org), find other ways to learn [online](http://code.org/learn/beyond), or sign up for a [local workshop or camp](http://code.org/learn/local).

Also, please [sign our petition](http://code.org/promote) to help us bring computer science to more schools.

- [Like Code.org on Facebook](http://facebook.com/Code.org)
- [Follow Code.org on Twitter](http://twitter.com/codeorg)
- [Buy a Code.org T-shirt](http://zazzle.com/codeorg)


Thanks again for your support,

Hadi Partovi, Founder, Code.org

Code.org is a public 501c3. Our mailing address is: 1511 3rd Ave #301, Seattle, WA 98101

[Unsubscribe](<%= unsubscribe_link %>)

![](<%= tracking_pixel %>)
---
CERTIFICATION OF PARTICIPATION

<%= name_s||email_s %> completed the Hour of Code.

Congratulations on learning your first hour of computer science!

One hour is just the first step. If you enjoyed the first hour, you're in for a treat!

To keep going, try our other courses at http://studio.code.org, find other ways to learn at http://code.org/learn/beyond, or sign up for a local workshop or camp at http://code.org/learn/local.

Also, please help us promote computer science education and sign our petition at http://code.org/promote to bring computer science to more schools.

Like Code.org on Facebook: http://facebook.com/Code.org
Follow Code.org on Twitter: http://twitter.com/codeorg
Or buy a t-shirt at http://zazzle.com/codeorg.


Thanks again for your support,

Hadi Partovi, Founder, Code.org

Code.org is a public 501c3. Our mailing address is: 1511 3rd Ave #301, Seattle, WA 98101

Unsubscribe: <%= unsubscribe_link %>
