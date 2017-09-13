@eyes
Feature: The video fallback player works as expected

Background:
  Given I am on "http://studio.code.org/reset_session"

Scenario: Fallback player
  When I open my eyes to test "fallback player"
  Given I am on "http://studio.code.org/flappy/1?force_youtube_fallback"
  When I rotate to landscape
  And I wait to see "#x-close"
  Then I see ".video-js"
  And I see no difference for "fallback video player for level"
  And I close my eyes

Scenario: Fallback player for unplugged
  When I open my eyes to test "fallback player for unplugged"
  Given I am on "http://studio.code.org/s/course1/stage/1/puzzle/1?force_youtube_fallback"
  When I rotate to landscape
  And I wait to see ".vjs-big-play-button"
  And I see no difference for "fallback video player for unplugged"
  And I close my eyes

Scenario: Fallback player for embedded
  When I open my eyes to test "fallback player for embedded"
  Given I am on "http://studio.code.org/s/allthethings/stage/34/puzzle/1?force_youtube_fallback=1"
  When I rotate to landscape
  And I wait to see ".vjs-big-play-button"
  And I see no difference for "fallback video player for embedded"
  And I close my eyes

@chrome
Scenario: Flash fallback player gets injected in Chrome (assuming Flash is available)
  Given I am on "http://studio.code.org/flappy/1?force_youtube_fallback"
  When I rotate to landscape
  And I wait to see "#x-close"
  Then I see ".video-js"
  Then I see jquery selector object[type='application/x-shockwave-flash']

# no_ie because YouTube's recent change to their player is causing our
#   fallback detection to get a false negative
@no_ie
@no_mobile
Scenario: Normal player
  Given I am on "http://studio.code.org/flappy/1"
  And I wait to see "#x-close"
  When I rotate to landscape
  Then I see "#video"
  Then I see the first Flappy YouTube video with the correct parameters
