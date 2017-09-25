---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# How to teach one Hour of Code

Join the movement and introduce a group of students to their first hour of computer science with these steps:

## 1) Әдістеме үшін мына бейнероликті көріңіз <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe>
## 2) Choose a tutorial for your hour:

We provide a variety of [fun, hour-long tutorials](<%= resolve_url('/learn') %>) for students of all ages, created by a variety of partners.

**[Student-guided Hour of Code tutorials:](<%= resolve_url('/learn') %>)**

  * Require minimal prep-time for teachers
  * Are self-guided - allowing students to work at their own pace and skill-level

**[Teacher-guided Hour of Code tutorials:](<%= resolve_url('https://code.org/educate/teacher-led') %>)**

  * Are lesson plans that require some advance teacher preparation
  * Are categorized by grade level *and* by subject area (eg Math, English, etc)

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

## 3) "Кодтау Cағатын" жарнамалауға көмектесу

Promote your Hour of Code [with these tools](<%= resolve_url('/promote') %>) and encourage others to host their own events.

## 4) Технологиялық қажеттіліктерді жоспарлаңыз - компьютерлер міндетті емес

Ең үздік "Кодтау Сағатының" тәжиребесі интернетке байланған компьютерлерді қамтиды. But you **don’t** need a computer for every child, and you can even do the Hour of Code without a computer at all.

