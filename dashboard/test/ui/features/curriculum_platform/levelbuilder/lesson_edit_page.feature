@no_mobile
Feature: Using the Lesson Edit Page

  Scenario: View the lesson edit page
    Given I create a levelbuilder named "Levi"
    And I create a temp script
    And I view the temp script overview page
    And I view the temp script gui edit page

    # Open the lesson edit page
    And I click ".fa-pencil"
    And I switch tabs
    And I wait until element "#edit-container" is visible

    # Match the text 'Editing Lesson "Lesson One"'
    And element "h1" contains text "Editing Lesson"
    And element "h1" contains text "Lesson One"

    And I delete the temp script
