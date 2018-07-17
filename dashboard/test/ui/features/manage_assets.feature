@no_mobile
Feature: Feedback Tab Visibility


# This scenario will be updated when this UI is integrated with the recording library
  Scenario: With the experiment flag on, the manage assets dialog contains the option to record audio.
    Given I am a student
    And I start a new Game Lab project
    And I append "?enableExperiments=recordAudio" to the URL
    And I open the Manage Assets dialog
    Then I wait until element "#record-asset" is visible
    And I wait until element "#stop-record" is visible
    And I am on "http://studio.code.org/home?disableExperiments=recordAudio"