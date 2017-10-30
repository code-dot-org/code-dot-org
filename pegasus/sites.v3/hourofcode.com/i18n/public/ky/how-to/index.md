---

title: <%= hoc_s(:title_how_to) %>
layout: wide
nav: how_to_nav

---

<%= view :signup_button %>

# Код саатын кантип үйрөтүү керек

Кыймылга кошулуп, окуучулардын тобуна алгачкы компүтердик билимин бул кадамдар аркылуу тааныштыргыла:

## 1) Кандай кылуу видеосун көрүңүз <iframe width="500" height="255" src="//www.youtube.com/embed/SrnvvWDm73k" frameborder="0" allowfullscreen></iframe> 

## 2) Сабагыңызга жетектеме тандаңыз:

Биз бардык курактагы катышуучуларга өнөктөрүбүз даярдаган [кызыктуу, бир сааттык көнүгүүлөрдү](<%= resolve_url('/learn') %>) камсыздайбыз.

**[Код саатынын окуучулар үчүн жетектемелери:](<%= resolve_url('/learn') %>)**

  * Мугалим тез даярдана алат
  * Are self-guided - allowing students to work at their own pace and skill-level

**[Код саатынын мугалимдер үчүн жетектемелери:](<%= resolve_url('https://code.org/educate/teacher-led') %>)**

  * Мугалимден көбүрөөк даярданууну талап кылган сабактардын планы
  * Деңгээлине *жана* темасына жараша категориялаштырылган (мис., математика, англис тили ж. б.)

[![](/images/fit-700/tutorials.png)](<%= resolve_url('/learn') %>)

## 3) Код саатын илгерилетүү

Код сааты иш-чараңызды [бул жарактар](<%= resolve_url('/promote') %>) менен илгерилетип, башкаларды дагы иш-чара өткөзүүгө чакыргыла.

## 4) Керектүү техниканы пландаштыруу - компүтер, бар болсо

Код саатты интернетке туташкан компүтер менен мыкты натыйжа берет. Бирок ар бир балага компүтер болушу **керек эмес**, Код саатын компүтерсиз өткөзсө деле болот.

