Feature: Dance Lab Age Filter
  Scenario: Song selector is visible and doesn't display pg13 songs for age < 13
    Given I create a young student named "Harry"
    And I am on "http://studio.code.org/s/allthethings/lessons/37/levels/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "shapeofyou_edsheeran" option in the dropdown "#song_selector"
    And I sign out

  Scenario: Song selector is visible and displays all songs for age > 13 and teacher flag turns filter on
    Given I create a student named "Ron"
    And I am on "http://studio.code.org/s/allthethings/lessons/37/levels/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #synthesize is available on local and shapeofyou_edsheeran is available on test
    And I see option "Synthesize" or "Ed Sheeran - Shape of You" in the dropdown "#song_selector"

    Then I am on "http://studio.code.org/s/allthethings/lessons/37/levels/1?noautoplay=true&songfilter=on"
    And I wait for the page to fully load
    And I wait until I don't see selector "#p5_loading"
    And I wait for the song selector to load
    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "shapeofyou_edsheeran" option in the dropdown "#song_selector"
    And I sign out

  Scenario: Selecting <13 in age dialog turns filter on
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I select age 10 in the age dialog

    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "shapeofyou_edsheeran" option in the dropdown "#song_selector"

  Scenario: Selecting 13 in age dialog turns filter off
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I select age 13 in the age dialog

    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #synthesize is available on local and shapeofyou_edsheeran is available on test
    And I see option "Synthesize" or "Ed Sheeran - Shape of You" in the dropdown "#song_selector"

    # session cookie should persist and no dialog should show up
    Then I am on "http://studio.code.org/s/dance/lessons/1/levels/9"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And element ".age-dialog" is hidden
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #synthesize is available on local and shapeofyou_edsheeran is available on test
    And I see option "Synthesize" or "Ed Sheeran - Shape of You" in the dropdown "#song_selector"

  Scenario: Song selector is hidden when initializing with teacher flag on and teacher flag stays on after level complete
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/1?noautoplay=true&songfilter=on"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And element ".age-dialog" is not visible
    And I close the instructions overlay if it exists

    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "shapeofyou_edsheeran" option in the dropdown "#song_selector"

    #Run for two measures until level success
    Then I click selector "#runButton" once I see it
    And I wait until element ".congrats" is visible
    And I press "continue-button"
    # Make sure continue takes us to next level
    And I wait until current URL contains "/lessons/37/levels/2"
    And I wait for the page to fully load
    And I close the instructions overlay if it exists
    And I wait for the song selector to load
    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "shapeofyou_edsheeran" option in the dropdown "#song_selector"

    And I sign out

  Scenario: Song selector is hidden when initializing with teacher flag on for signed in student
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/1?noautoplay=true&songfilter=on"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And element ".age-dialog" is not visible
    And I close the instructions overlay if it exists

    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "shapeofyou_edsheeran" option in the dropdown "#song_selector"

    And I sign out
