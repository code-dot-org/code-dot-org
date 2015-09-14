<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>

<% फेसबुक = {:u=>"http://#{request.host}/us"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).लाई समावेश गर्नुहुन्छ? '#HourOfCode' %>

# Hour of Code होस्ट गर्नुकोलागी sign up गर्नु भएकोमा धन्यवाद!

You're making it possible for students all around the world to learn one Hour of Code that can *change the rest of their lives*, during Dec. 7-13.

We'll be in touch about prizes, new tutorials and other exciting updates in the fall. So, what can you do now?

## १. जानकारी फैलाउनुहोअस्

#HourOfCode बारेमा साथिहरुलाई भन्नुहोश.

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## २. तपाईको स्कूललाई Hour of Code को प्रस्ताब राखन भन्नुहोश

[Send this email](<%= hoc_uri('/resources#email') %>) to your principal to encourage every classroom at your school to sign up.

## ३. तपाईको कम्पनीलाई संलग्न हुन भन्नुहोश

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager or the CEO.

## ४. तपाईको समुदायमा Hour of Code को प्रवर्द्धन गर्नुहोश

Recruit a local group — boy/girl scouts club, church, university, veterans group or labor union. Or host an Hour of Code "block party" for your neighborhood.

## ५. Hour of Code समर्थनगर्नुकोलागी स्थानीय निर्वाचित आधिकारिकको सहयोग मग्नुहोश

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school for the Hour of Code.

<%= view 'popup_window.js' %>