**Алдын ала пландаштыруу** -- иш-чарага чейин аткаргыла:

  * Жетектемелерди окуучулардын компүтеринен же мобилдик түзмөгүнөн текшергиле. Браузерден видео жана үнү туура берилип жатканы анык болсун.
  * Үнү бар жетектеме тандасаңыз, классты кулакчындар менен камсыздагыла же окуучуларга өздөрүнүкүн ала келүүсүн айткыла.
  * **Түзмөктөр жетишпейби?**[Жупташып](https://www.youtube.com/watch?v=vgkahOzFH2Q) иштегиле. Катышуучулар өнөктөшкөндө, бири-бирине жардамдашып, мугалимге азыраак кайрылышат. Ошондой эле компүтерде биргелешип кызматташса болоорун көрүшөт.
  * **Have low bandwidth?** Plan to show videos at the front of the class, so each student isn't downloading their own videos. Or try the unplugged / offline tutorials.

![](/images/fit-350/group_ipad.jpg)

## 5) Код саатын шыктандыруучу сөз айткан киши же видео менен баштаңыз

**Компүтердик технологиялардын кеңири мүмкүнчүлүктөрү тууралуу шыктандыруучу айтып берүүчү [жергиликтүү ыктыярчыларды](https://code.org/volunteer/local) чакыргыла**. Код саатыңызды өткөзүүгө жардам берүүгө даяр дүйнөдө миңдеген ыктыярчылар бар. [Бул картаны](https://code.org/volunteer/local) колдонуп, класска келип же окуучулар менен видеочатка чыга алуучу ыктыярчыларды таба аласыз.

[![](/images/fit-300/volunteer-map.png)](<%= resolve_url('https://code.org/volunteer/local') %>)

**Шыктандыруучу видео көрсөткүлө:**

  * The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions)
  * [Код сааты 2013 бетачар видеосу](https://www.youtube.com/watch?v=FC5FbmsH4fw), же <% if @country == 'uk' %> [Код сааты 2015 видеосу](https://www.youtube.com/watch?v=7L97YMYqLHc) <% else %> [Код сааты 2015 видеосу](https://www.youtube.com/watch?v=7L97YMYqLHc) <% end %>
  * [President Obama calling on all students to learn computer science](https://www.youtube.com/watch?v=6XvmhE1J9PY)
  * Дагы башка шыктандыруучу [ресурстар](<%= resolve_url('https://code.org/inspire') %>) жана [виделор](https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP).

**Өзүңүз жана окуучуларыңыз дагы компүтер менен тааныш болбосо - эч нерсе эмес. Код сааты иш-чараңызды тааныштыруунун айрым идеялары:**

  * Технологиянын жашообузга тийгизген таасиринен мисал бергиле - балдарга жана кыздарга тең кызык болсун (өмүр сактаган, жардам берген, кишилерди байланыштырган ж. б.).
  * Класс катары, турмуштагы код колдонгон нерселердин тизмеси.
  * Кыздарды компүтердик илимге кызыктыруучу кеңештер [бул жерде](<%= resolve_url('https://code.org/girls') %>).

**Дагы жетектемелер керекпи?** Бул [сабактын үлгү планын](/files/EducatorHourofCodeLessonPlanOutline.docx) жүктөп алгыла.

**Үйрөтүүнүн жаңы идеялары керекпи?** Тажрыйбалуу уюштуруучулардын [мыкты тажрыйбаларын](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) көрүңүз.

## 6) Код жазгыла!

**Катышуучуларды ишке багыттагыла**

  * Жетектеменин шилтемесин тактага жазгыла. Тизмеден катышуучулардын санына жараша [тандалган жетектеменин маалыматына](<%= resolve_url('/learn') %>) шилтемени тапкыла.

[col-33]

![](/images/fit-300/group_ar.jpg)

[/col-33]

**Окуучулар кыйынчылыкка дуушар болгондо мындай жооп берсе болот:**

  * "Мен билбейм. Келгиле, чогуу карап көрөлү."
  * "Технологиялар дайым эле биз каалагандай иштей бербейт."
  * "Програмдык тилди үйрөнүү жаңы тил үйрөнгөндөй; шыр эле эркин сүйлөп кете албайсың."

**[Бул үйрөтүү кеңештерин көрүңүз](http://www.code.org/files/CSTT_IntroducingCS.PDF)**

**Окуучу эрте бүтүрүп койсо эмне кылабыз?**

  * Окуучулар [hourofcode.com/learn](<%= resolve_url('/learn') %>) кирип, Код саатынынын башка тапшырмаларын иштеп көрүүгө чакыргыла
  * Же эрте бүткөн окуучулардан кыйналып жаткан досторуна жардам берүүсүн сурангыла.

[col-33]

![](/images/fit-250/highschoolgirls.jpeg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## 7) Майрамдагыла

[col-33]

![](/images/fit-300/boy-certificate.jpg)

[/col-33]

  * Окуучуларыңызга [сертификат чыгаргыла](<%= resolve_url('https://code.org/certificates') %>).
  * Окуучуларга [Мен "Код саатын өттүм"](<%= resolve_url('/promote/resources#stickers') %>) деген чаптама бастыргыла.
  * Мектебиңизге [ логосу бар футболкаларды](http://blog.code.org/post/132608499493/hour-of-code-shirts-and-more) жасатыңыз.
  * Код саатыңыздын фото жана видеолорун социалдык желелерде бөлүшкүлө. #HourOfCode ж-а @codeorg хештег колдонуп, ийгилигиңизди бизге дагы билдиргиле!

[col-33]

![](/images/fit-260/highlight-certificates.jpg)

[/col-33]

<p style="clear:both">
  &nbsp;
</p>

## Код саатынын үйрөтүүчүлөр үчүн дагы ресурсттар:

  * Код саатын уюштуруу үчүн бул [сабактын үлгү-планын](/files/EducatorHourofCodeLessonPlanOutline.docx) колдонгула.
  * Мурунку Код саатын үйрөтүүчүлөрдөн [мыкты тажрыйба](http://www.slideshare.net/TeachCode/hour-of-code-best-practices-for-successful-educators-51273466) алыңыз. 
  * [Код сааты вебинары үчүн Үйрөтүүчүлөрдүн жетектемеси](https://youtu.be/EJeMeSW2-Mw) видеобузду көрүңүз.
  * Код саатына даярдануу боюнча негиздөөчүбүз Хади Партовинин [ суроо-жооп түз көрсөтүүсүнө катышыңыз](http://www.eventbrite.com/e/ask-your-final-questions-and-prepare-for-the-2015-hour-of-code-with-codeorg-founder-hadi-partovi-tickets-17987437911).
  * [Код сааты форумуна](http://forum.code.org/c/plc/hour-of-code) кирип, башка үйрөтүүчүлөрдөн кеңеш жана колдоо алыңыз. <% if @country == 'us' %>
  * [Код саатынын КБСин](https://support.code.org/hc/en-us/categories/200147083-Hour-of-Code) карагыла. <% end %>

## Код саатынан кийин эмне болот?

Код сааты технологиялардын иштешин терең изилдөөдө саякатындагы жана програмдык жабдууларды өндүрүүдөгү биринчи эле кадам. Бул саякатты улантуу үчүн:

  * Окуучуларды [онлайн үйрөнүүнү](<%= resolve_url('https://code.org/learn/beyond') %>) улантууга чакыргыла.
  * Компүтердик технологиялар боюнча тажрыйбалуу адистер өткөзгөн 1 күндүк семинар-практикумга [катышкыла](<%= resolve_url('https://code.org/professional-development-workshops') %>). (АКШ үчүн гана)

<%= view :signup_button %>