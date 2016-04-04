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
from: "Hadi Partovi (Code.org) <hadi_partovi@code.org>"
subject: "Your Code.org certificate and teaching supplies"
litmus_tracking_id: "4o1xaamz"
attachments:
  certificate.jpg: '<%= Base64::encode64(image.to_blob) %>'
---
<%
facebook = {:u=>"http://code.org/k5"}
facebook_link = "https://www.facebook.com/sharer/sharer.php?#{facebook.to_query}"
twitter = {:related=>'codeorg', :hashtags=>'CSforAll', :text=>"I'm bringing computer science to my classroom with @codeorg! Find a local workshop to join me.", :url=>'http://code.org/k5'}
twitter_link = "https://twitter.com/intent/tweet?#{twitter.to_query}"
%>
<% unless recipient.name.nil_or_empty? %>
Dear <%= recipient.name %>,
<% end %>

Thank you for attending a Code.org K-5 workshop with <%= facilitator_name %><%= start_date ? " on #{Chronic.parse(start_date).strftime('%A, %B %d %Y')}" : '' %>! We hope you had an awesome time and that you feel prepared to bring computer science to your little learners! If you had a good experience, please spread the word about the [Code.org K-5 program](http://code.org/k5). 

<div><!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="<%= facebook_link %>" style="height:45px;v-text-anchor:middle;width:180px;" arcsize="9%" stroke="f" fillcolor="#7e5ca2">
    <w:anchorlock/>
    <center>
  <![endif]-->
      <a href="<%= facebook_link %>"
style="background-color:#7e5ca2;border-radius:4px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:13px;font-weight:bold;line-height:35px;text-align:center;text-decoration:none;width:170px;-webkit-text-size-adjust:none;">Share on Facebook</a>
  <!--[if mso]>
    </center>
  </v:roundrect>
<![endif]--><!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="<%= twitter_link %>" style="height:45px;v-text-anchor:middle;width:180px;" arcsize="9%" stroke="f" fillcolor="#7e5ca2">
    <w:anchorlock/>
    <center>
  <![endif]-->
      <a href="<%= twitter_link %>"
style="background-color:#7e5ca2;border-radius:4px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:13px;font-weight:bold;line-height:35px;text-align:center;text-decoration:none;width:170px;-webkit-text-size-adjust:none;">Share on Twitter</a>
  <!--[if mso]>
    </center>
  </v:roundrect>
<![endif]-->
</div>
<br>

**Classroom supplies, at no cost:**

Please take a moment to complete [this short survey](http://code.org/professional-development-workshop-surveys/<%= workshop_id %>) to rate your facilitator and workshop experience. Completing the survey will qualify you to receive supplies at no cost for the unplugged activities from Course 1, 2 or 3. It will also help us improve our K-5 Professional Development program.

Attached to this email, you will also find a personalized certificate acknowledging your successful completion of Code.org's K-5 Professional Development.
<br>

**For a limited time**  

Code.org is offering $50 off [**Dash robots**](https://store.makewonder.com/). These hands-on learning tools reinforce CS concepts taught in Code.org's CS Fundamentals curriculum, like events and loops. [Learn more](https://store.makewonder.com/). *Valid March 1st-30th, 2016 only. Limited to first 1,000 people.*

**Redemption code for robots: CODE91738A**   
*Valid April 1-31st, 2016 only.*
*Limited to first 1,000*

[Go here](https://help.makewonder.com/) for questions regarding redemption. 

**Need more support?**

- Refresh your skills before you teach. Check out our [online workshop](https://code.org/educate/professional-development-online).
- Meet us online. Attend one of our [online monthly meetings](http://www.eventbrite.com/o/codeorg-teacher-community-8317327577).
- Connect with other educators teaching CS. Join our [Professional Learning Community](http://forum.code.org/). 
- See our [FAQ](http://support.code.org/). 
- Or [contact us](http://code.org/contact).

Thanks again for your support,

Hadi Partovi<br/>
Founder, Code.org 

Follow us [on Facebook](http://facebook.com/code.org) or [on Twitter](http://twitter.com/codeorg)

Code.org is a public 501c3. Our address is 1301 5th Ave, Suite 1225, Seattle, WA, 98101. Don't like these emails? [Unsubscribe](<%= unsubscribe_link %>).

