@no_older_chrome
Feature: Dance Lab
  Scenario: Song selector is visible
    Given I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
    And element "#song_selector" is visible

  # This test requires cloudfront.
  @no_circle
  @no_firefox
  @no_safari
  Scenario: Restricted audio content is protected
    When I am on "http://studio.code.org/restricted/placeholder.txt"
    Then page text does not contain "placeholder for testing"

    When I am on "http://studio.code.org/s/dance/stage/1/puzzle/1"
    And I wait for the page to fully load
    And I am on "http://studio.code.org/restricted/placeholder.txt"
    Then page text does contain "placeholder for testing"

  Scenario: Can toggle run/reset in DanceLab
    Given I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
    Then I click selector "#runButton" once I see it
    And element "#runButton" is hidden
    And element "#resetButton" is visible
    Then I click selector "#resetButton" once I see it
    Then element "#runButton" is visible
    And element "#resetButton" is hidden

  Scenario: Can get to level success in DanceLab
    Given I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists

    #Run for two measures until level success
    Then I click selector "#runButton" once I see it
    And I wait until element ".congrats" is visible

  @as_student
  Scenario: Dance Party Share
    Given I am on "http://studio.code.org/s/dance/stage/1/puzzle/13?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I close the instructions overlay if it exists

    When I navigate to the shared version of my project
    Then I click selector "#runButton" once I see it
    Then I wait until element "#runButton" is not visible

    Then evaluate JavaScript expression "window.__DanceTestInterface.getSprites().length === 3"
    
    Then I click selector "#resetButton" once I see it
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
