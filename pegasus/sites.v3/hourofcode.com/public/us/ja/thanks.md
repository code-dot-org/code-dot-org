<% facebook = {:u=>"http://#{request.host}/us"}
                      twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
                      twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>



# Hour of Codeのイベント主催への登録にご協力頂き大変ありがとうございます！

**EVERY** Hour of Code organizer will receive 10 GB of Dropbox space or $10 of Skype credit as a thank you. [Details](<%= hoc_uri('/prizes') %>)

<% if @country == 'us' %>

Get your [whole school to participate](<%= hoc_uri('/prizes') %>) for a chance for big prizes for your entire school.

<% end %>

## 1. みんなに広めましょう

友達に #HourOfCodeを教えましょう。

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

<% if @country == 'us' %>

## 2. Hour of Codeを主催するよう学校と交渉しましょう。

[Send this email](<%= hoc_uri('/resources#email') %>) or [this handout](<%= hoc_uri('/files/schools-handout.pdf') %>). あなたの学校が参加したならば, [10,000ドル分の価値があるテクノロジーがあなたの学校に当選するチャンスがあります ](/prizes)そして、あなたの住まいの地域にある学校にも参加するよう誘ってください。

<% else %>

## 2. Hour of Codeを主催するよう学校と交渉しましょう。

[Send this email](<%= hoc_uri('/resources#email') %>) or give [this handout](<%= hoc_uri('/files/schools-handout.pdf') %>) to your principal.

<% end %>

## 3. Make a generous donation

[Donate to our crowdfunding campaign.](http://<%= codeorg_url() %>/donate) To teach 100 million children, we need your support. We just launched what could be the [largest education crowdfunding campaign](http://<%= codeorg_url() %>/donate) in history. Every dollar will be matched by major Code.org [donors](http://<%= codeorg_url() %>/about/donors), doubling your impact.

## 4. Ask your employer to get involved

[Send this email](<%= hoc_uri('/resources#email') %>) to your manager, or the CEO. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>).

## 5. Promote Hour of Code within your community

地域のグループ — ボーイスカウト、教会、大学、退役軍人のグループや労働組合、もしくは Hour of Code "ブロックパーティー"を地元で開いたりして募集してください。

## 6. Ask a local elected official to support the Hour of Code

[Send this email](<%= hoc_uri('/resources#politicians') %>) to your mayor, city council, or school board. Or [give them this handout](<%= hoc_uri('/resources/hoc-one-pager.pdf') %>) and invite them to visit your school.

<%= view 'popup_window.js' %>