**Алдын - ала жоспар жасаңыз!** Сабағыңыз басталмай тұрып, мына пункттерді ұмытпаңыз:

  * Test tutorials on student computers or devices. Make sure they work properly on browsers with sound and video.
  * Provide headphones for your class, or ask students to bring their own, if the tutorial you choose works best with sound.
  * **Компьютер немесе басқа да электроникалық жабдық жетпей жатыр ма?</a> Ол кезде, оқушыларыңызды жұп жұппен отырғызып сабақ өткізіңіз. When students partner up, they help each other and rely less on the teacher. Олар компьютерлік саланың жағымды да басқа адамдармен араласу мүмкінділігін көреді.</li> 
    
      * **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.</ul> 
    
    ![](/images/fit-350/group_ipad.jpg)
    
    ## 5) "Кодтау Сағатын" жігерлендіруші бейнероликтен бастаңыз
    
    **Invite a [local volunteer](https://code.org/volunteer/local) to inspire your students by talking about the breadth of possibilities in computer science.** There are thousands of volunteers around the world ready to help with your Hour of Code. [Use this map](https://code.org/volunteer/local) to find local volunteers who can visit your classroom or join a video chat with your students.
    
    [![](/images/fit-300/volunteer-map.png)](<%= resolve_url('https://code.org/volunteer/local') %>)
    
    **Жігерлендіруші бейнероликті көрсетіңіз:**
    
      * The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions)
      * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the <% if @country == 'uk' %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [Hour of Code 2015 video](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
      * [President Obama calling on all students to learn computer science](https://www.youtube.com/watch?v=6XvmhE1J9PY)
      * Find more inspirational [resources](<%= resolve_url('https://code.org/inspire') %>) and [videos](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).
    
    **It’s okay if both you and your students are brand new to computer science. Here are some ideas to introduce your Hour of Code activity:**
    
      * Балаларға тән ұғымды мысалдар келтіріп, қазіргі таңдағы технологияның өмірімізге деген ықпалын түсінідіріңіз. (Кейбір адамдардың өмірлерін құтқарған, көмек көрсеткен, жақындастырған, т.б. қосымшалар туралы айтып берсеңіз болады)
      * "Кодтауды" қажет ететін күнделікті қолданыстағы керек - жарақтар тізімін жасап көрсетіңіз.
      * [Мына сілтеме бойынша](<%= resolve_url('https://code.org/girls') %>) компьютерлік салада қыз балалардың қызығушылығын арттыратын салдар кеңестерін іздестіріп көріңіз.
    
    Көбірек **нұсқаулық** қажет пе? [Мына сабақ жоспары үлгісін](/files/EducatorHourofCodeLessonPlanOutline.docx) жүктеп алсаңыз болады.
    
    **Want more teaching ideas?** Check out [best practices](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) from experienced educators.
    
    ## 6) "Кодтау" барысын бастаңыз! 
    
    **Direct students to the activity**
    
      * Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](<%= resolve_url('/learn') %>) under the number of participants.
    
    [col-33]
    
    ![](/images/fit-300/group_ar.jpg)
    
    [/col-33]
    
    **Дәріс барысында оқушылардың кейбір қиыншылықтарға ұшырап, сұрақтар қоя бастағанда, абыржымай мынадай жауаптар беруге болады:**
    
      * "Білмей тұрмын. Бірге қарастырып көрейік."
      * "Технология әрқашан біздің қалағанымыздай болмауы мүмкін."
      * "Жаңа бағдарламаны үйрену жаңа бір тіл үйренгенмен бірдей; бірден бәрі кемшіліксіз болмайды."
    
    **[Check out these teaching tips](http://www.code.org/files/CSTT_IntroducingCS.PDF)**
    
    **What to do if a student finishes early?**
    
      * Students can see all tutorials and try another Hour of Code activity at [hourofcode.com/learn](<%= resolve_url('/learn') %>)
      * Or, ask students who finish early to help classmates who are having trouble with the activity.
    
    [col-33]
    
    ![](/images/fit-250/highschoolgirls.jpeg)
    
    [/col-33]
    
    <p style="clear:both">
      &nbsp;
    </p>
    
    ## 7) Марапаттаңыз
    
    [col-33]
    
    ![](/images/fit-300/boy-certificate.jpg)
    
    [/col-33]
    
      * Оқушыларыңыз үшін [сертификаттарды басып шығарыңыз](<%= resolve_url('https://code.org/certificates') %>).
      * ["Кодтау Сағатын бітірдім!"](<%= resolve_url('/promote/resources#stickers') %>) деген жапсырмалар басып шығарыңыз.
      * Жұмыс берушілеріңізге [арнайы жасалған жеңіл жейдешелерге](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) тапсырыс беріңіз.
      * Әлеуметтік жүйелерге "Кодтау Сағатынан" жиналған суреттер мен видеоларды салып, біз де сіздің табысыңызды жариялауымыз үшін #HourOfCode хэштэгін, және де @codeorg аккаунтын белгілеңіз!
    
    [col-33]
    
    ![](/images/fit-260/highlight-certificates.jpg)
    
    [/col-33]
    
    <p style="clear:both">
      &nbsp;
    </p>
    
    ## "Кодтау сағатының" оқытушылары үшін арналған басқа да керекті ресурстар: 
    
      * Use this [template lesson plan](/files/EducatorHourofCodeLessonPlanOutline.docx) to organize your Hour of Code.
      * Алдыңғы "Кодтау Сағаты" ұйымдастырушыларының [ең үздік тәжірибелері](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466). 
      * Watch the recording of our [Educator's Guide to the Hour of Code webinar](https://youtu.be/EJeMeSW2-Mw).
      * [Attend a live Q&A](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911) with our founder, Hadi Partovi to prepare for the Hour of Code.
      * Кеңес пен қолдау алып, ой - пікірмен бөлісу үшін ["Кодтау Сағаты Форумына"](http://forum.code.org/c/plc/hour-of-code) кіріп көріңіз. <% if @country == 'us' %>
      * Review the [Hour of Code FAQ](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code). <% end %>
    
    ## "Кодтау Cағаты" - ол не?
    
    The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey:
    
      * Encourage students to continue to [learn online](<%= resolve_url('https://code.org/learn/beyond') %>).
      * [Attend](<%= resolve_url('https://code.org/professional-development-workshops') %>) a 1-day, in-person workshop to receive instruction from an experienced computer science facilitator. (US educators only)
    
    <%= view :signup_button %>