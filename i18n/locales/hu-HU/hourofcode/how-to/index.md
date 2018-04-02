---
title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

<h1>Hogyan tartsd meg a Kódolás Óráját</h1>

Join the movement and introduce a group of students to their first hour of computer science with these steps. The Hour of Code is easy to run - even for beginners! If you'd like an extra set of hands to help out, you can find a [local volunteer](%= codeorg_url('/volunteer/local') %) to help run an Hour of Code in your class.

## 1. Watch this how-to video <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Choose a tutorial for your hour

We provide a variety of fun, [student-guided tutorials](%= resolve_url('/learn') %) for all age groups and experience levels. Students do the activities on their own, though many activities include lesson plans for teachers (you'll see the link when you click the activity) to guide discussion or extend the activity. [![](/images/fit-700/tutorials.png)](%=resolve_url('/learn') %)

## 3. Népszerűsítsd a Kódolás Órája eseményedet!

Promote your Hour of Code [with these tools](%= resolve_url('/promote/resources') %) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

A legjobb Kódolás Órája élményhez internetkapcsolattal rendelkező számítógépek kellenek. De **nem** szükséges minden tanuló számára számítógépet biztosítani. A Kódolás Óráját akár számítógépek nélkül is meg lehet valósítani.

Make sure to test tutorials on student computers or devices to ensure they work properly on browsers with sound and video. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

Biztosíts fülhallgatókat, vagy kérd meg a tanulókat, hogy hozzanak magukkal, ha a kiválasztott gyakorlat hanggal együtt működik leginkább jól.

**Nem áll rendelkezésre elegendő számítógép?** [Programozzatok társasan!](https://www.youtube.com/watch?v=vgkahOzFH2Q) Ha a tanulók összefognak, akkor tudják segíteni egymást és kevésbé támaszkodnak a tanárra. Megláthatják azt, hogy az informatika közösségépítő hatású, és együttműködésre sarkall.

<img src="/images/fit-350/group_ipad.jpg" />

## 5. Start your Hour of Code off with an inspiring speaker or video

**Invite a [local volunteer](%= codeorg_url('/volunteer/local') %) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code through either a classroom visit or video chat with your students!

**Mutass egy inspiráló videót az alábbiak közül:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh. (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available)
- Find more inspirational [resources](%= codeorg_url('/inspire') %) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Explain ways that technology impacts our lives, with examples both boys and girls will care about (talk about saving lives, helping people, connecting people, etc.).
- Az osztály gyűjtsön olyan mindennapi dolgokat, amelyeket a kódolás tesz lehetővé.
- See tips for getting girls interested in computer science [here](%= codeorg_url('/girls')%).

## 6. Code!

**Direct students to the activity**

- Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](%= resolve_url('/learn')%) under the number of participants.

**When your students come across difficulties it's okay to respond:**

- "Nem tudom. Találjunk együtt megoldást!"
- "A technika nem mindig úgy működik, mint ahogy azt mi elképzeljük."
- "Programozni tanulni, olyan mint egy nyelvet tanulni, nem tudsz azonnal folyékonyan beszélni."

**What if a student finishes early?**

- Students can see all tutorials and [try another Hour of Code activity](%= resolve_url('/learn')%).
- Vagy kérdd meg a korán végző tanulókat, hogy segítsenek egy társuknak, akinek nehezen megy a gyakorlat.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## 7. Celebrate

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

- [Print certificates](%= codeorg_url('/certificates')%) for your students.
- [Nyomtass "Teljesítettem a Kódolás Óráját!"](%= resolve_url('/promote/resources#stickers') %) matricákat a tanulóknak.
- [Rendeljen személyre szabott pólókat](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) az iskolának.
- Oszd meg a "Kódolás Órája"-hoz kapcsolódó fotóidat, videóidat a közösségi hálón. Használd a #HourOfCode és a @codeorg tageket, így mi is ki tudjuk emelni az eredményeidet!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">&nbsp;</p>

## Egyéb "Kódolás Órája" források tanároknak:

- Látogass el a [Kódolás Órája tanári fórumára](http://forum.code.org/c/plc/hour-of-code), hogy tanácsokat, tippeket és támogatást kapj a többi oktatótól. <% if @country == 'us' %>
- Olvasd át a [Kódolás Órája GYIK](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code) részét. <% end %>

## Mi jön a "Kódolás Órája" után?

A Kódolás Órája esemény csak az első lépés, hogy újat tanulj a technológia működéséről, és hogy készíts új szoftvereket. Itt tudod folytatni ezt az utat:

- Encourage students to continue to [learn online](%= codeorg_url('/learn/beyond')%).
- [Attend](%= codeorg_url('/professional-development-workshops') %) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)

<%= view :signup_button %>