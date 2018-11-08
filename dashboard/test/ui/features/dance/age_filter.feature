@no_older_chrome
Feature: Dance Lab Age Filter
  Scenario: Song selector is visible and doesn't display pg13 songs for age < 13
    Given I create a young student named "Harry"
    And I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
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
    And I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #Jazzy_beats is available on local and isawthesign is available on test
    And I see option "jazzy_beats" or "isawthesign_aceofbase" in the dropdown "#song_selector"

    Then I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true&songfilter=on"
    And I wait for the page to fully load
    And I wait until I don't see selector "#p5_loading"
    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "shapeofyou_edsheeran" option in the dropdown "#song_selector"
    And I sign out

  Scenario: Selecting <13 in age dialog turns filter on
    Given I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And element ".signInOrAgeDialog" is visible
    And I select the "10" option in dropdown "uitest-age-selector"
    And I click selector "#uitest-submit-age"

    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "shapeofyou_edsheeran" option in the dropdown "#song_selector"

  Scenario: Selecting 13 in age dialog turns filter off
    Given I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And element ".signInOrAgeDialog" is visible
    And I select the "13" option in dropdown "uitest-age-selector"
    And I click selector "#uitest-submit-age"

    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #Jazzy_beats is available on local and isawthesign is available on test
    And I see option "jazzy_beats" or "isawthesign_aceofbase" in the dropdown "#song_selector"
