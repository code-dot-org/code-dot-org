---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# How to teach one Hour of Code with your class

### ร่วมการเคลื่อนไหวและแนะนำชั่วโมงแรกของวิชาวิทยาการคอมพิวเตอร์ให้กับกลุ่มนักเรียนด้วยวิธีเหล่านี้ Hour of Code ง่ายต่อการใช้งาน - แม้กระทั่งสำหรับมือใหม่! ถ้าคุณต้องการความช่วยเหลือเพิ่มเติม คุณสามารถหา[อาสาสมัครท้องถิ่น](<%= codeorg_url('/volunteer/local') %>)เพื่อช่วยจัด Hour of Code ในชั้นเรียนของคุณ

### Take a look at our [participation guide if you still have questions](<%= localized_file('/files/participation-guide.pdf') %>).

---

## 1. ดูวิดีโอวิธีทำนี้ <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. เลือกการสอนสำหรับชั่วโมงของคุณ

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. โปรโมท Hour of Code ของคุณ

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. วางแผนเทคโนโลยีที่จำเป็น - ไม่ต้องมีคอมพิวเตอร์ก็ได้

เพื่อประสบการณ์ Hour of Code ที่ดีที่สุด ควรจะมีคอมพิวเตอร์ที่เชื่อมต่อกับอินเทอร์เน็ต เเต่คุณ**ไม่จำเป็นต้องมี**คอมพิวเตอร์สำหรับเด็กทุกคน เเละคุณยังสามารถทำ Hour of Code โดยไม่มีคอมพิวเตอร์เลยก็ได้

อย่าลืมทดลองการสอนในคอมพิวเตอร์หรืออุปกรณ์ของนักเรียน เพื่อให้มั่นใจว่ามันใช้งานได้อย่างปกติบนเบราว์เซอร์โดยมีเสียงและวิดีโอ **มีแบนด์วิดท์ต่ำใช่หรือไม่?** วางแผนแสดงวิดีโอหน้าห้องเรียน เพื่อที่นักเรียนเเต่ละคนจะได้ไม่ต้องดาวน์โหลดวิดีโอของตัวเอง หรือลองการสอนแบบไม่เชื่อมต่อ/ออฟไลน์

จัดหาหูฟังสำหรับชั้นเรียนของคุณ หรือให้นักเรียนนำมาเอง ถ้าการสอนที่คุณเลือกใช้งานได้ดีกับเสียง

**มีอุปกรณ์ไม่พอใช่หรือไม่?** ใช้[การโปรแกรมเป็นคู่](https://www.youtube.com/watch?v=vgkahOzFH2Q) เมื่อนักเรียนจับคู่กัน พวกเขาจะช่วยกันเองและพึ่งพาครูน้อยลง พวกเขาจะยังเห็นวิชาวิทยาการคอมพิวเตอร์เป็นสิ่งที่ช่วยเข้าสังคมและใช้ความร่วมมืออีกด้วย

<img src="/images/fit-350/group_ipad.jpg" />

## 5. เริ่มต้น Hour of Code ของคุณด้วยผู้พูดหรือวิดีโอสร้างแรงบันดาลใจ

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**เปิดวิดีโอสร้างแรงบันดาลใจ**

- วิดีโอเปิดตัวเดิมของ Code.org มี Bill Gates, Mark Zuckerberg เเละ NBA star Chris Bosh (มีแบบ [1 นาที](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 นาที](https://www.youtube.com/watch?v=nKIu9yen5nc) เเละ [ 9 นาที](https://www.youtube.com/watch?v=dU1xS07N-FA) ให้เลือก)
- หา[แหล่ง](<%= codeorg_url('/inspire') %>)และ[วิดีโอ](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP)สร้างแรงบันดาลใจอื่นๆ

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- อธิบายวิธีที่เทคโนโลยีส่งผลต่อชีวิตของเรา ด้วยตัวอย่างที่ทั้งเด็กผู้ชายและเด็กผู้หญิงจะสนใจ (พูดถึงการช่วยชีวิต, การช่วยเหลือคน, การเชื่อมต่อผู้คน เเละอื่นๆ)
- ในชั้นเรียน เขียนรายชื่อสิ่งที่ใช้โปรแกรมในชีวิตประจำวัน
- ดูเคล็ดลับในการทำให้เด็กผู้หญิงสนใจวิชาวิทยาการคอมพิวเตอร์[ที่นี่](<%= codeorg_url('/girls')%>)

## 6. เขียนโปรแกรม!

**Direct students to the activity**

- เขียนลิงก์การสอนบนกระดาน หาลิงก์ที่เป็นรายการใน[ข้อมูลสำหรับการสอนที่คุณเลือก](<%= resolve_url('/learn')%>) ด้านล่างจำนวนผู้เข้าร่วม

**When your students come across difficulties it's okay to respond:**

- "ไม่รู้สิ เรามาลองแก้มันไปด้วยกันนะ"
- "เทคโนโลยีไม่ได้ทำงานออกมาอย่างที่เราต้องการเสมอไป"
- "การเรียนเขียนโปรแกรมก็เหมือนกับการเรียนภาษา เธอจะไม่คล่องในตอนแรกทันที"

**What if a student finishes early?**

- นักเรียนสามารถดูการสอนทั้งหมดและ[ลองกิจกรรม Hour of Code อื่นๆ](<%= resolve_url('/learn')%>)
- หรือขอให้นักเรียนที่ทำเสร็จเร็วช่วยเพื่อนในชั้นเรียนที่มีปัญหากับกิจกรรม

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. ฉลอง

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [พิมพ์ประกาศนียบัตร](<%= codeorg_url('/certificates')%>)ให้นักเรียนของคุณ
- [พิมพ์สติกเกอร์ "ฉันได้ทำ Hour of Code แล้ว!"](<%= resolve_url('/promote/resources#stickers') %>) ให้นักเรียนของคุณ
- [สั่งซื้อเสื้อยืดสั่งทำ](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more)สำหรับโรงเรียนของคุณ
- แชร์รูปถ่ายและวิดีโอของกิจกรรม Hour of Code ของคุณลงในโซเชียลมีเดีย ใช้ #HourOfCode และ @codeorg เพื่อที่เราจะสามารถเห็นความสำเร็จของคุณด้วยเช่นกัน!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## แหล่ง Hour of Code อื่นๆสำหรับนักการศึกษา:

- เยี่ยมชม[ฟอรัม Hour of Code สำหรับครู](http://forum.code.org/c/plc/hour-of-code) สำหรับคำแนะนำ, แนวคิด เเละความช่วยเหลือจากนักการศึกษาคนอื่นๆ <% if @country == 'us' %>
- ทบทวน[คำถามที่พบบ่อยของ Hour of Code](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code) <% end %>

## จะทำอะไรต่อหลังจาก Hour of Code?

Hour of Code เป็นเพียงก้าวแรกในการเดินทางที่จะเรียนรู้เพิ่มเติมเกี่ยวกับการทำงานของเทคโนโลยีและวิธีสร้างแอปพลิเคชันซอฟต์แวร์ เพื่อที่จะเดินทางต่อไป:

- ส่งเสริมนักเรียนให้[เรียนออนไลน์](<%= codeorg_url('/learn/beyond')%>)ต่อไป
- [เข้าร่วม](<%= codeorg_url('/professional-development-workshops') %>)การประชุมเชิงปฏิบัติการหนึ่งวัน เพื่อรับขั้นตอนจากผู้ให้บริการวิชาวิทยาการคอมพิวเตอร์ที่มีประสบการณ์ (นักการศึกษาสหรัฐอเมริกาเท่านั้น)

<%= view :signup_button %>