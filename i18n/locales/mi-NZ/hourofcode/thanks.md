* * *

title: <%= hoc_s(:title_signup_thanks) %> layout: wide nav: how_to_nav

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png" "og:image:width": 1440 "og:image:height": 900 "og:url": "http://<%=request.host%>"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png"

* * *

<% facebook = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# Tēnā koe i tō waitohu mai ki te taurima i tētahi Hour of Code!

Māu, ka whai wāhi ngā ākonga puta noa i te ao ki te ako i tētahi Hour of Code mā reira e *rerekē ai ō rātou oranga*, i te wā o <%= campaign_date('full') %>. Mā mātou koe e whakapā me ngā kōrero mō ngā whakaakoranga hou me ētahi atu whakahoutanga mīharo rawa atu. Me aha rawa koe ināianei?

## 1. Kawea te kupu

Kātahi anō koe ka piri mai ki te kuhunga Hour of Code. Tēnā kawea atu te kupu ki ō hoa mā **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Kimihia he tūao o tō hapori tonu ki te āwhina i a koe me tō takunetanga.

[Rapuahia he tūao i tā mātou mahere tūao](%= resolve_url('https://code.org/volunteer/local') %) e āhei ana ki te haere atu ki tō akomanga, ki te kōrero ā-tuihono rānei ki te akiaki i ō ākonga i roto i te whānuitanga o ngā mahi ka taea me te pūtaiao rorohiko.

## 3. Tēnā tono atu ki tō kura kia riro mā te kura katoa tētahi takunetanga Hour of Code e hāpai

[Tukuna tēnei īmēra](%= resolve_url('/promote/resources#sample-emails') %) ki tō tumuaki me te whakatakoto i te taki ki mua i ngā akomanga katoa kia hikina e rātou, kia waitohu rātou.

## 4. Pōhiritia tō rangatira mahi

[Tukuna tēnei īmēra](%= resolve_url('/promote/resources#sample-emails') %) ki tō pāhi, ki te kaiurungi rānei o tō pakihi.

## 5. Whakatairangatia te Hour of Code i tō hapori

[Kimihia he rōpū i tō hapoti](%= resolve_url('/promote/resources#sample-emails') %) - karapu tāpae tama/hine, whakapono, whare wānanga, kaumātua, uniana, ka mutu ō hoa. Ehara i te mea me noho ki tētahi kura ki te ako i ētahi pūkenga hou. Whakamahia ēnei [pānui whakaahua, haki, tukupiri, ataata, aha atu rānei](%= resolve_url('/promote/resources') %) mō tāu takunetanga.

## 6. Pōhiritia te kaitōrangapū ā-rohe ki te tautoko i te Hour of Code

[Tukuna tēnei īmēra](%= resolve_url('/promote/resources#sample-emails') %) ki ngā kaitōrangapū, ki te kaunihera, ki te pōari o te kura rānei ki te pōhiri i a rātou ki tō kura mō te Hour of Code. Mā tēnei ka tautoko i ngā mahi pūtaiao rorohiko i tō takiwā haere ake nei.

## 7. Whakamaheretia tō Hour of Code

Kōwhiria tētahi ngohe Hour of Code kātahi ka [ arotake i tēnei puka aratohu mā-hea](%= resolve_url('/how-to') %).

## 8. Ki tua o Hour of Code

Kua rite koe ki te kawe i ngā mōhiotanga ki tua o Hour of Code? Tirohia [ā mātou whakaakoranga katoa me ā matou rauemi pouako](%= resolve_url('https://code.org/teach')%) ka mutu ngā mahi ngaiotanga mā ngā pouako katoa o ngā taumata ako katoa.

<%= view 'popup_window.js' %>