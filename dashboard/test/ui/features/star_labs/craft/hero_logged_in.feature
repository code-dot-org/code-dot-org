Feature: Minecraft hero logged in

  @as_student
  Scenario: Signed in finish dialog
    Given I am on "http://studio.code.org/s/hero/lessons/1/levels/12?noautoplay=true"
    And I wait for the page to fully load
    And I wait until the Minecraft game is loaded
    And I press "runButton"
    And I click selector "button:contains(Finish)" once I see it
    And I wait until element "#continue-button" is visible
    And element "#publish-to-project-gallery-button" is visible
    And element "#save-to-project-gallery-button" is visible

    # capture finish dialog in saucelabs video
    And I wait for 1 second

    # Testing signed out and signed in as two different features due to memory errors
    # in selenium when minecraft levels are run back-to-back on iPhones and iPads
