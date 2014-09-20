Feature: The video fallback player works as expected

Background:
  Given I am on "http://learn.code.org/reset_session"

Scenario: Fallback player
  Given I am on "http://learn.code.org/flappy/1?force_youtube_fallback"
  When I rotate to landscape
  Then I see ".video-js"

@chrome
Scenario: Flash fallback player gets injected in Chrome (assuming Flash is available)
  Given I am on "http://learn.code.org/flappy/1?force_youtube_fallback"
  When I rotate to landscape
  Then I see ".video-js"
  Then I see jquery selector object[type='application/x-shockwave-flash']

@no_mobile
Scenario: Normal player
  Given I am on "http://learn.code.org/flappy/1"
  When I rotate to landscape
  Then I see "#video"
  Then I see the first Flappy YouTube video with the correct parameters
