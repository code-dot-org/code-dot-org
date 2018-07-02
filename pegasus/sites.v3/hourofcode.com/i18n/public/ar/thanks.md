---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
nav: how_to_nav

social:
  "og:title": "<%= hoc_s(:meta_tag_og_title) %>"
  "og:description": "<%= hoc_s(:meta_tag_og_description) %>"
  "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": "http://<%=request.host%>"

  "twitter:card": player
  "twitter:site": "@codeorg"
  "twitter:url": "http://<%=request.host%>"
  "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>"
  "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>"
  "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"
---
<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# شكراً لمشاركتك في استضافة حدث "ساعة البرمجة"!

كما نشكركم على مساعدتكم على تمكين الطلاب من البدء في تعلم علوم الكمبيوتر، نود أن نقدم لكم مجموعة مجانية من الملصقات التي تتميز بمختلف نماذج الأدوار لفصولك الدراسية. استخدام رمز العرض **FREEPOSTERS** أثناء الخروج. ملاحظة: هذا متوفر فقط حتى نفاذ الكمية لكن سوف تحتاج لتغطية تكاليف الشحن. بما ان هذه الملصقات تشحن من الولايات المتحدة، تكاليف الشحن يمكن أن تكون عالية جدا إذا تم الشحن إلى كندا ودوليا. نحن نفهم أن هذا قد لا يكون ضمن امكانياتك، نحن نشجعكم على طباعة [ ملفات PDF](https://code.org/inspire) للفصل الدراسي الخاص بك.)   
<br /> [ <button>الحصول على الملصقات</button>](https://store.code.org/products/code-org-posters-set-of-12) استخدام رمز العرض FREEPOSTERS

<% if @country == 'us' %> بفضل كرم أوزوبوت، دكستر للصناعات، ليتلبيتس، وورشة عمل وندر، سيتم اختيار أكثر من 100 فصل دراسي لتلقي روبوتات أو دوائر للحصص التي يقدمونها! لكي تكون مؤهلا لتلقي مجموعة، تأكد من إكمال الاستبيان المرسل من Code.org بعد ساعة من البرمجة. سوف تختار Code.org الفصول الدراسية الفائزة. في هذه الأثناء، تحقق من بعض أنشطة الروبوتات والدوائر. يرجى الملاحظة أن هذا مفتوح فقط للمدارس الأمريكية. <% end %>

<br /> **"ساعة من البرمجة" يتم تشغيلها أثناء < % = campaign_date('full') %> ووسنكون على اتصال حول الدروس الجديدة والتحديثات المثيرة الأخرى لأنها تخرج. في هذه الأثناء، ماذا يمكنك أن تفعل الآن؟ **

## انشر الامر في مدرستك ومجتمعك

لقد انضممت للتو لحركة ساعة من البرمجة ،. أخبر أصدقائك عبر **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> تشجيع الآخرين على المشاركة [ مع رسائل البريد الإلكتروني -](<%= resolve_url('/promote/resources#sample-emails') %>) اتصل بالمدير الخاص بك وتحدي كل الفصول الدراسية في مدرستك للتسجيل. تعيين مجموعة محلية – فتى/فتاة نادي كشافة ، الكنيسة، جامعة، فريق قدامى المحاربين، واتحاد العمال، أو حتى بعض الأصدقاء. لست بحاجة لأن تكون في المدرسة لتعلم مهارات جديدة. دعوة سياسي محلي أو صانع سياسة لزيارة مدرستك لساعة من البرمجية. يمكن أن تساعد في بناء دعم لعلوم الكمبيوتر في منطقتك بعد ساعة واحدة.

استخدم هذه [الملصقات، واللافتات، والملصقات، ومقاطع الفيديو والمزيد](<%= resolve_url('/promote/resources')%>)لحدثك الخاص.

## 2. البحث عن متطوع محلي لمساعدتك في الحدث الخاص بك.

[Search our volunteer map](<%= codeorg_url('/volunteer/local') %>) for volunteers who can visit your classroom or video chat remotely to inspire your students about the breadth of possibilities with computer science.

## 3. ضع خطة لساعتك من البرمجة

اختر [ نشاط "ساعة من البرمجية"](https://hourofcode.com/learn) للفصول الدراسية و [ استعراض هذا الدليل ](<%= resolve_url('/how-to') %>).

# تجاوز ساعة من البرمجية

<% if @country == 'us' %> ساعة من البرمجة هي البداية فقط. إذا كنت مسؤول، او من المعلمين، أو داعية، لدينا [ تنمية مهنية ومناهج وموارد لمساعدتك على تقديم دروس علوم الكمبيوتر في المدرسة الخاصة بك أو قم بتوسيع العروض الخاصة بك-](https://code.org/yourschool) إذا سبق لك تعليم علوم الكمبيوتر، استخدم هذه الموارد خلال أسبوع التعليم CS لحشد الدعم من الإدارة، والآباء، والمجتمع.

لديك العديد من الخيارات لتناسب مدرستك. معظم المنظمات التي تقدم ساعة من البرمجة لديها أيضا مناهج دراسية وتنمية مهنية. إذا وجدت درسا يعجبك،حاول المضي قدما. لمساعدتك في البدء، قمنا بتسليط الضوء على عدد من موفري المناهج الدراسية [ الذين سيساعدونك للإنتقال الى ما بعد ساعة من البرمجة. ](https://hourofcode.com/beyond)

<% else %> ساعة من البرمجة هي البداية فقط. معظم المنظمات التي تقدم ساعة من البرمجه لديها أيضا مناهج متاحة للذهاب أبعد من ذلك. لمساعدتك في البدء، قمنا بتسليط الضوء على عدد من موفري المناهج الدراسية [ الذين سيساعدونك للإنتقال الى ما بعد ساعة من البرمجة. ](https://hourofcode.com/beyond)

يقدم Code.org أيضا [ دورات تمهيدية لعلوم الكمبيوتر ](https://code.org/educate/curriculum/cs-fundamentals-international) مترجمة إلى أكثر من 25 لغة دون أي تكلفة عليك أو على مدرستك. <% end %>

<%= view 'popup_window.js' %>