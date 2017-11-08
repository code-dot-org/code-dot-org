---
title: '<%= hoc_s(:title_signup_thanks) %>'
layout: wide
nav: how_to_nav
social:
  "og:title": '<%= hoc_s(:meta_tag_og_title) %>'
  "og:description": '<%= hoc_s(:meta_tag_og_description) %>'
  "og:image": 'http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png'
  "og:image:width": 1440
  "og:image:height": 900
  "og:url": 'http://<%=request.host%>'
  "twitter:card": player
  "twitter:site": '@codeorg'
  "twitter:url": 'http://<%=request.host%>'
  "twitter:title": '<%= hoc_s(:meta_tag_twitter_title) %>'
  "twitter:description": '<%= hoc_s(:meta_tag_twitter_description) %>'
  "twitter:image:src": 'http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png'
---
<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# អរគុណសំរាប់ការចុះឈ្មេាះក្នុងការធ្វើជាម្ចាស់ផ្ទះ ម៉ោងសំរាប់កូដ

ជាការអរគុណសំរាប់​ជំនួយរបស់​អ្នក​ ដែល​ធ្វើ​អោយ​សិស្សានុសិស្សអាច​ចាំផ្ដើម​រៀន​វិទ្យាសាស្រ្ត​កុំព្យូទ័រ ពួក​យើង​មាន​សេចក្ដី​សោមន្សរីករាយ​នឹង​ប្រគល់​ជូន​លោក​អ្នក​នៅបដា​មួយដែល​បង្ហាញពីគំរូរម៉ូដែល​ចំរុះ សំរាប់ថ្នាក់​រៀន​របស់​អ្នក ប្រើកូដដែល​ផ្លល់អោយ​នេះ **FREEPOSTERS** ពេល​ចាក​ចេញ. ចំណាំ: វាអាចប្រើបាននៅពេលដែលការផ្គត់ផ្គង់ចុងក្រោយហើយអ្នកនឹងត្រូវការចំណាយលើការដឹកជញ្ជូន Since these posters ship from the United States, shipping costs can be quite high if shipping to Canada and internationally. We understand that this may not be in your budget, and we encourage you to print the [PDF files](https://code.org/inspire) for your classroom.)  
<br /> [<button>Get posters</button>](https://store.code.org/products/code-org-posters-set-of-12) Use offer code FREEPOSTERS

<br /> **Hour of Code runs during <%= campaign_date('full') %>. We'll be in touch about new tutorials and other exciting updates as they come out. In the meantime, what can you do now?**

## 1. ផ្សព្វផ្សាយពាក្យនៅក្នុងសាលារៀននិងសហគមន៍របស់អ្នក

You just joined the Hour of Code movement. Tell your friends with **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %> <br /> លើកទឹកចិត្តអ្នកដទៃឱ្យចូលរួម [ ជាមួយអ៊ីម៉ែលគំរូរបស់យើង។ ](%= resolve_url('/promote/resources#sample-emails') %)ទាក់ទងនាយកសាលារបស់អ្នកនិងប្រកួតប្រជែងគ្រប់បន្ទប់រៀននៅសាលារបស់អ្នកដើម្បីចុះឈ្មោះ។ ជ្រើសរើសក្រុមក្នុងតំបន់ - ក្លឹបកាយរិទ្ធកុមារី / ក្រុមកាយរិទ្ធ, ក្រុមជំនុំ, សាកលវិទ្យាល័យ, ក្រុមអតីតយុទ្ធជន, សហជីពការងារឬសូម្បីតែមិត្តភក្តិមួយចំនួន។ You don't have to be in school to learn new skills. សូមអញ្ជើញអ្នកនយោបាយឬអ្នកបង្កើតគោលនយោបាយក្នុងស្រុកឱ្យទៅលេងសាលារបស់អ្នកសម្រាប់ម៉ោងកូដ។ It can help build support for computer science in your area beyond one hour.

Use these [posters, banners, stickers, videos and more](%= resolve_url('/promote/resources') %) for your own event.

## 2. ស្វែងរកអ្នកស្ម័គ្រចិត្ដក្នុងតំបន់ដើម្បីជួយអ្នកជាមួយនឹងព្រឹត្តិការណ៍របស់អ្នក។

[ស្វែងរកផែនទីស្ម័គ្រចិត្តរបស់យើង](%= resolve_url('https://code.org/volunteer/local') %)សម្រាប់អ្នកស្ម័គ្រចិត្តដែលអាចទៅលេងថ្នាក់រៀនឬការជជែកកំសាន្តជាវីដេអូពីចម្ងាយដើម្បីជម្រុញសិស្សរបស់អ្នកអំពីទំហំនៃលទ្ធភាពដែលមានជាមួយ​វិទ្យាសាស្រ្តកុំព្យូទ័រ។

## 3. រៀបចំម៉ោងម៉ោងរបស់អ្នក

Choose an [Hour of Code activity](https://hourofcode.com/learn) for your classroom and [review this how-to guide](%= resolve_url('/how-to') %).

# ទៅហួសម៉ោង​កូដ

<% if @country == 'us' %> មួយម៉ោងនៃកូដគឺគ្រាន់តែជាការចាប់ផ្តើម។ មិនថាអ្នកជាអ្នកគ្រប់គ្រងគ្រូបង្រៀនឬអ្នកតស៊ូមតិទេយើងមាន [ការអភិវឌ្ឍវិជ្ជាជីវៈកម្មវិធីសិក្សានិងធនធានដើម្បីជួយអ្នកនាំយកថ្នាក់វិទ្យាសាស្រ្តកុំព្យូទ័រទៅសាលារៀនរបស់អ្នកឬពង្រីកការផ្តល់ជូនរបស់អ្នក។ ](https://code.org/yourschool)ប្រសិនបើអ្នកបង្រៀនវិទ្យាសាស្ត្រកុំព្យូទ័ររួចហើយសូមប្រើ ធនធានទាំងនេះក្នុងអំឡុងពេលសប្តាហ៍អប់រំអេកូដើម្បីប្រមូលគាំទ្រពីរដ្ឋបាលឪពុកម្តាយនិងសហគមន៍របស់អ្នក។

អ្នកមានជម្រើសជាច្រើនដើម្បីឱ្យសមនឹងសាលារបស់អ្នក។ អង្គការភាគច្រើនដែលផ្តល់ជូននូវវគ្គសិក្សាកូដហួរកូដក៏មានកម្មវិធីសិក្សានិងការអភិវឌ្ឍវិជ្ជាជីវៈផងដែរ។ ប្រសិនបើអ្នករកឃើញមេរៀនដែលអ្នកចូលចិត្តសូមសួរអំពីការបន្តទៀត។ ដើម្បីជួយអ្នកចាប់ផ្តើមយើងបានគូសបញ្ជាក់អ្នកផ្តល់កម្មវិធីសិក្សា [ មួយចំនួនដែលនឹងជួយអ្នកឬសិស្សរបស់អ្នកឱ្យលើសពីមួយម៉ោង។ ](https://hourofcode.com/beyond)

<% else %> មួយម៉ោងនៃកូដគឺគ្រាន់តែជាការចាប់ផ្តើម។ ភាគច្រើននៃអង្គការដែលផ្តល់ជូននូវមេរៀនម៉ោងកូដក៏មានកម្មវិធីសិក្សាដែលអាចរកបានបន្ថែមទៀត។ ដើម្បីជួយអ្នកចាប់ផ្តើមយើងបានគូសបញ្ជាក់អ្នកផ្តល់កម្មវិធីសិក្សា [ មួយចំនួនដែលនឹងជួយអ្នកឬសិស្សរបស់អ្នកឱ្យលើសពីមួយម៉ោង។ ](https://hourofcode.com/beyond)

Code.org ក៏ផ្តល់ជូននូវ[វគ្គសិក្សាវិទ្យាសាស្រ្តកុំព្យូរទ័រ](https://code.org/educate/curriculum/cs-fundamentals-international)ទាំងស្រុង ដែលបានបកប្រែជាង 25 ភាសាដោយឥតគិតថ្លៃដល់អ្នកឬសាលារបស់អ្នក។ <% end %>

<%= view 'popup_window.js' %>