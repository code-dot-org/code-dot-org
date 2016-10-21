Feature: Text To Speech

# Fully skip, seeing intermittent failures on IE, Safari, possibly others on CircleCI
@skip
Scenario: Listen to TTS Audio
  Given I am on "http://studio.code.org/s/course1/stage/4/puzzle/1?noautoplay=true&enableExperiments=topInstructionsCSF,tts"
  And I rotate to landscape

  Then element "#tts-button" is visible

  When I press "tts-button"
  And I wait until element "audio" is visible

  Then element "#alert-content" does not exist
