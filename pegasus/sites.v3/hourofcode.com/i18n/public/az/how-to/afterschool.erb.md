---
title: <%= hoc_s(:title_how_to).inspect %>
layout: wide
nav: how_to_nav
---
<%= view :signup_button %>

# Məktəb müddəti və klublarda bir Saat Kodunu necə öyrətmək olar

### Hərəkətə qoşulun və bir qrup şagirdin bu addımlarla ilk dəfə kompüter biliklərini təqdim edin. Kod saatı asan başlayır - hətta yeni başlayanlar üçün! If you'd like an extra set of hands to help out, you can find a [local volunteer](<%= codeorg_url('/volunteer/local') %>) to help run an Hour of Code in your after-school class or club.

---

## 1. Necə edilir videosuna baxın <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen mark="crwd-mark"></iframe> 

## 2. Bir dərslik seçin

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('/learn') %>) for participants all ages, created by a variety of partners. [Try them out!](<%= resolve_url('/learn') %>)

**All Hour of Code tutorials** require minimal prep-time for organizers, and are self-guided - allowing kids to work at their own pace and skill-level.

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

**Need a lesson plan for your afterschool Hour of Code?** Check out this [template](/files/AfterschoolEducatorLessonPlanOutline.docx)!

## 3. Promote your Hour of Code

Promote your Hour of Code [with these tools](<%= resolve_url('/promote') %>) and encourage others to host their own events.

## 4. Plan your technology needs - computers are optional

The best Hour of Code experience includes Internet-connected computers. But you **don’t** need a computer for every child, and you can even do the Hour of Code without a computer at all.

Səs və video ilə brauzerlərdə düzgün işləməyini təmin etmək üçün tələbə kompüterləri və ya cihazları üzrə təlimlər test etməyi unutmayın. **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

Sənin sinfiniz üçün qulaqlıq təmin edin və ya seçdiyiniz təlimçi səs ilə yaxşı işləsə, tələbələrə özlərini gətirmələrini xahiş edin.

**Don't have enough devices?** Use [pair programming](https://www.youtube.com/watch?v=vgkahOzFH2Q). Şagirdlər yoldaşlı işləyəndə bir-briniə kömək edirlər və müəllimdən daha az asılı olurlar. Onlar həm də görərlər ki, informatika ictimai və kollektiv bir sahədir.

## 5. Rəhbər bir video ilə Kodunuzun saatını başla

İştirakçıların ruhlandırması və kompüter elminin həyatımızın hər bir hissəsinə necə təsir edəcəyini müzakirə edərək, Kodunuzun saatını açın.

**Show an inspirational video:**

- The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh - there are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions available.
- The [Hour of Code Worldwide video](https://www.youtube.com/watch?v=KsOIlDT145A)
- [President Obama calling on all students to learn computer science](https://www.youtube.com/watch?v=6XvmhE1J9PY).
- Find more inspirational videos [here](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**It’s okay if you are all brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**

- Həyat yollarını izah etmək texnologiyanı həyat və həyat tərzimizə necə təsir göstərəcəyini izah edin. Uşaqlar həm qızlar, həm də qızlar haqqında düşünürlər (Yaşamları xilas etmək, insanlara kömək etmək, insanları birləşdirmək və s).
- List things that use code in everyday life.
- See tips for getting girls interested in computer science [here](<%= resolve_url('https://code.org/girls') %>).

**Need more guidance?** Download this [template lesson plan](/files/AfterschoolEducatorLessonPlanOutline.docx).

## 6. Code!

**Direct participants to the activity** - Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn') %>) under the number of participants.

**When someone comes across difficulties it's okay to respond:** - “I don’t know. Let’s figure this out together.” - “Technology doesn’t always work out the way we want.” - “Learning to program is like learning a new language; you won’t be fluent right away.”

**What to do if someone finishes early?** - Encourage participants to try another Hour of Code activity at [hourofcode.com/learn](<%= resolve_url('/learn') %>) - Or, ask those who finish early to help others who are having trouble.

## 7. Celebrate

- [Print certificates](<%= codeorg_url('/certificates') %>) for your students.
- [Print "I did an Hour of Code!"](<%= resolve_url('/promote/resources#stickers') %>) stickers for your students.
- [Order custom t-shirts](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) for participants.
- Share photos and videos of your Hour of Code event on social media. Use #HourOfCode and @codeorg so we can highlight your success, too!

## Tədrisçilər üçün digər Kod qaynaqları

- Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from past Hour of Code organizers.
- Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
- Visit the [Hour of Code Forum](http://forum.code.org/c/plc/hour-of-code) to get advice, insight and support from other organizers. <% if @country == 'us' %>
- Review the [Hour of Code FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>

## Kod Saatından sonra nə gəlir?

Kod Saatı sadəcə texnologiyanın necə işlədiyi və proqram təminatının necə hazırlandığını haqqında daha çox öyrənmə səyahətində atılan birinci addımdır. Tələbələrə səyahətlərinə davam etməyə kömək edir və onları [daha çox onlayn öyrənməyə](<%= codeorg_url('/learn/beyond') %>) cəsarətləndirir!

<%= view :signup_button %>