* * *

शीर्षक: Hour of Code मा स्वागत गर्न साइन अप गर्नको लागि धन्यवाद छ! सजावट: फराकिलो 

social: "og:title": "<%= hoc_s(:meta_tag_og_title) %>" "og:description": "<%= hoc_s(:meta_tag_og_description) %>" "og:image": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "og:image:width": 1705 "og:image:height": 949 "og:url": "http://<%=request.host%>" "og:video": "https://youtube.googleapis.com/v/rH7AjDMz_dc"

"twitter:card": player "twitter:site": "@codeorg" "twitter:url": "http://<%=request.host%>" "twitter:title": "<%= hoc_s(:meta_tag_twitter_title) %>" "twitter:description": "<%= hoc_s(:meta_tag_twitter_description) %>" "twitter:image:src": "http://<%=request.host%>/images/hour-of-code-2014-video-thumbnail.jpg" "twitter:player": 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0' "twitter:player:width": 1920 "twitter:player:height": 1080

* * *

<% फेसबुक = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).लाई समावेश गर्नुहुन्छ? '#HourOfCode' %>

# Hour of Code होस्ट गर्नुकोलागी sign up गर्नु भएकोमा धन्यवाद!

**सबै** Hour of Code संचालकले धन्यवाद स्वरुप पाउनु हुनेछ १० GB Dropbox space अथवा $१० Skype credit. [बिस्तृत जानकारी](/prizes)

<% if @country == 'us' %>

तपाइँको सम्पूर्ण विद्यालयमा ठूला उपहारहरू लिने अवसरको लागि तपाइँको [सबै विद्यालयलाई सहभागि](/us/prizes) गराउन।

<% end %>

## १. जानकारी फैलाउनुहोअस्

#HourOfCode बारेमा साथिहरुलाई भन्नुहोश.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## २. तपाईको स्कूललाई Hour of Code को प्रस्ताब राखन भन्नुहोश

[यो इमेल पठाउनुहोस्](/resources#email) वा [यो हातेपुस्तिका तपाइँको प्रधानाध्यापकलाई दिनुहोस्](/files/schools-handout.pdf)। तपाइको स्कूल सहभागी भएपछि, [$१०००० बराबर को टेक्नोलोजी समान पाउन भाग लिनुहोश](/prizes), र अरु स्कूललाई सहभागी हुन आमन्त्रण गर्नुहोश.

<% else %>

## २. तपाईको स्कूललाई Hour of Code को प्रस्ताब राखन भन्नुहोश

[यो इमेल पठाउनुहोस्](/resources#email) वा [यो हातेपुस्तिका तपाइँको प्रधानाध्यापकलाई दिनुहोस्](/files/schools-handout.pdf)।

<% end %>

## 3. Make a generous donation

[Donate to our crowdfunding campaign](http://code.org/donate). To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://code.org/donate) in history. Every dollar will be matched by major Code.org [donors](http://code.org/about/donors), doubling your impact.

## 4. Ask your employer to get involved

[Send this email](/resources#email) to your manager, or the CEO. Or [give them this handout](/resources/hoc-one-pager.pdf).

## 5. Promote Hour of Code within your community

स्थानीय समूहलाई भर्ती - क्लब, मन्दिर, विश्वविद्यालय, वा श्रम संघ. अथवा आफ्नो छिमेकीका लागि Hour of Code "ब्लक पार्टी" को संचालन गर्नुहोश.

## 6. Ask a local elected official to support the Hour of Code

[Send this email](/resources#politicians) to your mayor, city council, or school board. Or [give them this handout](/resources/hoc-one-pager.pdf) and invite them to visit your school.

<%= view 'popup_window.js' %>