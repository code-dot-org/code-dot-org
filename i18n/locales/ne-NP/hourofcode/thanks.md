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

## 3. उदार दान गर्नुहोस्

[हाम्रो क्राउडफन्डिङ् अभियानमा दान गर्नुहोस्](http://code.org/donate)। 100 मिलियन बच्चाहरूलाई पढाउन, हामीलाई तपाइँको समर्थनको आवश्यकता पर्दछ। हामीले इतिहासमा [क्राउडफन्डिङ् अभियानको सबै भन्दा ठूलो शिक्षा](http://code.org/donate) के हुन्छ भनि केबल सुरु गर्यौँ। हरेक डलरलाई आफ्नो प्रभाव दुईगुणा प्रमुख Code.org [दाताहरू](http://code.org/about/donors) द्वारा, मिलान गरिने छ।

## 4. आफ्नो मालिकलाई आवद्ध हुन सोध्नुहोस्

[यो इमेललाई](/resources#email) तपाइँको व्यवस्थापक, वा CEO लाई पठाउनुहोस्। वा [तिनिहरूलाई यो हातेपुस्तिका दिनुहोस्](/resources/hoc-one-pager.pdf).

## तपाइँको समुदाय भित्र Hour of Code लाई प्रबर्द्धन गर्नुहोस्

स्थानीय समूहलाई भर्ती - क्लब, मन्दिर, विश्वविद्यालय, वा श्रम संघ. अथवा आफ्नो छिमेकीका लागि Hour of Code "ब्लक पार्टी" को संचालन गर्नुहोश.

## 6. Hour of Code लाई समर्थन गर्न स्थानीय चुनियका अधिकारीलाई सोध्नुहोस्

[यो इमेललाई](/resources#politicians) तपाइँको मेयर, सहरको सभा, वा विद्यालयको समितिमा पठाउनुहोस्। वा [तिनिहरूलाई यो हातेपुस्तिका दिनुहोस्](/resources/hoc-one-pager.pdf) र तिनिहरूलाई तपाइँको विद्यालयमा जान निमन्त्रणा दिनुहोस्।

<%= view 'popup_window.js' %>