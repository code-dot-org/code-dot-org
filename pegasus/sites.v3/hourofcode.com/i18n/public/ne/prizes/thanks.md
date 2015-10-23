---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
social:
'og:title': '<%= hoc_s(:meta_tag_og_title) %>'
'og:description': '<%= hoc_s(:meta_tag_og_description) %>'
'og:image': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'og:image:width': 1705
'og:image:height': 949
'og:url': 'http://<%=request.host%>'
'og:video': 'https://youtube.googleapis.com/v/rH7AjDMz_dc'
'twitter:card': player
'twitter:site': '@codeorg'
'twitter:url': 'http://<%=request.host%>'
'twitter:title': '<%= hoc_s(:meta_tag_twitter_title) %>'
'twitter:description': '<%= hoc_s(:meta_tag_twitter_description) %>'
'twitter:image:src': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'twitter:player': 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0'
'twitter:player:width': 1920
'twitter:player:height': 1080
---

<%= view :signup_button %>

# Thanks for signing up for a chance to win the $10,000 Hardware Prize

Your whole school is now entered to win a class-set of laptops (or $10,000 for other technology). We'll be reviewing your application and announcing the winners in December.

## १. जानकारी फैलाउनुहोअस्

#HourOfCode बारेमा साथिहरुलाई भन्नुहोश.

## २. तपाईको स्कूललाई Hour of Code को प्रस्ताब राखन भन्नुहोश

[Send this email](<%= resolve_url('/promote/resources#email') %>) to your principal.

## ३. तपाईको कम्पनीलाई संलग्न हुन भन्नुहोश

[Send this email](<%= resolve_url('/promote/resources#email') %>) to your manager, or the CEO.

## 4. आफ्नो समुदायमा Hour of Code लाई बढावा दिनुहोस्

एक स्थानीय समूह — केटा/केटी, स्काउट क्लब, चर्च, विश्वविद्यालय, अनुभविहरूको समूह वा श्रमिकको यूनियनको भर्ना गर्नुहोस्। वा तपाइँको छिमेकीको लागि Hour of Code "ब्लक पार्टी" लाई होस्ट गर्नुहोस्। [Send this email](<%= resolve_url('/promote/resources#email') %>).

## ५. Hour of Code समर्थनगर्नुकोलागी स्थानीय निर्वाचित आधिकारिकको सहयोग मग्नुहोश

[Send this email](<%= resolve_url('/promote/resources#politicians') %>) to your mayor, city council, or school board and invite them to visit your school.

<%= view :signup_button %>