Feature: Dance Lab Age Filter
  Scenario: Song selector is visible and doesn't display pg13 songs for age < 13
    Given I create a young student named "Harry"
    And I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/37/levels/1?noautoplay=true"
    And I wait for the lab page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "badhabit_stevelacy" option in the dropdown "#song_selector"
    And I sign out

  Scenario: Song selector is visible and displays all songs for age > 13 and teacher flag turns filter on
    Given I create a student named "Ron"
    And I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/37/levels/1?noautoplay=true"
    And I wait for the lab page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #synthesize is available on local and badhabit_stevelacy is available on test
    And I see option "Synthesize" or "Steve Lacy - Bad Habit" in the dropdown "#song_selector"

    Then I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/37/levels/1?noautoplay=true&songfilter=on"
    And I reload the page
    And I wait for the lab page to fully load
    And I wait until I don't see selector "#p5_loading"
    And I wait for the song selector to load
    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "badhabit_stevelacy" option in the dropdown "#song_selector"
    And I sign out

  Scenario: Selecting <13 in age dialog turns filter on
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/37/levels/1?noautoplay=true"
    And I wait for the lab page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I select age 10 in the age dialog

    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "badhabit_stevelacy" option in the dropdown "#song_selector"
