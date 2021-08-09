Feature: Dance Party
  # This test relies on CloudFront signed cookies to access /restricted/ on the
  # test machine, but uses SoundLibraryApi for access in CircleCI.
  Scenario: Restricted audio content is protected
    When I am on "http://studio.code.org/restricted/placeholder.txt"
    Then page text does not contain "placeholder for testing"

    When I am on "http://studio.code.org/s/dance/lessons/1/levels/1"
    And I wait for the page to fully load
    And I am on "http://studio.code.org/restricted/placeholder.txt"
    Then page text does contain "placeholder for testing"

  @no_mobile
  Scenario: Can toggle run/reset in Dance Party
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/2?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I select age 10 in the age dialog
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
    And element "#song_selector" is enabled
    Then I click selector "#runButton" once I see it
    Then I wait until element "#runButton" is not visible
    And element "#resetButton" is visible
    And element "#song_selector" is disabled
    Then I click selector "#resetButton" once I see it
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
    And element "#song_selector" is enabled

  @no_mobile
  Scenario: Can get to level success in Dance Party
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I select age 10 in the age dialog
    And I close the instructions overlay if it exists

    #Run for two measures until level success
    Then I click selector "#runButton" once I see it
    And I wait until element ".congrats" is visible

  @no_mobile
  Scenario: Dance Party 12 loads
    Given I am on "http://studio.code.org/s/dance/lessons/1/levels/12?noautoplay=true"
    And I wait for the page to fully load

  Scenario: Dance Party 8 runs new set tint block
    Given I am on "http://studio.code.org/s/dance/lessons/1/levels/8?noautoplay=true"
    And I wait for the page to fully load
    And I select age 10 in the age dialog
    And I close the instructions overlay if it exists
    # drag the "set tint" block from the toolbox to below "after 4 measures"
    And I drag block "5" to block "14"
    # set the sprite on the new "set tint" block in the workspace
    And I set block "19" to have a value of "top_dancer1" for title "SPRITE"
    And I press "runButton"
    And I wait until element ".congrats" is visible

  @as_student
  @no_mobile
  Scenario: Dance Party Share
    Given I am on "http://studio.code.org/s/dance/lessons/1/levels/13?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for the song selector to load
    And element "#song_selector" has value "cheapthrills_sia"

    When I navigate to the shared version of my project
    And element ".signInOrAgeDialog" is hidden
    Then I click selector "#runButton" once I see it
    Then I wait until element "#runButton" is not visible

    Then evaluate JavaScript expression "window.__DanceTestInterface.getSprites().length === 10"

    Then I click selector "#resetButton" once I see it
    Then element "#runButton" is visible
    And element "#resetButton" is hidden

    And I select the "How it Works (View Code)" small footer item to load a new page
    And I wait for the song selector to load
    And element "#song_selector" has value "cheapthrills_sia"

    # Try the other How it Works button with a queryparam
    # Covers regression https://github.com/code-dot-org/dance-party/issues/527
    When I navigate to the last shared URL with a queryparam
    And I wait until element "#open-workspace" is visible
    Then element "#codeWorkspace" is not visible
    When I click selector "#open-workspace" to load a new page
    And I wait for the song selector to load
    Then element "#codeWorkspace" is visible

  @no_mobile
  Scenario: Dance Party can share while logged out
    Given I am on "http://studio.code.org/s/dance/lessons/1/levels/13?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load

    When I navigate to the shared version of my project
    Then I wait until element "#runButton" is visible
