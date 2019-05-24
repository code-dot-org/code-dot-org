---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# How to teach one Hour of Code with your class

### הצטרפו לתנועה והצעידו קבוצת תלמידים אל שעתם הראשונה בלימודי המחשבים בעזרת צעדים אלו. קל לעבוד עם "שעה של קוד" - גם עבור מתחילים! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your class.

### Take a look at our [participation guide if you still have questions](<%= localized_file('/files/participation-guide.pdf') %>).

---

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](<%= resolve_url('/learn') %>) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](<%=resolve_url('/learn') %>)

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote/resources') %>) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

The best Hour of Code experience includes Internet-connected computers. אבל **אינך** נדרש למחשב עבור כל ילד, וגם באפשרותך לבצע "שעה של קוד" ללא מחשב כלל.

ודא שניסית מדריכים על מחשבי או מכשירי הסטודנטים כדי לאשש שאכן הם עובדים בצורה תקינה על הדפדפנים יחד עם קול ווידאו. **יש רוחב פס נמוך?** תכנן להציג סרטונים בפני כל הכיתה, כך שאף תלמיד לא יידרש להוריד בעצמו את הסרטונים. או נסה את המדריכים הלא מקוונים.

ספק אזניות עבור הכיתה, או בקש מהתלמידים להביא את שלהם, אם המדריך אשר בחרת עובד הכי טוב עם שמע.

**Don't have enough devices?** Use [pair programming](https://www.youtube.com/watch?v=vgkahOzFH2Q). כאשר תלמידים מתחברים יחד, הם עוזרים אחד לשני ונסמכים פחות על המורה. They’ll also see that computer science is social and collaborative.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Show an inspirational video:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Find more inspirational [resources](<%= codeorg_url('/inspire') %>) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- As a class, list things that use code in everyday life.
- See tips for getting girls interested in computer science [here](<%= codeorg_url('/girls')%>).

## 6) קודד!

**Direct students to the activity**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn')%>) under the number of participants.

**When your students come across difficulties it's okay to respond:**

- "אני לא יודע.. בוא נפתור את זה יחד."
- "טכנולוגיה לא תמיד עובד כפי שאנחנו רוצים."
- "ללמוד לתכנת זה כמו ללמוד שפה חדשה; לא תדברו שוטף מיד."

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](<%= resolve_url('/learn')%>).
- או לחילופין, בקש מתלמידים שסיימו מוקדם לעזור לחבריהם לכיתה שנתקלים בבעיות עם הפעילות.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](<%= codeorg_url('/certificates')%>) for your students.
- [Print "I did an Hour of Code!"](<%= resolve_url('/promote/resources#stickers') %>) stickers for your students.
- [הזמן חולצות מותאמות אישית](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) לבית הספר שלך.
- שתפו תמונות וסרטוני וידאו של אירוע "שעה של קוד" ברשתות החברתיות. השתמשו בתג #HourOfCode ו@codeorg כדי שנוכל גם אנחנו להדגיש את הצלחתכם!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## משאבים נוספים של "שעה של קוד" עבור אנשי חינוך:

- Visit the [Hour of Code Teacher Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other educators. <% if @country == 'us' %>
- Review the [Hour of Code FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## איך ממשיכים אחרי "שעה של קוד"?

The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey:

- Encourage students to continue to [learn online](<%= codeorg_url('/learn/beyond')%>).
- [Attend](<%= codeorg_url('/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>