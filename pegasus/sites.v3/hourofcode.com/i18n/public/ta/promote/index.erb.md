---
title: <%= hoc_s(:title_how_to_promote).inspect %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<%
    facebook = {:u=>"http://#{request.host}/us"}

    twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
    twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'
%>

# கோட் ஆஃப் ஹவர் பகுதியில் உங்கள் சமூகத்தை ஈடுபடுத்தவும்

## 1. வார்த்தையை பரப்புங்கள்

** #HourOfCode </ strong> பற்றி உங்கள் நண்பர்களிடம் சொல்லுங்கள்!</p> 

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. ஒரு மணிநேர கோட் ஒன்றை வழங்க உங்கள் பள்ளி முழுவதையும் கேளுங்கள்

[ உங்கள் மின்னஞ்சலை அனுப்பவும் ](<%= resolve_url('/promote/resources#sample-emails') %>) உங்கள் பள்ளிக்கு ஒவ்வொரு வகுப்பறையையும் பதிவு செய்வதற்கு சவால் விடுங்கள்.

## 3. தொடர்பு கொள்ள உங்கள் முதலாளிக்கு கேளுங்கள்

உங்கள் நிர்வாகி அல்லது நிறுவனத்தின் தலைமை நிர்வாக அதிகாரிக்கு [ இந்த மின்னஞ்சலை அனுப்புக ](<%= resolve_url('/promote/resources#sample-emails') %>).

## 4. உங்கள் சமூகத்தில் கோட் மணிநேரத்தை ஊக்குவிக்கவும்

[ ஒரு உள்ளூர் குழுவை சேர்ப்பது ](<%= resolve_url('/promote/resources#sample-emails') %>) - சிறுவன் / பெண் சாரணர் கிளப், சர்ச், பல்கலைக்கழகம், வீரர்கள் குழு, தொழிலாளர் சங்கம் அல்லது சில நண்பர்கள். புதிய திறமைகளை கற்றுக்கொள்ள நீங்கள் பள்ளியில் இருக்க வேண்டியதில்லை. உங்கள் சொந்த நிகழ்விற்கான இந்த [ சுவரொட்டிகள், பதாகைகள், ஸ்டிக்கர்கள், வீடியோக்கள் மற்றும் பலவற்றை ](<%= resolve_url('/promote/resources') %>) பயன்படுத்தவும்.

## 5. நியமிக்கப்பட்ட அலுவலரை கோடரியின் ஆதரவைக் கேட்கும்படி கேளுங்கள்

உங்கள் உள்ளூர் பிரதிநிதிகள், நகர சபை அல்லது பள்ளி வாரியத்திற்கு [ இந்த மின்னஞ்சலை அனுப்புக ](<%= resolve_url('/promote/resources#sample-emails') %>) கோட்டின் மணி. இது ஒரு மணி நேரத்திற்கு அப்பால் உங்கள் பகுதியில் கணினி அறிவியல் ஆதரவு உருவாக்க உதவ முடியும்.

<%= view :signup_button %>