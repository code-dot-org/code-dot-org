@no_mobile
Feature: Manage Assets

# This scenario will be removed when the feature is released.
  Scenario: With the experiment flag off, the manage assets dialog does not contain the option to record audio.
    Given I am a student
    And I start a new Game Lab project
    And I open the Manage Assets dialog
    Then I wait until element "#record-asset" is not visible

# This scenario will be updated when this UI is integrated with the recording library
  Scenario: With the experiment flag on, the manage assets dialog contains the option to record audio.
    Given I am a student
    And I start a new Game Lab project
    And I append "?enableExperiments=recordAudio" to the URL
    And I open the Manage Assets dialog
    Then I click selector "#record-asset" once I see it
    And I wait until element "#stop-record" is visible
    And I am on "http://studio.code.org/home?disableExperiments=recordAudio"